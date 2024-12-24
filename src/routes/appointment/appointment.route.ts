import {Router} from 'express';
import auth from '../../middleware/auth';
import appointmentController from '../../controllers/appointment.controller'


const router = Router();

router.post('/booking', auth, appointmentController.bookAppointment);
router.get('/get-all-doctors', auth, appointmentController.getAllDoctors);

export default router;