import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';
import { PrismaClient } from '@prisma/client';

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
 * Interface para la respuesta de actualización de fase
 */
interface UpdateStageResponse {
    message: string;
    data: {
        candidateId: number;
        candidateName: string;
        positionId: number;
        positionTitle: string;
        applicationId: number;
        previousInterviewStep: {
            id: number;
            name: string;
        } | null;
        newInterview: {
            id: number;
            interviewStepId: number;
            interviewStepName: string;
            interviewDate: string;
            result: string;
        };
        createdAt: string;
    };
}

/**
 * Crea una nueva Interview para avanzar al candidato a una nueva fase
 * NOTA: En este sistema, el avance de fase se registra creando una Interview
 * (no hay campo currentInterviewStep en Application)
 */
export const updateApplicationStage = async (
    candidateId: number, 
    positionId: number, 
    newInterviewStepId: number,
    employeeId: number,
    notes?: string
): Promise<UpdateStageResponse> => {
    try {
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
            throw new Error(`Candidate with ID ${candidateId} not found.`);
        }

        // 2. Verificar que la posición existe
        const position = await prisma.position.findUnique({
            where: { id: positionId },
            select: {
                id: true,
                title: true,
                interviewFlowId: true
            }
        });

        if (!position) {
            throw new Error(`Position with ID ${positionId} not found.`);
        }

        // 3. Buscar la application del candidato en esa posición
        const application = await prisma.application.findFirst({
            where: {
                candidateId,
                positionId
            },
            include: {
                interviews: {
                    include: {
                        interviewStep: true
                    },
                    orderBy: {
                        interviewDate: 'desc'
                    },
                    take: 1 // Solo la más reciente
                }
            }
        });

        if (!application) {
            throw new Error(`No application found for candidate ${candidateId} in position ${positionId}.`);
        }

        // 4. Verificar que el employee existe
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: {
                id: true,
                isActive: true
            }
        });

        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found.`);
        }

        if (!employee.isActive) {
            throw new Error(`Employee with ID ${employeeId} is not active.`);
        }

        // 5. Verificar que el nuevo interview step existe
        const newInterviewStep = await prisma.interviewStep.findUnique({
            where: { id: newInterviewStepId },
            select: {
                id: true,
                name: true,
                interviewFlowId: true
            }
        });

        if (!newInterviewStep) {
            throw new Error(`Interview step with ID ${newInterviewStepId} not found.`);
        }

        // 6. Validar que el interview step pertenece al interview flow de la posición
        if (newInterviewStep.interviewFlowId !== position.interviewFlowId) {
            throw new Error(
                `Interview step ${newInterviewStepId} does not belong to the interview flow of position ${positionId}.`
            );
        }

        // 7. Obtener información del paso anterior (si existe)
        const previousInterview = application.interviews[0];
        const previousStep = previousInterview 
            ? {
                id: previousInterview.interviewStep.id,
                name: previousInterview.interviewStep.name
            }
            : null;

        // 8. Crear una nueva Interview para registrar el avance de fase
        const newInterview = await prisma.interview.create({
            data: {
                applicationId: application.id,
                interviewStepId: newInterviewStepId,
                employeeId,
                interviewDate: new Date(),
                result: 'PENDING', // Default, se actualiza después
                score: null, // Se registra después de la entrevista
                notes: notes || null,
                updatedAt: new Date()
            }
        });

        // 9. Retornar respuesta estructurada
        return {
            message: 'Candidate stage updated successfully',
            data: {
                candidateId: candidate.id,
                candidateName: `${candidate.firstName} ${candidate.lastName}`,
                positionId: position.id,
                positionTitle: position.title,
                applicationId: application.id,
                previousInterviewStep: previousStep,
                newInterview: {
                    id: newInterview.id,
                    interviewStepId: newInterview.interviewStepId,
                    interviewStepName: newInterviewStep.name,
                    interviewDate: newInterview.interviewDate.toISOString(),
                    result: newInterview.result
                },
                createdAt: new Date().toISOString()
            }
        };

    } catch (error: any) {
        console.error('Error in updateApplicationStage service:', error);
        throw error;
    }
};
