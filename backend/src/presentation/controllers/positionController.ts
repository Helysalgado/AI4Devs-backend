import { Request, Response } from 'express';
import { getCandidatesByPosition } from '../../application/services/positionService';

/**
 * Controller para obtener los candidatos de una posición específica
 * Endpoint: GET /positions/:id/candidates
 * 
 * @param req - Request con el ID de la posición en params
 * @param res - Response con la lista de candidatos o error
 */
export const getPositionCandidates = async (req: Request, res: Response) => {
  try {
    // 1. Validar que el ID es un número válido
    const positionId = parseInt(req.params.id);
    
    if (isNaN(positionId)) {
      return res.status(400).json({
        error: 'Invalid ID format',
        message: 'Position ID must be a valid number',
        statusCode: 400
      });
    }

    // 2. Validar que el ID es positivo
    if (positionId <= 0) {
      return res.status(400).json({
        error: 'Invalid ID format',
        message: 'Position ID must be a positive integer',
        statusCode: 400
      });
    }

    // 3. Delegar al servicio la lógica de negocio
    const result = await getCandidatesByPosition(positionId);

    // 4. Retornar respuesta exitosa
    return res.status(200).json(result);

  } catch (error) {
    // Manejo de errores específicos
    if (error instanceof Error) {
      // Error de posición no encontrada
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: 'Position not found',
          message: error.message,
          statusCode: 404
        });
      }

      // Error genérico con mensaje descriptivo
      console.error('Error in getPositionCandidates:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching candidates',
        statusCode: 500
      });
    }

    // Error desconocido
    console.error('Unknown error in getPositionCandidates:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500
    });
  }
};

