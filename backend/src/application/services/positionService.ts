import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Interface para el response de un candidato en el Kanban
 */
export interface CandidateInPosition {
  candidateId: number;
  fullName: string;
  email: string;
  applicationId: number;
  applicationDate: string;
  currentInterviewStep: {
    id: number;
    name: string;
    orderIndex: number;
  };
  averageScore: number | null;
  interviewCount: number;
}

/**
 * Interface para el response completo del endpoint
 */
export interface PositionCandidatesResponse {
  positionId: number;
  positionTitle: string;
  candidates: CandidateInPosition[];
  totalCandidates: number;
}

/**
 * Calcula el promedio de scores de las entrevistas realizadas
 * @param interviews Array de entrevistas con sus scores
 * @returns Promedio redondeado a 1 decimal, o null si no hay scores válidos
 */
export function calculateAverageScore(interviews: { score: number | null }[]): number | null {
  const validScores = interviews
    .map(i => i.score)
    .filter((score): score is number => score !== null && score !== undefined);
  
  if (validScores.length === 0) {
    return null;
  }
  
  const sum = validScores.reduce((acc, score) => acc + score, 0);
  const average = sum / validScores.length;
  
  // Redondear a 1 decimal
  return Math.round(average * 10) / 10;
}

/**
 * Obtiene todos los candidatos que han aplicado a una posición específica
 * con su información relevante para el Kanban
 * 
 * @param positionId - ID de la posición
 * @returns Objeto con información de la posición y sus candidatos
 * @throws Error si la posición no existe
 */
export async function getCandidatesByPosition(positionId: number): Promise<PositionCandidatesResponse> {
  // 1. Verificar que la posición existe
  const position = await prisma.position.findUnique({
    where: { id: positionId },
    select: {
      id: true,
      title: true
    }
  });

  if (!position) {
    throw new Error(`Position with id ${positionId} not found`);
  }

  // 2. Obtener todas las aplicaciones para esta posición con sus relaciones
  const applications = await prisma.application.findMany({
    where: {
      positionId: positionId
    },
    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      interviewStep: {
        select: {
          id: true,
          name: true,
          orderIndex: true
        }
      },
      interviews: {
        select: {
          score: true
        }
      }
    },
    orderBy: [
      {
        interviewStep: {
          orderIndex: 'asc'
        }
      },
      {
        applicationDate: 'asc'
      }
    ]
  });

  // 3. Transformar las aplicaciones al formato de respuesta
  const candidates: CandidateInPosition[] = applications.map(app => ({
    candidateId: app.candidate.id,
    fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
    email: app.candidate.email,
    applicationId: app.id,
    applicationDate: app.applicationDate.toISOString(),
    currentInterviewStep: {
      id: app.interviewStep.id,
      name: app.interviewStep.name,
      orderIndex: app.interviewStep.orderIndex
    },
    averageScore: calculateAverageScore(app.interviews),
    interviewCount: app.interviews.length
  }));

  // 4. Construir y retornar la respuesta completa
  return {
    positionId: position.id,
    positionTitle: position.title,
    candidates: candidates,
    totalCandidates: candidates.length
  };
}

