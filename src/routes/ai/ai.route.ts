import { Router } from 'express';
import auth from '../../middleware/auth';
import { requirePatientLegacy } from '../../middleware/roleAuth';
import { rateLimit } from '../../middleware/rateLimit';
import { checkSymptoms, findCare } from '../../controllers/ai.controller';

const router = Router();

// AI calls cost money per request. Both routes were previously open to anyone on
// the internet; they now require sign-in and are rate limited per user.
const aiLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 20 });

router.post('/symptom-check', auth, aiLimit, checkSymptoms);
router.post('/find-care', auth, requirePatientLegacy, aiLimit, findCare);

export default router;
