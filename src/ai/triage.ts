import OpenAI from 'openai';
import moment from 'moment';
import { DoctorSpecialization } from '../interfaces/user.interface';
import { HEALTH_ISSUE_SPECIALTY } from './specialtyKeywords';
import { RedFlag, screenRedFlags } from './redFlags';

export type Urgency = 'emergency' | 'urgent' | 'routine';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'any';

/** What the patient asked for, in a shape the matcher can act on. */
export interface CareIntent {
    /** Short neutral restatement, shown back to the patient and used as the booking reason. */
    summary: string;
    specialty: DoctorSpecialization;
    urgency: Urgency;
    redFlags: RedFlag[];
    /** Requested day as YYYY-MM-DD, or null for "as soon as possible". */
    day: string | null;
    timeOfDay: TimeOfDay;
    doctorGender: 'Female' | 'Male' | null;
    language: string | null;
    /** Whether the language model or the keyword rules produced this. */
    source: 'ai' | 'rules';
}

/** The patient's local "now", so "today" and past slots are judged in their timezone. */
export interface ClientNow {
    date: string;
    hour: number;
}

const SPECIALTIES = Object.values(DoctorSpecialization) as string[];
const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Urdu', 'Punjabi', 'Gujarati',
    'Marathi', 'Arabic', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Polish', 'Mandarin', 'Cantonese', 'Chinese'];

