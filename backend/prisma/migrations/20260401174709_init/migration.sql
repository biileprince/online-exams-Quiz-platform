-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'LECTURER', 'ADMIN');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'FILL_IN_BLANK', 'DRAG_DROP', 'SEQUENCING', 'MATCHING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "indexNumber" TEXT,
    "course" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationMin" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "password" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamParticipant" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "score" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExamParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "correctAnswer" JSONB NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "givenAnswer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "scoreEarned" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ExamParticipant_examId_userId_key" ON "ExamParticipant"("examId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_participantId_questionId_key" ON "Submission"("participantId", "questionId");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamParticipant" ADD CONSTRAINT "ExamParticipant_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamParticipant" ADD CONSTRAINT "ExamParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ExamParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
