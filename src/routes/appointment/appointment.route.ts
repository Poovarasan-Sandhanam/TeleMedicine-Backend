import {Router} from 'express';
import auth from '../../middleware/auth';
import { requirePatientLegacy, requireDoctorLegacy } from '../../middleware/roleAuth';
import appointmentController from '../../controllers/appointment.controller'

const router = Router();

// Patient-only routes
router.post('/booking', auth, requirePatientLegacy, appointmentController.bookAppointment);

// Either participant may cancel, so no role gate here - ownership is checked in the controller.
router.put('/cancel', auth, appointmentController.cancelAppointment);

// Public routes (authenticated users can access)
router.get('/get-all-doctors', auth, appointmentController.getAllDoctors);

// Doctor-only routes
router.get('/get-all-appointments', auth, requireDoctorLegacy, appointmentController.getAllAppointments);

export default router;