import {Request, Response} from "express";
import HttpStatusCode from "http-status-codes";
import {sendError, sendSuccess} from "../utilities/responseHandler";
import Stripe from 'stripe';
import CustomError from "../utilities/customError";
import moment from "moment";
import userBookingModel from "../models/bookings/booking.model";
import appointmentModel from "../models/appointments/appointmentModel";
import {ObjectId} from "mongodb";
import {AppointmentStatus} from "../interfaces/appointments.interface";
import doctorProfileModel, {DEFAULT_CONSULTATION_FEE} from "../models/user/doctorProfile.model";
import {withParticipant} from "../utilities/participantLookup";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const createPaymentIntent = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id.toString();
        const {appointmentId} = req.body;

        if (!appointmentId) {
            throw new CustomError('Appointment Id is required', HttpStatusCode.BAD_REQUEST);
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            throw new CustomError('Appointment not found', HttpStatusCode.NOT_FOUND);
        }

        // Only the patient who holds this slot may pay for it.
        if (appointment.bookedBy?.toString() !== userId) {
            throw new CustomError('This appointment does not belong to you', HttpStatusCode.FORBIDDEN);
        }
        if (appointment.status !== AppointmentStatus.HELD) {
            throw new CustomError(`This appointment is ${appointment.status} and cannot be paid for`, HttpStatusCode.BAD_REQUEST);
        }
        if (appointment.expiresAt && appointment.expiresAt.getTime() <= Date.now()) {
            throw new CustomError('This hold has expired - please book the slot again', HttpStatusCode.BAD_REQUEST);
        }

        // Price comes from the doctor's profile, not a hardcoded constant.
        const doctorProfile = await doctorProfileModel.findOne({userId: appointment.doctor});
        const amount = doctorProfile?.consultationFee ?? DEFAULT_CONSULTATION_FEE;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            description: `Consultation ${appointmentId}`,
            automatic_payment_methods: {enabled: true},
            metadata: {
                appointmentId: appointmentId.toString(),
                userId,
            },
        });

        const paymentClientSecret = paymentIntent.client_secret;
        return sendSuccess(res, {paymentClientSecret, amount, currency: 'usd'}, 'Payment intent created', HttpStatusCode.OK);
    } catch (error: any) {
        return res.status(error.statusCode || HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};

const getMyBookings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id.toString();
        const bookingDetails = await appointmentModel.aggregate([
            {
                $match: {
                    bookedBy: new ObjectId(userId),
                },
            },
            ...withParticipant('doctor', 'doctorprofiles'),
            {$sort: {date: -1 as const, checkupTiming: 1 as const}}
        ]);
        return sendSuccess(res, {bookingDetails}, 'Booking Details fetched successfully', HttpStatusCode.OK);
    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};

const getAllBookingUsers = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id.toString();
        const bookingDetails = await appointmentModel.aggregate([
            {
                $match: {
                    doctor: new ObjectId(userId),
                },
            },
            ...withParticipant('bookedBy', 'patientprofiles'),
            {$sort: {date: -1 as const, checkupTiming: 1 as const}}
        ]);
        return sendSuccess(res, {bookingDetails}, 'Booking Details fetched successfully', HttpStatusCode.OK);
    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};

/**
 * This function use to get the details of the payment from webhook.
 * @param signature
 * @param rawBody
 */

const getDetailsFromWebhook = async (req: any, res: Response) => {
    const signature: any = req.headers['stripe-signature']?.toString();
    const rawBody: any = req.rawBody;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Unverified callers must never reach the booking logic. Previously a missing
    // STRIPE_WEBHOOK_SECRET skipped verification entirely and the handler fell back to
    // two hardcoded ids, so anyone could POST here and confirm someone else's booking.
    if (!endpointSecret) {
        console.error('STRIPE_WEBHOOK_SECRET is not configured - rejecting webhook');
        return res.status(HttpStatusCode.SERVICE_UNAVAILABLE).send({
            status: false,
            message: 'Webhook processing is not configured',
        });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed.', err.message);
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: 'Webhook signature verification failed',
        });
    }

    try {
        const paymentIntent: any = event.data.object;
        const userId = paymentIntent?.metadata?.userId;
        const appointmentId = paymentIntent?.metadata?.appointmentId;

        // Events we do not act on are acknowledged so Stripe stops retrying them.
        const needsBooking = event.type === 'payment_intent.succeeded'
            || event.type === 'payment_intent.payment_failed';
        if (needsBooking && (!userId || !appointmentId)) {
            console.error(`Webhook ${event.type} missing metadata`, {userId, appointmentId});
            return res.status(HttpStatusCode.OK).send({status: true, message: 'Ignored: missing metadata'});
        }
        switch (event.type) {

            case 'payment_intent.succeeded':

                await userBookingModel.create({
                    patientId: userId,
                    appointmentId,
                    status: paymentIntent?.status,
                    paymentReferenceId: paymentIntent?.id,
                    paymentDate: moment.unix(paymentIntent?.created),
                    paymentMethod: paymentIntent?.payment_method,
                    amount: (paymentIntent?.amount / 100),
                    isBooked: true
                });

                // Payment cleared: promote the hold to a confirmed booking and drop the
                // expiry so the slot is no longer reclaimable.
                await appointmentModel.findOneAndUpdate(
                    {_id: new ObjectId(appointmentId)},
                    {$set: {status: AppointmentStatus.CONFIRMED}, $unset: {expiresAt: 1}},
                );

                console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
                break;
            case 'payment_intent.payment_failed':
                console.log("Payment failed.", event.data.object);
                await userBookingModel.create({
                    patientId: userId,
                    appointmentId,
                    status: paymentIntent.status,
                    amount: (paymentIntent.amount / 100),
                    paymentDate: moment.unix(paymentIntent?.created),
                    error: paymentIntent.last_payment_error?.message
                })
                break;
            case 'payment_intent.created': {
                const paymentIntent = event.data.object;
                console.log("Payment intent created", paymentIntent.id);
                break
            }
            case 'charge.succeeded': {
                const paymentIntent = event.data.object;
                console.log("Payment Charge Succeeded", paymentIntent.id);
                break
            }
            default:
                console.log(`Unhandled event type ${event.type}.`);
        }

        // Stripe needs a 2xx or it retries the event with backoff.
        return res.status(HttpStatusCode.OK).send({status: true, received: true});
    } catch (error: any) {
        // Log and return 500 so Stripe retries, rather than throwing out of an async
        // handler where Express cannot see it and the request hangs.
        console.error('Webhook handling failed', error);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({
            status: false,
            message: 'Webhook handling failed',
        });
    }
}

export default {createPaymentIntent, getDetailsFromWebhook, getMyBookings, getAllBookingUsers};