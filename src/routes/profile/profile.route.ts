import {Router} from 'express';
import auth from '../../middleware/auth';
import profileController from '../../controllers/profile.controller'
import {uploadFilesMulterMiddleware} from "../../utilities/multerConfig";


const router = Router();

router.post('/update-profile', auth, uploadFilesMulterMiddleware('image', true), profileController.updateProfile);
router.get('/get-profile', auth, profileController.getProfile);

export default router;