import mongoose from "mongoose";

/**
 * Appointment lifecycle.
 *
 * held      - slot reserved while the patient completes payment; expires at `expiresAt`
 * confirmed - payment succeeded (set by the Stripe webhook); the slot is now the patient's
 * completed - the consultation took place
 * cancelled - released by the patient or the doctor before it happened
 */
export enum AppointmentStatus {
    HELD = 'held',
    CONFIRMED = 'confirmed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

/** Statuses that occupy a slot and therefore block re-booking. */
export const BLOCKING_STATUSES = [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED
];

export interface IAppointments {
    notes: string,
    doctor: mongoose.Types.ObjectId | string,
    bookedBy: mongoose.Types.ObjectId | string,
    healthIssue: string,
    checkupTiming: string,
    status: AppointmentStatus,
    date: Date,
    /** Only set while `status` is `held`. Past this instant the slot is free again. */
    expiresAt?: Date,
    cancelledBy?: mongoose.Types.ObjectId | string,
    cancelledAt?: Date
}
