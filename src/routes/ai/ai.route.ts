import { Router } from 'express';
import { checkSymptoms } from '../../controllers/ai.controller';

const router = Router();

router.post('/symptom-check', checkSymptoms);

export default router;