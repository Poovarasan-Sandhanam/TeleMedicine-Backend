/**
 * Evaluation set for patient triage. Run with `npm test`.
 *
 * Safety expectations live here: every emergency case must be flagged, and common
 * non-emergencies (including negated symptoms) must not be. Add a case whenever a
 * real message is misclassified.
 */
import { screenRedFlags } from '../redFlags';
import { extractWithRules, understandRequest } from '../triage';
import { DoctorSpecialization as S } from '../../interfaces/user.interface';

const now = { date: '2026-09-28', hour: 10 }; // a Monday
let pass = 0;
let fail = 0;
const check = (label: string, ok: boolean, detail = '') => {
    if (ok) { pass++; } else { fail++; console.log(`  FAIL  ${label}  ${detail}`); }
};

// --- Must be flagged as emergencies --------------------------------------------
const EMERGENCIES: [string, string][] = [
    ['Crushing chest pain and I feel sweaty', 'cardiac'],
    ['I have chest pain and I can\'t breathe properly', 'cardiac'],
    ['tight chest, pain going down my left arm', 'cardiac'],
    ['my dad\'s face is drooping on one side and his speech is slurred', 'stroke'],
    ['sudden weakness on one side of my body', 'stroke'],
    ['I can\'t breathe', 'breathing'],
    ['my son is choking', 'breathing'],
    ['her lips are turning blue', 'breathing'],
    ['my mum collapsed and is unresponsive', 'unconscious'],
    ['he is having a seizure', 'unconscious'],
    ['cut my hand and it won\'t stop bleeding', 'bleeding'],
    ['I\'ve been vomiting blood', 'bleeding'],
    ['my throat is swelling after eating peanuts', 'anaphylaxis'],
    ['worst headache of my life, came on suddenly', 'headache'],
    ['I think I took an overdose', 'poisoning'],
    ['I want to kill myself', 'self-harm'],
    ['I\'ve been thinking about ending it all', 'self-harm'],
    ['I keep hurting myself', 'self-harm'],
    ['I don\'t want to live anymore', 'self-harm'],
    ['everyone would be better off if I was dead', 'self-harm'],
    ['I feel like there is no point in living', 'self-harm'],
];
for (const [msg, id] of EMERGENCIES) {
    const flags = screenRedFlags(msg);
    check(`emergency: "${msg}"`, flags.some(f => f.id === id), `got [${flags.map(f => f.id)}]`);
}
check('self-harm is marked as a crisis', screenRedFlags('I want to die').some(f => f.crisis === true));

// --- Must NOT be flagged ---------------------------------------------------------
const ROUTINE = [
    'I get chest tightness when I run, can I see someone tomorrow morning?',
    'No chest pain, just a cough for two weeks',
    'I don\'t have chest pain but my blood pressure is high',
    'itchy rash on my arm for a week',
    'my child has had a fever since yesterday',
    'I need a routine check-up',
    'feeling anxious and not sleeping well',
    'my knee hurts when I climb stairs',
    'I have a mild headache most afternoons',
    'bleeding gums when I brush my teeth',
    'can I end my appointment early?',
    'my back pain is killing me',
];
for (const msg of ROUTINE) {
    const flags = screenRedFlags(msg);
    check(`not an emergency: "${msg}"`, flags.length === 0, `got [${flags.map(f => f.id)}]`);
}

// --- Specialty from keywords (fallback path) -------------------------------------
const SPECIALTY: [string, S][] = [
    ['I get chest tightness when I run', S.CARDIOLOGIST],
    ['high blood pressure readings at home', S.CARDIOLOGIST],
    ['itchy rash on my arm for a week', S.DERMATOLOGIST],
    ['my daughter has an ear infection', S.PEDIATRICIAN],
    ['my knee hurts when I climb stairs', S.ORTHOPEDIC_SURGEON],
    ['I think I might be pregnant', S.OBSTETRICIAN],
    ['my periods have been very painful', S.GYNECOLOGIST],
    ['my blood sugar keeps going up', S.ENDOCRINOLOGIST],
    ['migraines twice a week', S.NEUROLOGIST],
    ['feeling anxious and not sleeping well', S.PSYCHIATRIST],
    ['stomach pain and bloating after meals', S.GASTROENTEROLOGIST],
    ['wheezing and a cough that won\'t go', S.PULMONOLOGIST],
    ['blurry vision in my left eye', S.OPHTHALMOLOGIST],
    ['it hurts when I pee', S.UROLOGIST],
    ['I have a cold and feel run down', S.GENERAL_PRACTITIONER],
    ['I need a routine check-up', S.GENERAL_PRACTITIONER],
];
for (const [msg, want] of SPECIALTY) {
    const got = extractWithRules(msg, now).specialty;
    check(`specialty: "${msg}"`, got === want, `got ${got}, want ${want}`);
}

