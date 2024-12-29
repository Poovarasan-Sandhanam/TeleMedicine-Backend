import {Router} from 'express';
import auth from '../../middleware/auth';
import appointmentController from '../../controllers/appointment.controller'


const router = Router();

router.post('/booking', auth, appointmentController.bookAppointment);
router.put('/booking-status', auth, appointmentController.bookAppointmentStatus);
router.get('/get-all-doctors', auth, appointmentController.getAllDoctors);
router.get('/get-all-appointments', auth, appointmentController.getAllAppointments);

export default router;