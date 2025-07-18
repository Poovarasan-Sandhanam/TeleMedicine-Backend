import { Router } from 'express';
import auth from '../../middleware/auth';
import profileController from '../../controllers/profile.controller';
import { uploadSingleImage } from '../../middleware/multerS3'; // ✅ S3 memory-based multer

const router = Router();



router.post('/update-profile', auth, uploadSingleImage, profileController.updateProfile);
router.get('/get-profile', auth, profileController.getProfile);
router.get('/get-doctor-types', auth, profileController.getDoctorTypes);

export default router;
