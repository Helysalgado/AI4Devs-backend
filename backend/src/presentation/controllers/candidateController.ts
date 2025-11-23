import { Request, Response } from 'express';
import { addCandidate, findCandidateById, updateApplicationStage } from '../../application/services/candidateService';
import { validatePositiveIntegerId, ValidationError } from '../../application/validator';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Controller para actualizar la fase de un candidato
 * PUT /candidates/:id/stage
 * NOTA: Crea una nueva Interview para registrar el cambio de fase
 */
export const updateCandidateStage = async (req: Request, res: Response) => {
    try {
        // 1. Extraer y validar parámetro de ruta
        const candidateId = validatePositiveIntegerId(req.params.id, 'candidate');

        // 2. Extraer y validar body
        const { positionId, newInterviewStepId, employeeId, notes } = req.body;

        // Validar presencia de campos requeridos
        if (!positionId || !newInterviewStepId || !employeeId) {
            const details: string[] = [];
            if (!positionId) details.push('positionId is required and must be a positive integer');
            if (!newInterviewStepId) details.push('newInterviewStepId is required and must be a positive integer');
            if (!employeeId) details.push('employeeId is required and must be a positive integer');
            
            return res.status(400).json({ 
                error: 'Bad Request',
                message: 'Validation failed',
                details,
                statusCode: 400
            });
        }

        // Validar tipos y valores usando el helper
        const positionIdNum = validatePositiveIntegerId(positionId, 'position');
        const newInterviewStepIdNum = validatePositiveIntegerId(newInterviewStepId, 'interview step');
        const employeeIdNum = validatePositiveIntegerId(employeeId, 'employee');

        // 3. Delegar al servicio
        const result = await updateApplicationStage(
            candidateId, 
            positionIdNum, 
            newInterviewStepIdNum,
            employeeIdNum,
            notes
        );

        // 4. Responder con éxito
        res.status(200).json(result);
        
    } catch (error: any) {
        // 5. Manejo de errores
        if (error instanceof ValidationError) {
            return res.status(400).json({ 
                error: 'Bad Request',
                message: error.message,
                statusCode: 400
            });
        }
        
        if (error.message.includes('not found') || error.message.includes('not active')) {
            return res.status(404).json({ 
                error: 'Not Found',
                message: error.message,
                statusCode: 404
            });
        }
        
        if (error.message.includes('does not belong')) {
            return res.status(400).json({ 
                error: 'Bad Request',
                message: error.message,
                statusCode: 400
            });
        }
        
        console.error('Error in updateCandidateStage:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while updating candidate stage.',
            statusCode: 500
        });
    }
};

export { addCandidate };