// Keyword fallback, most specific first. Named issues from HEALTH_ISSUE_SPECIALTY are checked before these.
const KEYWORDS: [RegExp, DoctorSpecialization][] = [
    [/\b(pregnan|expecting a baby|antenatal|prenatal|postpartum)/, DoctorSpecialization.OBSTETRICIAN],
    [/\b(my|our)\s+(baby|son|daughter|child|kid|toddler|infant)\b|\bchild'?s\b/, DoctorSpecialization.PEDIATRICIAN],
    [/\b(heart|chest|palpitation|blood pressure|hypertension|cholesterol)/, DoctorSpecialization.CARDIOLOGIST],
    [/\b(skin|rash|acne|eczema|psoriasis|itch|mole|hair loss|dandruff|nail)/, DoctorSpecialization.DERMATOLOGIST],
    [/\b(period|menstrua|pelvic|vaginal|ovar|pcos|menopaus)/, DoctorSpecialization.GYNECOLOGIST],
    [/\b(diabet|blood sugar|thyroid|hormone|insulin)/, DoctorSpecialization.ENDOCRINOLOGIST],
    [/\b(headache|migraine|numb|tingling|dizz|vertigo|memory|tremor)/, DoctorSpecialization.NEUROLOGIST],
    [/\b(anxi|depress|stress|panic|mood|insomnia|can'?t sleep|mental health)/, DoctorSpecialization.PSYCHIATRIST],
    [/\b(stomach|abdomen|abdominal|tummy|nause|vomit|diarrh|constipat|acid|reflux|heartburn|bloat|liver)/, DoctorSpecialization.GASTROENTEROLOGIST],
    [/\b(cough|breath|asthma|wheez|lung|bronch)/, DoctorSpecialization.PULMONOLOGIST],
    [/\b(eye|vision|sight|blurr)/, DoctorSpecialization.OPHTHALMOLOGIST],
    [/\b(urin|pee|bladder|kidney|prostate)/, DoctorSpecialization.UROLOGIST],
    [/\b(joint|knee|hip|back pain|spine|bone|fracture|sprain|shoulder|ankle|wrist)/, DoctorSpecialization.ORTHOPEDIC_SURGEON],
    [/\b(cancer|tumou?r|chemo)/, DoctorSpecialization.ONCOLOGIST],
];

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const summarise = (message: string) => {
    const first = message.trim().split(/(?<=[.!?])\s/)[0] ?? message;
    const clean = first.replace(/\s+/g, ' ').trim();
    return clean.length > 120 ? `${clean.slice(0, 117)}...` : clean;
};

const ruleDay = (text: string, now: ClientNow): string | null => {
    const today = moment(now.date, 'YYYY-MM-DD');
    if (/\b(today|tonight|this (morning|afternoon|evening))\b/.test(text)) return today.format('YYYY-MM-DD');
    if (/\b(tomorrow|tmrw)\b/.test(text)) return today.clone().add(1, 'day').format('YYYY-MM-DD');
    const wd = WEEKDAYS.findIndex(d => new RegExp(`\\b${d}\\b`).test(text));
    if (wd >= 0) {
        const ahead = (wd - today.day() + 7) % 7 || 7;
        return today.clone().add(ahead, 'days').format('YYYY-MM-DD');
    }
    return null;
};

// A time of day only counts as a preference with a scheduling cue, so symptoms such
// as "morning sickness" or "coughing at night" are not read as booking requests.
const CUE = '(in the|this|tomorrow|today|on \\w+day|next \\w+day|any|an?|next)';
const ruleTimeOfDay = (text: string): TimeOfDay => {
    const pref = (period: string) =>
        new RegExp(`\\b${CUE}\\s+${period}\\b|\\b${period}\\s+(appointment|slot|visit|please|if possible|works)\\b`).test(text);
    if (pref('morning') || /\bbefore (noon|midday)\b/.test(text) || /\b([6-9]|1[01])\s?am\b/.test(text)) return 'morning';
    if (pref('afternoon') || /\bafter lunch\b/.test(text) || /\b(12|[1-4])\s?pm\b/.test(text)) return 'afternoon';
    if (pref('evening') || /\b(tonight|after work)\b/.test(text) || /\b(after )?([5-9]|1[01])\s?pm\b/.test(text)) return 'evening';
    return 'any';
};

/** Keyword-only understanding: used when the model is unavailable, and as a backstop. */
export const extractWithRules = (message: string, now: ClientNow): CareIntent => {
    const text = message.toLowerCase();
    const named = Object.keys(HEALTH_ISSUE_SPECIALTY).find(k => text.includes(k.toLowerCase()));
    const keyword = KEYWORDS.find(([re]) => re.test(text));
    const specialty = (named ? HEALTH_ISSUE_SPECIALTY[named] : keyword?.[1] ?? DoctorSpecialization.GENERAL_PRACTITIONER) as DoctorSpecialization;
    const redFlags = screenRedFlags(message);
    const urgent = /\b(severe|getting worse|worsening|unbearable|high fever|can'?t (walk|eat|sleep)|for (\d+|several|many) weeks)\b/.test(text);
    const language = LANGUAGES.find(l => new RegExp(`\\b${l.toLowerCase()}\\b`).test(text)) ?? null;
    return {
        summary: summarise(message),
        specialty,
        urgency: redFlags.length ? 'emergency' : urgent ? 'urgent' : 'routine',
        redFlags,
        day: ruleDay(text, now),
        timeOfDay: ruleTimeOfDay(text),
        doctorGender: /\b(female|woman|lady)\s+(doctor|gp|dr)\b/.test(text) ? 'Female'
            : /\b(male|man)\s+(doctor|gp|dr)\b/.test(text) ? 'Male' : null,
        language,
        source: 'rules',
    };
};

const SYSTEM_PROMPT = (now: ClientNow) => `You help patients of a telemedicine app reach the right kind of doctor.
You do NOT diagnose, name conditions, or give medical advice. You only classify the request.

Today is ${moment(now.date, 'YYYY-MM-DD').format('dddd YYYY-MM-DD')} and the patient's local hour is ${now.hour}.

Return ONLY a JSON object with exactly these keys:
- "summary": one neutral sentence restating the patient's concern in their own terms, max 120 characters, no diagnosis.
- "specialty": exactly one of ${JSON.stringify(SPECIALTIES)}. Use "General Practitioner (GP)" when unsure or for general symptoms.
- "urgency": "emergency" if it could be life-threatening now (e.g. chest pain with breathlessness, stroke signs, severe bleeding, trouble breathing, suicidal thoughts), "urgent" if it should be seen within a day or two, otherwise "routine".
- "day": the requested day as "YYYY-MM-DD", or null if no day was given.
- "timeOfDay": "morning", "afternoon", "evening", or "any".
- "doctorGender": "Female", "Male", or null.
- "language": a language the patient asked the doctor to speak, or null.`;

let client: OpenAI | null = null;
const getClient = () => {
    if (!process.env.OPENAI_API_KEY) return null;
    if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 12000, maxRetries: 1 });
    return client;
};

type ChatClient = Pick<OpenAI, 'chat'>;

/** Model output is untrusted: every field is checked, and anything invalid falls back to the rules' value. */
const sanitise = (raw: any, fallback: CareIntent, now: ClientNow): CareIntent => {
    const day = typeof raw?.day === 'string' && moment(raw.day, 'YYYY-MM-DD', true).isValid()
        && moment(raw.day).isBetween(moment(now.date).subtract(1, 'day'), moment(now.date).add(30, 'days'))
        ? raw.day : fallback.day;
    return {
        summary: typeof raw?.summary === 'string' && raw.summary.trim() ? raw.summary.trim().slice(0, 140) : fallback.summary,
        specialty: SPECIALTIES.includes(raw?.specialty) ? raw.specialty : fallback.specialty,
        urgency: ['emergency', 'urgent', 'routine'].includes(raw?.urgency) ? raw.urgency : fallback.urgency,
        redFlags: fallback.redFlags,
        day,
        timeOfDay: ['morning', 'afternoon', 'evening', 'any'].includes(raw?.timeOfDay) ? raw.timeOfDay : fallback.timeOfDay,
        doctorGender: raw?.doctorGender === 'Female' || raw?.doctorGender === 'Male' ? raw.doctorGender : fallback.doctorGender,
        language: typeof raw?.language === 'string' && raw.language.trim() ? raw.language.trim().slice(0, 30) : fallback.language,
        source: 'ai',
    };
};

/**
 * Understand a patient's request.
 *
 * Emergency rules run first and short-circuit: the model is never asked about a
 * message that already matches a red flag. Otherwise the model classifies it; if
 * the model is unconfigured or fails, keyword rules answer instead. The model
 * only ever sees the message text - never the patient's name or records.
 */
export const understandRequest = async (message: string, now: ClientNow, chat: ChatClient | null = getClient()): Promise<CareIntent> => {
    const rules = extractWithRules(message, now);
    if (rules.redFlags.length || !chat) {
        return rules;
    }
    try {
        const completion = await chat.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            temperature: 0,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: SYSTEM_PROMPT(now) },
                { role: 'user', content: message },
            ],
        });
        const raw = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
        return sanitise(raw, rules, now);
    } catch (error) {
        console.warn('[triage] model unavailable, using keyword rules:', error instanceof Error ? error.message : error);
        return rules;
    }
};
