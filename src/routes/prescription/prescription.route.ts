import {Router} from 'express';
import auth from '../../middleware/auth';
import {requireDoctorLegacy} from '../../middleware/roleAuth';
import prescriptionController from '../../controllers/prescription.controller'


const router = Router();

// Only doctors write prescriptions; the controller also checks it is their appointment.
router.post('/add-prescription', auth, requireDoctorLegacy, prescriptionController.addPrescription);
router.get('/get-prescription', auth, prescriptionController.getPrescriptionDetails);

export default router;
