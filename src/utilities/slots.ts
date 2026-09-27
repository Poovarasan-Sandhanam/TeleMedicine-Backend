import { AppointmentStatus, BLOCKING_STATUSES } from "../interfaces/appointments.interface";

const to24 = (hour: number, period: string) => {
    if (period === 'PM' && hour !== 12) return hour + 12;
    if (period === 'AM' && hour === 12) return 0;
    return hour;
};

/**
 * Hour-long slots ("9-10", "23-0") for a consultation window such as
 * "6 AM - 2 PM (Morning)". Overnight windows ("10 PM - 6 AM") wrap past midnight;
 * counting straight up from start to end used to produce no slots for them.
 */
export const generateSlots = (timing: string): string[] => {
    const hours = timing?.match(/\d+/g)?.map(Number);
    const periods = timing?.match(/(AM|PM)/g);
    if (!hours || hours.length < 2 || !periods || periods.length < 2) {
        return [];
    }
    const start = to24(hours[0], periods[0]);
    let end = to24(hours[1], periods[1]);
    if (end <= start) {
        end += 24;
    }
    const slots: string[] = [];
    for (let hour = start; hour < end; hour++) {
        slots.push(`${hour % 24}-${(hour + 1) % 24}`);
    }
    return slots;
};

/** Start hour of a slot string. */
export const slotHour = (slot: string) => Number(slot.split('-')[0]);

/**
 * Matches appointments that currently occupy a slot: anything confirmed or completed,
 * plus holds still inside their payment window. Expired holds are excluded, so an
 * abandoned checkout releases the slot without any background job having to run.
 */
export const occupiesSlot = () => ({
    $or: [
        {status: {$in: BLOCKING_STATUSES}},
        {status: AppointmentStatus.HELD, expiresAt: {$gt: new Date()}}
    ]
});
