// seedDoctorTypes.ts
import mongoose from 'mongoose';
import DoctorType from './doctorType.model';
import config from '../../configurations/config';

const DOCTOR_CATEGORIES = [
  { id: 'gp', title: 'General Practitioner (GP)', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/general.png' },
  { id: 'cardiologist', title: 'Cardiologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Cardiologist.png' },
  { id: 'pediatrician', title: 'Pediatrician', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Pediatrician.jpg' },
  { id: 'orthopedic', title: 'Orthopedic Surgeon', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Orthopedic.jpg' },
  { id: 'gynecologist', title: 'Gynecologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Gynecologist.jpg' },
  { id: 'obstetrician', title: 'Obstetrician (OB)', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Obstetrician.jpg' },
  { id: 'dermatologist', title: 'Dermatologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Dermatologist.jpg' },
  { id: 'endocrinologist', title: 'Endocrinologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Endocrinologist.jpg' },
  { id: 'neurologist', title: 'Neurologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Neurologist.jpg' },
  { id: 'psychiatrist', title: 'Psychiatrist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Psychiatrist.jpg' },
  { id: 'gastroenterologist', title: 'Gastroenterologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Gastroenterologist.jpeg' },
  { id: 'pulmonologist', title: 'Pulmonologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Pulmonologist.jpg' },
  { id: 'oncologist', title: 'Oncologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Oncologist.jpg' },
  { id: 'ophthalmologist', title: 'Ophthalmologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Ophthalmologist.jpg' },
  { id: 'urologist', title: 'Urologist', image: 'https://telemedicine-storage-backend.s3.eu-west-2.amazonaws.com/specialization/special/Urologist.jpg' },
];

(async () => {
  try {
     await mongoose.connect(config.MONGO.url);
    await DoctorType.deleteMany({});
    await DoctorType.insertMany(DOCTOR_CATEGORIES);
    console.log('Doctor types seeded successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