// --- Preferences -----------------------------------------------------------------
const pref = extractWithRules('rash, can I see a female doctor who speaks Tamil tomorrow morning?', now);
check('day: tomorrow', pref.day === '2026-09-29', String(pref.day));
check('time: morning', pref.timeOfDay === 'morning', pref.timeOfDay);
check('gender: female', pref.doctorGender === 'Female', String(pref.doctorGender));
check('language: Tamil', pref.language === 'Tamil', String(pref.language));
check('weekday resolves to the next one', extractWithRules('migraine, friday please', now).day === '2026-10-02');
check('no day given -> null', extractWithRules('migraine', now).day === null);
check('"I am" is not a morning preference', extractWithRules('I am feeling dizzy', now).timeOfDay === 'any');
check('"morning sickness" is not a preference', extractWithRules('morning sickness, pregnant', now).timeOfDay === 'any');

// --- Model path: output is untrusted ---------------------------------------------
const fakeModel = (content: string | Error) => ({
    chat: { completions: { create: async () => {
        if (content instanceof Error) throw content;
        return { choices: [{ message: { content } }] };
    } } },
}) as any;

(async () => {
    const good = await understandRequest('skin rash for a week', now, fakeModel(JSON.stringify({
        summary: 'Rash for a week', specialty: 'Dermatologist', urgency: 'routine',
        day: '2026-09-29', timeOfDay: 'afternoon', doctorGender: null, language: null,
    })));
    check('model result used when valid', good.source === 'ai' && good.specialty === S.DERMATOLOGIST && good.timeOfDay === 'afternoon');

    const invented = await understandRequest('skin rash for a week', now, fakeModel(JSON.stringify({
        specialty: 'Wizard', urgency: 'whenever', day: '1999-01-01', timeOfDay: 'midnight', doctorGender: 'Robot',
    })));
    check('invented specialty falls back to rules', invented.specialty === S.DERMATOLOGIST, invented.specialty);
    check('invalid urgency falls back', invented.urgency === 'routine', invented.urgency);
    check('out-of-range day rejected', invented.day === null, String(invented.day));
    check('invalid time of day rejected', invented.timeOfDay === 'any', invented.timeOfDay);
    check('invalid gender rejected', invented.doctorGender === null, String(invented.doctorGender));

    const garbage = await understandRequest('skin rash', now, fakeModel('not json at all'));
    check('unparseable output falls back to rules', garbage.source === 'rules' && garbage.specialty === S.DERMATOLOGIST);

    const down = await understandRequest('skin rash', now, fakeModel(new Error('timeout')));
    check('model error falls back to rules', down.source === 'rules');

    let called = false;
    const spy = { chat: { completions: { create: async () => { called = true; return { choices: [] }; } } } } as any;
    const emergency = await understandRequest('crushing chest pain and sweating', now, spy);
    check('emergency never reaches the model', !called && emergency.urgency === 'emergency');

    const modelSaysEmergency = await understandRequest('something feels very wrong', now, fakeModel(JSON.stringify({
        summary: 'x', specialty: 'General Practitioner (GP)', urgency: 'emergency', timeOfDay: 'any',
    })));
    check('model can escalate to emergency', modelSaysEmergency.urgency === 'emergency');

    const noModel = await understandRequest('skin rash', now, null);
    check('no API key -> keyword rules', noModel.source === 'rules' && noModel.specialty === S.DERMATOLOGIST);

    console.log(`\ntriage eval: ${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
})();
