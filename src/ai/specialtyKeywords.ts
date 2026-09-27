/**
 * Named health issues and the specialty that treats each. Used by doctor search
 * (GET /appointment/get-all-doctors?issue=...) and as the keyword fallback for
 * AI triage when the language model is unavailable.
 */
export const HEALTH_ISSUE_SPECIALTY: Record<string, string> = {
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
