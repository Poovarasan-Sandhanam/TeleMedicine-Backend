/**
 * Deterministic emergency screen. Runs before any language model, so a message
 * describing an emergency always gets emergency advice - never a booking - even
 * if the model is unavailable, slow, or wrong.
 *
 * Deliberately conservative: a false alarm costs a moment of the patient's time;
 * a missed emergency can cost far more.
 */

export interface RedFlag {
    id: string;
    label: string;
    /** Self-harm needs crisis support rather than an ambulance message. */
    crisis?: boolean;
}

interface Rule extends RedFlag {
    /** Every group must match (AND); each group is a list of alternatives (OR). */
    all: RegExp[];
}

const RULES: Rule[] = [
    {
        id: 'cardiac',
        label: 'Chest pain with other warning signs',
        all: [
            /\bchest\b.{0,40}\b(pain|pressure|tight(ness)?|heavy|heaviness|crushing|squeez)|\b(crushing|squeezing)\b.{0,20}\bchest/,
            /\b(breath|breathe|breathing|breathless|sweat|sweating|clammy|arm|jaw|faint|dizzy|crushing|squeez|nause)/,
        ],
    },
    {
        id: 'breathing',
        label: 'Severe difficulty breathing',
        all: [/\b(can'?t|cannot|can not|unable to|struggling to|hard to)\s+breathe?\b|\b(choking|gasping)\b|\blips?\b.{0,15}\bblue\b/],
    },
    {
        id: 'stroke',
        label: 'Possible stroke signs',
        all: [/\b(face|mouth)\b.{0,20}\b(droop|drooping|dropped|dropping)\b|\bslurred?\b.{0,10}\bspeech\b|\bspeech\b.{0,10}\bslurr|\b(sudden(ly)?|one side|one-sided)\b.{0,30}\b(weak|weakness|numb|numbness|paraly)|\bcan'?t\s+(move|lift|feel)\s+(my\s+)?(arm|leg|face)\b/],
    },
    {
        id: 'unconscious',
        label: 'Unconscious, collapsed or seizing',
        all: [/\b(unconscious|unresponsive|passed out|collapsed|not breathing|won'?t wake|seizure|seizing|fitting|convulsi)/],
    },
    {
        id: 'bleeding',
        label: 'Heavy or uncontrolled bleeding',
        all: [/\b(won'?t|will not|doesn'?t|can'?t)\s+stop\s+bleeding\b|\b(heavy|severe|lots of|a lot of)\s+bleeding\b|\b(vomit(ing)?|cough(ing)?|throwing up)\s+(up\s+)?blood\b/],
    },
    {
        id: 'anaphylaxis',
        label: 'Possible severe allergic reaction',
        all: [/\b(throat|tongue|lips?|face)\b.{0,20}\b(swell|swelling|swollen|closing)|\banaphyla/],
    },
    {
        id: 'headache',
        label: 'Sudden severe headache',
        all: [/\b(worst|sudden|thunderclap)\b.{0,25}\bheadache\b/],
    },
    {
        id: 'poisoning',
        label: 'Overdose or poisoning',
        all: [/\b(overdose|overdosed|poison(ed|ing)?|swallowed (bleach|chemicals?|pills))\b/],
    },
    {
        id: 'self-harm',
        label: 'Thoughts of suicide or self-harm',
        crisis: true,
        all: [/\b(suicid|kill(ing)? myself|end(ing)? (my life|it all|things)|take my (own )?life|want(ed)? to die|wish i (was|were) dead|better off (if i (was|were) |without me)?dead|better off without me|(don'?t|do not) want to (live|be here)|no (reason|point) (to|in) (live|living)|self[- ]?harm|hurt(ing)? myself|cutting myself)/],
    },
];

const NEGATION = /\b(no|not|never|without|denies|don'?t have|haven'?t had)\b[^.,;!?]{0,25}$/;

/** True when a match is directly preceded by a negation in the same clause. */
const negated = (text: string, index: number) => NEGATION.test(text.slice(Math.max(0, index - 40), index));

const matchesGroup = (text: string, re: RegExp) => {
    const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    for (const m of text.matchAll(global)) {
        if (!negated(text, m.index ?? 0)) {
            return true;
        }
    }
    return false;
};

export const screenRedFlags = (message: string): RedFlag[] => {
    const text = message.toLowerCase().replace(/[’`]/g, "'");
    return RULES
        .filter(rule => rule.all.every(re => matchesGroup(text, re)))
        .map(({ id, label, crisis }) => ({ id, label, crisis }));
};
