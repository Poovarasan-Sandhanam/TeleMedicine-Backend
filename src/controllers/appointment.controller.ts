import {Request, Response} from "express"
import HttpStatusCode from "http-status-codes"
import {sendSuccess} from "../utilities/responseHandler";
import appointmentModel from "../models/appointments/appointmentModel";
import userModel from "../models/user/user.model";
import doctorProfileModel from "../models/user/doctorProfile.model";
import patientProfileModel from "../models/user/patientProfile.model";
import CustomError from "../utilities/customError";
import moment from "moment";
import {ObjectId} from "mongodb";
import { UserRole, DoctorSpecialization } from "../interfaces/user.interface";

const bookAppointment = async (req: Request, res: Response) => {
    try {
        const {healthIssues, checkupTiming, doctor, notes, date} = req.body;
        const userId = (req as any).user._id

        const userDetails = await userModel.findOne({_id: userId});

        // Check if user is a patient (using both new and legacy systems)
        const isUserPatient = userDetails?.role === UserRole.PATIENT || userDetails?.isDoctor === false;
        
        if (!isUserPatient) {
            throw new CustomError('Only patients are allowed to book appointments', HttpStatusCode.UNPROCESSABLE_ENTITY)
        }

        // Verify the doctor exists and is actually a doctor
        const doctorDetails = await userModel.findOne({_id: doctor});
        const isDoctorValid = doctorDetails?.role === UserRole.DOCTOR || doctorDetails?.isDoctor === true;
        
        if (!isDoctorValid) {
            throw new CustomError('Invalid doctor selected', HttpStatusCode.BAD_REQUEST);
        }

        const appointmentData = await appointmentModel.findOne({doctor, checkupTiming, date});
        if (appointmentData) {
            throw new CustomError('This appointment is already booked', HttpStatusCode.BAD_REQUEST);
        }
        
        const appointmentDetails = await appointmentModel.create({
            healthIssues, checkupTiming, doctor, notes, bookedBy: userId, date
        })

        return sendSuccess(res, appointmentDetails, 'Appointment booked successfully', HttpStatusCode.CREATED);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        })
    }
}

const bookAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const {userId, status} = req.body;

        const appointmentDetails = await appointmentModel.updateOne({
            bookedBy: userId
        }, {$set: {status}})

        return sendSuccess(res, appointmentDetails, 'Appointment booked status changed successfully', HttpStatusCode.CREATED);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        })
    }
}

const getAllAppointments = async (req: Request, res: Response) => {
    try {
        const date: any = req.query.date;
        const userId = (req as any).user._id
        
        // Verify user is a doctor
        const userDetails = await userModel.findOne({_id: userId});
        const isUserDoctor = userDetails?.role === UserRole.DOCTOR || userDetails?.isDoctor === true;
        
        if (!isUserDoctor) {
            throw new CustomError('Only doctors can view appointments', HttpStatusCode.FORBIDDEN);
        }

        const pipeline = [
            {
                $addFields: {
                    formattedDate: {
                        $dateToString: {
                            format: '%d-%m-%Y',
                            date: '$createdAt'
                        }
                    }
                }
            },
            {
                $match: {
                    doctor: new ObjectId(userId),
                    formattedDate: date
                }
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
        ];

        const bookingDetails = await appointmentModel.aggregate(pipeline);

        return sendSuccess(res, bookingDetails, 'Appointment Details fetched successfully', HttpStatusCode.OK);

    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        })
    }
}

