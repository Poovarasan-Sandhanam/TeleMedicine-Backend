import {Request, Response} from "express";
import HttpStatusCode from "http-status-codes";
import {sendError, sendSuccess} from "../utilities/responseHandler";
import Stripe from 'stripe';
import CustomError from "../utilities/customError";
import moment from "moment";
import userBookingModel from "../models/bookings/booking.model";
import appointmentModel from "../models/appointments/appointmentModel";
import {ObjectId} from "mongodb";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const createPaymentIntent = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id.toString(); // Convert userId to a string
        const {appointmentId} = req.body;

        if (!userId) {
            throw new CustomError('User Id is required', HttpStatusCode.NOT_FOUND);
        }
        if (!appointmentId) {
            throw new CustomError('Appointment Id is required', HttpStatusCode.NOT_FOUND);
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 100,
            currency: 'usd',
            description: '',
            automatic_payment_methods: {enabled: true},
            metadata: {
                appointmentId: appointmentId.toString(),
                userId,
            },
        });

        const paymentClientSecret = paymentIntent.client_secret;
        return sendSuccess(res, {paymentClientSecret}, 'Appointment booked successfully', HttpStatusCode.OK);
    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
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
            {
                $lookup: {
                    from: 'users',
                    localField: 'doctor',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true
                }
            }
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
            {
                $lookup: {
                    from: 'users',
                    localField: 'bookedBy',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true
                }
            }
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
    try {
        const signature: any = req.headers['stripe-signature']?.toString();
        const rawBody: any = req.rawBody;
        let event;
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

        if (endpointSecret) {
            try {
                event = stripe.webhooks.constructEvent(
                    rawBody,
                    signature,
                    endpointSecret
                );
            } catch (err: any) {
                console.log(`Webhook signature verification failed.`, err.message);
                throw new CustomError('Webhook signature verification failed', HttpStatusCode.BAD_REQUEST);
            }
        }
        const paymentIntent: any = event?.data.object;
        const userId = paymentIntent?.metadata?.userId ?? '676597637f31bfa789cc12c0'
        const appointmentId = paymentIntent?.metadata?.appointmentId ?? '67782a0a24b1fe15d2f84749'

        if (!userId) {
            return res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: 'Patient Id is required',
            });
        }
        if (!appointmentId) {
            return res.status(HttpStatusCode.BAD_REQUEST).send({
                status: false,
                message: 'Appointment Id is required',
            });
        }
        switch (event?.type) {

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

                await appointmentModel.findOneAndUpdate(
                    {_id: new ObjectId(appointmentId)},
                    {$set: {status: "Success"}},
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
                console.log(`Unhandled event type ${event?.type}.`);
        }
    } catch (error: any) {
        throw new CustomError(error.statusCode, error.message)
    }
}

export default {createPaymentIntent, getDetailsFromWebhook, getMyBookings, getAllBookingUsers};