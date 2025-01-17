import express, {Router} from 'express';
import auth from '../../middleware/auth';
import paymentController from '../../controllers/payment.controller'


const router = Router();

router.post('/book-now', auth, paymentController.createPaymentIntent);
router.get('/get-bookings', auth, paymentController.getMyBookings)
router.post('/webhook', paymentController.getDetailsFromWebhook);

export default router;