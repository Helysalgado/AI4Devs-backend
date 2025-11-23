import { Router } from 'express';
import { getPositionCandidates } from '../presentation/controllers/positionController';

const router = Router();

/**
 * GET /positions/:id/candidates
 * Obtiene todos los candidatos que han aplicado a una posición específica
 * con su estado actual en el proceso de entrevistas y puntuación promedio
 */
router.get('/:id/candidates', getPositionCandidates);

export default router;

