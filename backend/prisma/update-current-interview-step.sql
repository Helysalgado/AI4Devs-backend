-- Script para inicializar currentInterviewStep en aplicaciones existentes
-- Establece la primera etapa (menor orderIndex) del flujo de entrevistas de cada posición

UPDATE "Application" 
SET "currentInterviewStep" = (
  SELECT "InterviewStep"."id"
  FROM "InterviewStep"
  JOIN "Position" ON "Position"."interviewFlowId" = "InterviewStep"."interviewFlowId"
  WHERE "Position"."id" = "Application"."positionId"
  ORDER BY "InterviewStep"."orderIndex" ASC
  LIMIT 1
)
WHERE "currentInterviewStep" IS NULL;

