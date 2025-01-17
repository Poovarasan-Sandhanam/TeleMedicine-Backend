import {Router} from 'express';
import auth from '../../middleware/auth';
import prescriptionController from '../../controllers/prescription.controller'


const router = Router();

router.post('/add-prescription', auth, prescriptionController.addPrescription);
router.get('/get-prescription', auth, prescriptionController.getPrescriptionDetails);

export default router;