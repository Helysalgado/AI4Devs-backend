import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { PrismaClient } from '@prisma/client';

// Instancia compartida de Prisma Client para mejor performance
const prisma = new PrismaClient();

export const addCandidate = async (candidateData: any) => {
    try {
        validateCandidateData(candidateData); // Validar los datos del candidato
    } catch (error: any) {
        throw new Error(error);
    }

    const candidate = new Candidate(candidateData); // Crear una instancia del modelo Candidate
    try {
        const savedCandidate = await candidate.save(); // Guardar el candidato en la base de datos
        const candidateId = savedCandidate.id; // Obtener el ID del candidato guardado

        // Guardar la educación del candidato
        if (candidateData.educations) {
            for (const education of candidateData.educations) {
                const educationModel = new Education(education);
                educationModel.candidateId = candidateId;
                await educationModel.save();
                candidate.education.push(educationModel);
            }
        }

        // Guardar la experiencia laboral del candidato
        if (candidateData.workExperiences) {
            for (const experience of candidateData.workExperiences) {
                const experienceModel = new WorkExperience(experience);
                experienceModel.candidateId = candidateId;
                await experienceModel.save();
                candidate.workExperience.push(experienceModel);
            }
        }

        // Guardar los archivos de CV
        if (candidateData.cv && Object.keys(candidateData.cv).length > 0) {
            const resumeModel = new Resume(candidateData.cv);
            resumeModel.candidateId = candidateId;
            await resumeModel.save();
            candidate.resumes.push(resumeModel);
        }
        return savedCandidate;
    } catch (error: any) {
        if (error.code === 'P2002') {
            // Unique constraint failed on the fields: (`email`)
            throw new Error('The email already exists in the database');
        } else {
            throw error;
        }
    }
};

export const findCandidateById = async (id: number): Promise<Candidate | null> => {
    try {
        const candidate = await Candidate.findOne(id); // Cambio aquí: pasar directamente el id
        return candidate;
    } catch (error) {
        console.error('Error al buscar el candidato:', error);
        throw new Error('Error al recuperar el candidato');
    }
};

/**
 * Interface para el request body de actualización de etapa
 */
export interface UpdateCandidateStageRequest {
    positionId: number;
    interviewStepId: number;
}

/**
 * Interface para la respuesta de actualización de etapa
 */
export interface UpdateCandidateStageResponse {
    success: boolean;
    message: string;
    data: {
        candidateId: number;
        fullName: string;
        positionId: number;
        positionTitle: string;
        applicationId: number;
        previousStage: {
            id: number;
            name: string;
        } | null;
        currentStage: {
            id: number;
            name: string;
        };
        updatedAt: string;
    };
}

/**
 * Actualiza la etapa actual del proceso de entrevistas de un candidato
 * 
 * @param candidateId - ID del candidato
 * @param positionId - ID de la posición a la que aplicó
 * @param interviewStepId - ID de la nueva etapa
 * @returns Información detallada de la actualización
 * @throws Error si no existe el candidato, aplicación o la validación falla
 */
export const updateCandidateStage = async (
    candidateId: number,
    positionId: number,
    interviewStepId: number
): Promise<UpdateCandidateStageResponse> => {
    // 1. Verificar que el candidato existe
        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
            select: {
                id: true,
                firstName: true,
                lastName: true
            }
        });

        if (!candidate) {
            throw new Error(`Candidate with id ${candidateId} not found`);
        }

        // 2. Buscar la aplicación del candidato a la posición
        const application = await prisma.application.findFirst({
            where: {
                candidateId: candidateId,
                positionId: positionId
            },
            include: {
                position: {
                    select: {
                        id: true,
                        title: true,
                        interviewFlowId: true
                    }
                },
                interviewStep: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!application) {
            throw new Error(`Application not found for candidate ${candidateId} in position ${positionId}`);
        }

        // 3. Verificar que el nuevo InterviewStep existe y pertenece al flujo correcto
        const newInterviewStep = await prisma.interviewStep.findFirst({
            where: {
                id: interviewStepId,
                interviewFlowId: application.position.interviewFlowId
            },
            select: {
                id: true,
                name: true,
                interviewFlowId: true
            }
        });

        if (!newInterviewStep) {
            throw new Error(`Interview step ${interviewStepId} not found or does not belong to position ${positionId} interview flow`);
        }

        // 4. Guardar información de la etapa anterior (puede ser null)
        const previousStage = application.interviewStep ? {
            id: application.interviewStep.id,
            name: application.interviewStep.name
        } : null;

        // 5. Actualizar la aplicación con la nueva etapa
        await prisma.application.update({
            where: { id: application.id },
            data: {
                currentInterviewStep: interviewStepId,
                updatedAt: new Date()
            }
        });

        // 6. Construir y retornar la respuesta
        return {
            success: true,
            message: 'Candidate stage updated successfully',
            data: {
                candidateId: candidate.id,
                fullName: `${candidate.firstName} ${candidate.lastName}`,
                positionId: application.position.id,
                positionTitle: application.position.title,
                applicationId: application.id,
                previousStage: previousStage,
                currentStage: {
                    id: newInterviewStep.id,
                    name: newInterviewStep.name
                },
                updatedAt: new Date().toISOString()
            }
        };
};
