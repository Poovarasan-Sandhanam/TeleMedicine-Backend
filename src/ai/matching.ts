import moment from 'moment';
import appointmentModel from '../models/appointments/appointmentModel';
import { listBookableDoctors } from '../services/doctorDirectory';
import { generateSlots, occupiesSlot, slotHour } from '../utilities/slots';
import { CareIntent, ClientNow, TimeOfDay } from './triage';

export interface Suggestion {
    doctor: {
        userId: string;
        fullName: string;
        specialization: string;
        experience?: number;
        gender?: string;
        languages?: string[];
        profileImage?: string;
        consultationTiming?: string;
    };
    /** YYYY-MM-DD */
    date: string;
    /** "9-10" */
    slot: string;
}

export interface MatchResult {
    suggestions: Suggestion[];
    /** Preferences dropped because no doctor satisfied them. */
    relaxed: ('doctorGender' | 'language')[];
    /** True when nothing fitted the requested day or time and a wider search was used. */
    widened: boolean;
}

const WINDOWS: Record<Exclude<TimeOfDay, 'any'>, [number, number]> = {
    morning: [6, 12],
    afternoon: [12, 17],
    evening: [17, 24],
};

const SEARCH_DAYS = 7;
const MAX_PER_DOCTOR = 2;

const inWindow = (hour: number, timeOfDay: TimeOfDay) =>
    timeOfDay === 'any' || (hour >= WINDOWS[timeOfDay][0] && hour < WINDOWS[timeOfDay][1]);

/**
 * Free slots for the intent's specialty, earliest first. Plain database logic: the
 * language model only chose the specialty and preferences; it never sees doctors
 * or books anything. Nothing here writes - the patient confirms before booking.
 */
export const findSuggestions = async (intent: CareIntent, now: ClientNow, limit = 5): Promise<MatchResult> => {
    let doctors = await listBookableDoctors({ specialization: intent.specialty });
    const relaxed: MatchResult['relaxed'] = [];

    // Honour preferences where possible; drop one rather than show nothing.
    if (intent.doctorGender) {
        const matching = doctors.filter(d => String(d.gender ?? '').toLowerCase() === intent.doctorGender!.toLowerCase());
        if (matching.length) doctors = matching; else relaxed.push('doctorGender');
    }
    if (intent.language) {
        const lang = intent.language.toLowerCase();
        const matching = doctors.filter(d => (d.languages ?? []).some((l: string) => l.toLowerCase() === lang));
        if (matching.length) doctors = matching; else relaxed.push('language');
    }
    if (!doctors.length) {
        return { suggestions: [], relaxed, widened: false };
    }

    const today = moment(now.date, 'YYYY-MM-DD');
    const allDays = Array.from({ length: SEARCH_DAYS }, (_, i) => today.clone().add(i, 'days').format('YYYY-MM-DD'));
    const requestedDays = intent.day ? [intent.day] : allDays;
    const searchDays = Array.from(new Set([...requestedDays, ...allDays]));

    const taken = await appointmentModel.find({
        doctor: { $in: doctors.map(d => d.userId) },
        date: { $in: searchDays.map(d => new Date(d)) },
        ...occupiesSlot(),
    }).select('doctor date checkupTiming').lean();
    const takenKey = new Set(taken.map(a => `${a.doctor}|${moment.utc(a.date).format('YYYY-MM-DD')}|${a.checkupTiming}`));

    const collect = (days: string[], timeOfDay: TimeOfDay) => {
        const free: Suggestion[] = [];
        for (const day of days) {
            for (const d of doctors) {
                for (const slot of generateSlots(d.consultationTiming)) {
                    const hour = slotHour(slot);
                    if (day === now.date && hour <= now.hour) continue;
                    if (!inWindow(hour, timeOfDay)) continue;
                    if (takenKey.has(`${d.userId}|${day}|${slot}`)) continue;
                    free.push({
                        doctor: {
                            userId: String(d.userId),
                            fullName: d.fullName ?? d.name,
                            specialization: d.specialization,
                            experience: d.experience,
                            gender: d.gender,
                            languages: d.languages,
                            profileImage: d.profileImage,
                            consultationTiming: d.consultationTiming,
                        },
                        date: day,
                        slot,
                    });
                }
            }
        }
        free.sort((a, b) => a.date.localeCompare(b.date) || slotHour(a.slot) - slotHour(b.slot));
        // Spread options across doctors before offering a second time with the same one.
        const perDoctor = new Map<string, number>();
        const picked: Suggestion[] = [];
        for (const s of free) {
            const n = perDoctor.get(s.doctor.userId) ?? 0;
            if (n < MAX_PER_DOCTOR && picked.length < limit) {
                picked.push(s);
                perDoctor.set(s.doctor.userId, n + 1);
            }
        }
        // With few doctors the cap would leave the list short; fill with the next earliest.
        for (const s of free) {
            if (picked.length >= limit) break;
            if (!picked.includes(s)) picked.push(s);
        }
        return picked.sort((a, b) => a.date.localeCompare(b.date) || slotHour(a.slot) - slotHour(b.slot));
    };

    const exact = collect(requestedDays, intent.timeOfDay);
    if (exact.length) {
        return { suggestions: exact, relaxed, widened: false };
    }
    // Nothing on the requested day/time: offer the soonest times instead, and say so.
    return { suggestions: collect(allDays, 'any'), relaxed, widened: true };
};
