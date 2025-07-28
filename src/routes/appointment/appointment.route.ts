import {Router} from 'express';
import auth from '../../middleware/auth';
import { requirePatientLegacy, requireDoctorLegacy } from '../../middleware/roleAuth';
import appointmentController from '../../controllers/appointment.controller'

const router = Router();

// Patient-only routes
router.post('/booking', auth, requirePatientLegacy, appointmentController.bookAppointment);
router.put('/booking-status', auth, requirePatientLegacy, appointmentController.bookAppointmentStatus);

// Public routes (authenticated users can access)
router.get('/get-all-doctors', auth, appointmentController.getAllDoctors);

// Doctor-only routes
router.get('/get-all-appointments', auth, requireDoctorLegacy, appointmentController.getAllAppointments);

export default router;