const getAllDoctors = async (req: Request, res: Response) => {
    try {
        // Generate Slots Based on String Timing
        function generateSlotsFromString(timingStr: any) {
            const [start, end] = timingStr.match(/\d+/g).map(Number);
            const [startPeriod, endPeriod] = timingStr.match(/(AM|PM)/g);

            function convertTo24Hour(hour: any, period: any) {
                if (period === 'PM' && hour !== 12) return hour + 12;
                if (period === 'AM' && hour === 12) return 0;
                return hour;
            }

            const startHour = convertTo24Hour(start, startPeriod);
            const endHour = convertTo24Hour(end, endPeriod);

            let slots = [];
            for (let hour = startHour; hour < endHour; hour++) {
                let slot = `${hour}-${hour + 1}`;
                slots.push(slot);
            }
            return slots;
        }

        function formatSlots(slots: any, appointmentDetails: any) {
            // Extract booked times from appointment details
            const bookedSlots = appointmentDetails.map((app: any) => app.checkupTiming);

            // Filter and format the slots
            const formattedSlots = slots.map((slot: any) => {
                let isBooked = false;
                let newDate;
                if (bookedSlots?.length) {
                    isBooked = bookedSlots.includes(slot);
                    newDate = appointmentDetails.find((app: any) =>
                        app.checkupTiming = slot
                    ).date;

                }
                return {
                    slotTiming: slot,
                    isBooked: isBooked,
                    date: moment(selectedDate as string).format('DD-MM-YYYY')
                };

            });

            return formattedSlots;
        }


        const healthIssues: Record<string, string> = {
            // General Practitioner (GP)
            'Common illnesses': 'General Practitioner (GP)',
            'Minor injuries': 'General Practitioner (GP)',
            'Routine check-ups': 'General Practitioner (GP)',
            'Vaccinations': 'General Practitioner (GP)',
            'Preventive care': 'General Practitioner (GP)',

            // Cardiologist
            'Heart pain': 'Cardiologist',
            'Hypertension': 'Cardiologist',

            // Pediatrician
            'Growth disorders': 'Pediatrician',
            'Infections': 'Pediatrician',
            'Childhood illnesses': 'Pediatrician',

            // Orthopedic Surgeon
            'Fractures': 'Orthopedic Surgeon',
            'Arthritis': 'Orthopedic Surgeon',
            'Sports injuries': 'Orthopedic Surgeon',
            'Spinal deformities': 'Orthopedic Surgeon',

            // Gynecologist
            'Menstrual issues': 'Gynecologist',
            'Pelvic pain': 'Gynecologist',
            'Ovarian cysts': 'Gynecologist',

            // Obstetrician (OB)
            'Prenatal care': 'Obstetrician (OB)',
            'Pregnancy': 'Obstetrician (OB)',
            'Childbirth': 'Obstetrician (OB)',
            'Postpartum care': 'Obstetrician (OB)',

            // Dermatologist
            'Skin Problem': 'Dermatologist',
            'Hair Problem': 'Dermatologist',
            'Nail Problem': 'Dermatologist',

            // Endocrinologist
            'Diabetes': 'Endocrinologist',
            'Thyroid disorders': 'Endocrinologist',
            'Adrenal gland issues': 'Endocrinologist',

            // Neurologist
            'Brain pain': 'Neurologist',
            'Spinal cord pain': 'Neurologist',
            'Nerves pain': 'Neurologist',

            // Psychiatrist
            'Depression': 'Psychiatrist',
            'Anxiety': 'Psychiatrist',
            'Schizophrenia': 'Psychiatrist',
            'Bipolar disorder': 'Psychiatrist',

            // Gastroenterologist
            'IBS': 'Gastroenterologist',
            'Ulcers': 'Gastroenterologist',
            'Crohn’s disease': 'Gastroenterologist',
            'Liver disorders': 'Gastroenterologist',

            // Pulmonologist
            'Asthma': 'Pulmonologist',
            'COPD': 'Pulmonologist',
            'Pneumonia': 'Pulmonologist',

            // Oncologist
            'Breast cancer': 'Oncologist',
            'Lung cancer': 'Oncologist',
            'Leukemia': 'Oncologist',
            'Lymphoma': 'Oncologist',

            // Ophthalmologist
            'Eye disorders': 'Ophthalmologist',

            // Urologist
            'Kidney stones': 'Urologist',
            'Prostate issues': 'Urologist',
        };

        const {issue, id, selectedDate} = req.query;

        // Find by health issue
        if (issue) {
            const specialization = healthIssues[issue as string];
            if (!specialization) {
                return res.status(HttpStatusCode.NOT_FOUND).send({
                    status: false,
                    message: 'Health issue not recognized.',
                });
            }

            const doctorDetails = await userModel.find({role: UserRole.DOCTOR, specialization: specialization});
            if (!doctorDetails.length) {
                return res.status(HttpStatusCode.NOT_FOUND).send({
                    status: false,
                    message: `No doctors found for ${issue}.`,
                });
            }

            return sendSuccess(res, doctorDetails, 'Doctor List Fetched Successfully', HttpStatusCode.OK);
        }

        // Find by doctor ID
        if (id) {

            const doctorDetails = await doctorProfileModel.findOne({userId: id}, {'consultationTiming': 1});
            if (!doctorDetails) {

                return res.status(HttpStatusCode.NOT_FOUND).send({
                    status: false,
                    message: 'Doctor not found.',
                });
            }
            const slotsRes = generateSlotsFromString(doctorDetails.consultationTiming);
            const appointmentDetails = await appointmentModel.find({doctor: id, date: selectedDate});

            const slots = formatSlots(slotsRes, appointmentDetails);
            return sendSuccess(res, {slots}, 'Doctor Details Fetched Successfully', HttpStatusCode.OK);
        }

        // Fetch all doctors
        const doctors = await userModel.aggregate([
            {$match: {role: UserRole.DOCTOR}},
            {
                $lookup: {
                    from: 'doctorprofiles',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profileDetails'
                }
            },
            {
                $unwind: {
                    path: '$profileDetails',
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);

        if (!doctors.length) {
            return res.status(HttpStatusCode.NOT_FOUND).send({
                status: false,
                message: 'No doctors available.',
            });
        }

        return sendSuccess(res, doctors, 'Doctor List Fetched Successfully', HttpStatusCode.OK);
    } catch (error: any) {
        return res.status(HttpStatusCode.BAD_REQUEST).send({
            status: false,
            message: error.message,
        });
    }
};


export default {bookAppointment, getAllDoctors, getAllAppointments, bookAppointmentStatus}
