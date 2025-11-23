import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Interface para la respuesta de candidatos por posición
 */
interface CandidateInfo {
    candidateId: number;
    fullName: string;
    email: string;
    applicationId: number;
    currentInterviewStep: {
        id: number;
        name: string;
        orderIndex: number;
    };
    averageScore: number | null;
    interviewsCompleted: number;
    applicationDate: string;
}

interface PositionCandidatesResponse {
    positionId: number;
    positionTitle: string;
    candidatesCount: number;
    candidates: CandidateInfo[];
}

/**
 * Encuentra todos los candidatos que han aplicado a una posición
 * Incluye información de la fase actual y score promedio
 * NOTA: La fase actual se calcula desde la Interview más reciente
 */
export const findCandidatesByPosition = async (positionId: number): Promise<PositionCandidatesResponse> => {
    try {
        // 1. Verificar que la posición existe
        const position = await prisma.position.findUnique({
            where: { id: positionId },
            select: {
                id: true,
                title: true
            }
        });

        if (!position) {
            throw new Error(`Position with ID ${positionId} not found.`);
        }

        // 2. Obtener todas las aplicaciones de la posición con sus relaciones
        const applications = await prisma.application.findMany({
            where: { positionId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                interviews: {
                    include: {
                        interviewStep: {
                            select: {
                                id: true,
                                name: true,
                                orderIndex: true
                            }
                        }
                    },
                    orderBy: {
                        interviewDate: 'desc' // Más reciente primero
                    }
                }
            },
            orderBy: {
                applicationDate: 'desc' // Ordenar por fecha de aplicación
            }
        });

        // 3. Transformar y calcular información para cada candidato
        const candidates: CandidateInfo[] = applications.map(app => {
            // Obtener la fase actual desde la Interview más reciente
            const latestInterview = app.interviews[0]; // Primera porque está ordenada DESC
            const currentInterviewStep = latestInterview 
                ? {
                    id: latestInterview.interviewStep.id,
                    name: latestInterview.interviewStep.name,
                    orderIndex: latestInterview.interviewStep.orderIndex
                }
                : {
                    id: 0,
                    name: 'Not Started',
                    orderIndex: -1
                };

            // Calcular score promedio
            const averageScore = calculateAverageScore(app.interviews);

            return {
                candidateId: app.candidate.id,
                fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
                email: app.candidate.email,
                applicationId: app.id,
                currentInterviewStep,
                averageScore,
                interviewsCompleted: app.interviews.length,
                applicationDate: app.applicationDate.toISOString()
            };
        });

        // 4. Retornar respuesta estructurada
        return {
            positionId: position.id,
            positionTitle: position.title,
            candidatesCount: candidates.length,
            candidates
        };

    } catch (error: any) {
        console.error('Error in findCandidatesByPosition service:', error);
        throw error;
    }
};

/**
 * Calcula el score promedio de un array de entrevistas
 * Solo considera entrevistas que tienen un score no nulo
 * Retorna null si no hay scores disponibles
 * Redondea a 1 decimal
 */
const calculateAverageScore = (interviews: Array<{ score: number | null }>): number | null => {
    // Filtrar solo las entrevistas que tienen score
    const scores = interviews
        .filter(interview => interview.score !== null)
        .map(interview => interview.score as number);

    // Si no hay scores, retornar null
    if (scores.length === 0) {
        return null;
    }

    // Calcular promedio
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;

    // Redondear a 1 decimal
    return Math.round(average * 10) / 10;
};

