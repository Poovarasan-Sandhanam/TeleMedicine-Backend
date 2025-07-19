import { Router } from 'express';
import auth from '../../middleware/auth';
import profileController from '../../controllers/profile.controller';
import upload from "../../middleware/upload"; // ✅ S3 memory-based multer

const router = Router();

router.put(
    "/update-profile",auth,
    upload.single("profileImage"), // Make sure the form field is "profileImage"
    profileController.updateProfile
);
router.get('/get-profile', auth, profileController.getProfile);
router.get('/get-doctor-types', auth, profileController.getDoctorTypes);

export default router;
