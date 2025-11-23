import { Request, Response } from 'express';
import { findCandidatesByPosition } from '../../application/services/positionService';
import { validatePositiveIntegerId, ValidationError } from '../../application/validator';

/**
 * Controller para obtener candidatos de una posición
 * GET /positions/:id/candidates
 */
export const getPositionCandidates = async (req: Request, res: Response) => {
    try {
        // 1. Extraer y validar parámetro de ruta
        const positionId = validatePositiveIntegerId(req.params.id, 'position');

        // 2. Delegar al servicio
        const result = await findCandidatesByPosition(positionId);

        // 3. Responder con éxito
        res.status(200).json(result);
        
    } catch (error: any) {
        // 4. Manejo de errores
        if (error instanceof ValidationError) {
            return res.status(400).json({ 
                error: 'Bad Request',
                message: error.message,
                statusCode: 400
            });
        }
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                error: 'Not Found',
                message: error.message,
                statusCode: 404
            });
        }
        
        console.error('Error in getPositionCandidates:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while fetching candidates.',
            statusCode: 500
        });
    }
};

