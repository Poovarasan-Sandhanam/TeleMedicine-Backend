import {Router} from 'express';
import auth from '../../controllers/auth.controller';
import {validateUserLoginSchema, validateUserRegisterSchema} from "../../validation/userValidator";


const router = Router();

router.post('/register', validateUserRegisterSchema, auth.register);
router.post('/login', validateUserLoginSchema, auth.login);

export default router;