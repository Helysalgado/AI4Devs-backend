-- AlterTable
-- Add currentInterviewStep column to Application table
ALTER TABLE "Application" ADD COLUMN "currentInterviewStep" INTEGER;

-- CreateIndex
-- Add index for better query performance
CREATE INDEX "Application_currentInterviewStep_idx" ON "Application"("currentInterviewStep");

-- AddForeignKey
-- Add foreign key constraint to ensure referential integrity
ALTER TABLE "Application" ADD CONSTRAINT "Application_currentInterviewStep_fkey" 
FOREIGN KEY ("currentInterviewStep") REFERENCES "InterviewStep"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

