import { Router } from 'express';
import { getPositionCandidates } from '../presentation/controllers/positionController';

const router = Router();

// GET /positions/:id/candidates
router.get('/:id/candidates', getPositionCandidates);

export default router;

