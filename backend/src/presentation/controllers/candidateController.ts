import { Request, Response } from 'express';
import { addCandidate, findCandidateById } from '../../application/services/candidateService';

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
 * Controller para actualizar la etapa de un candidato
 * Endpoint: PUT /candidates/:id/stage
 * 
 * @param req - Request con candidateId en params y positionId, interviewStepId en body
 * @param res - Response con confirmación de actualización o error
 */
export const updateCandidateStage = async (req: Request, res: Response) => {
    try {
        // 1. Validar candidateId del path parameter
        const candidateId = parseInt(req.params.id);
        
        if (isNaN(candidateId)) {
            return res.status(400).json({
                error: 'Invalid ID format',
                message: 'Candidate ID must be a valid number',
                statusCode: 400
            });
        }

        if (candidateId <= 0) {
            return res.status(400).json({
                error: 'Invalid ID format',
                message: 'Candidate ID must be a positive integer',
                statusCode: 400
            });
        }

        // 2. Validar body
        const { positionId, interviewStepId } = req.body;

        // Validar que los campos existen
        if (positionId === undefined || positionId === null) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Missing required field: positionId',
                statusCode: 400
            });
        }

        if (interviewStepId === undefined || interviewStepId === null) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Missing required field: interviewStepId',
                statusCode: 400
            });
        }

        // Validar que son números
        if (typeof positionId !== 'number' || isNaN(positionId)) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'positionId must be a valid number',
                statusCode: 400
            });
        }

        if (typeof interviewStepId !== 'number' || isNaN(interviewStepId)) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'interviewStepId must be a valid number',
                statusCode: 400
            });
        }

        // Validar que son positivos
        if (positionId <= 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'positionId must be a positive integer',
                statusCode: 400
            });
        }

        if (interviewStepId <= 0) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'interviewStepId must be a positive integer',
                statusCode: 400
            });
        }

        // 3. Delegar al servicio
        const { updateCandidateStage: updateStageService } = require('../../application/services/candidateService');
        const result = await updateStageService(candidateId, positionId, interviewStepId);

        // 4. Retornar respuesta exitosa
        return res.status(200).json(result);

    } catch (error) {
        // Manejo de errores específicos
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();

            // Error de candidato no encontrado
            if (errorMessage.includes('candidate') && errorMessage.includes('not found')) {
                return res.status(404).json({
                    error: 'Candidate not found',
                    message: error.message,
                    statusCode: 404
                });
            }

            // Error de aplicación no encontrada
            if (errorMessage.includes('application not found')) {
                return res.status(404).json({
                    error: 'Application not found',
                    message: error.message,
                    statusCode: 404
                });
            }

            // Error de interview step inválido
            if (errorMessage.includes('interview step') && (errorMessage.includes('not found') || errorMessage.includes('does not belong'))) {
                return res.status(400).json({
                    error: 'Invalid interview step',
                    message: error.message,
                    statusCode: 400
                });
            }

            // Error genérico con mensaje descriptivo
            console.error('Error in updateCandidateStage:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'An unexpected error occurred while updating candidate stage',
                statusCode: 500
            });
        }

        // Error desconocido
        console.error('Unknown error in updateCandidateStage:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
            statusCode: 500
        });
    }
};

export { addCandidate, updateCandidateStage as updateStage };