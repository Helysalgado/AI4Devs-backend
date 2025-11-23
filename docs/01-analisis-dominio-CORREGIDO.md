# Análisis del Dominio CORREGIDO - Sistema ATS LTI

**Fecha**: 23 de noviembre de 2025  
**Objetivo**: Análisis basado en el schema REAL de la base de datos  
**Método**: Verificación directa del schema.prisma + Prisma Studio

---

## ⚠️ CORRECCIÓN IMPORTANTE

Este documento **reemplaza** el análisis anterior (`01-analisis-dominio.md`) que contenía asunciones incorrectas sobre la estructura de la base de datos.

**Error identificado**: Se asumió que `Application` tenía un campo `currentInterviewStep`, pero el schema real NO lo tiene.

---

## 📊 Estructura REAL de la Base de Datos

### **Verificación realizada**:
1. ✅ Leído `backend/prisma/schema.prisma` completo
2. ✅ Ejecutado `npx prisma db pull` 
3. ✅ Verificado en Prisma Studio
4. ✅ Confirmada estructura contra BD PostgreSQL

---

## 🗂️ Modelos del Dominio (REALES)

### 1. **Candidate** ✅

**Tabla**: `Candidate` en schema.prisma (líneas 11-24)

**Campos REALES**:
- `id`: Int @id @default(autoincrement())
- `firstName`: String @db.VarChar(100)
- `lastName`: String @db.VarChar(100)
- `email`: String @unique @db.VarChar(255)
- `phone`: String? @db.VarChar(15)
- `address`: String? @db.VarChar(100)
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime

**Relaciones REALES**:
- `applications`: Application[] (1:N)
- `educations`: Education[] (1:N)
- `resumes`: Resume[] (1:N)
- `workExperiences`: WorkExperience[] (1:N)

---

### 2. **Position** ✅

**Tabla**: `Position` en schema.prisma (líneas 123-153)

**Campos REALES**:
- `id`: Int @id @default(autoincrement())
- `companyId`: Int
- `interviewFlowId`: Int (FK → InterviewFlow)
- `title`: String @db.VarChar(200)
- `description`: String?
- `status`: PositionStatus @default(DRAFT)
  * Enum: DRAFT | OPEN | CLOSED | ON_HOLD
- `isVisible`: Boolean @default(false)
- `location`: String? @db.VarChar(200)
- `jobDescription`: String?
- `requirements`: String?
- `responsibilities`: String?
- `salaryMin`: Decimal? @db.Decimal(10, 2)
- `salaryMax`: Decimal? @db.Decimal(10, 2)
- `employmentType`: EmploymentType
  * Enum: FULL_TIME | PART_TIME | CONTRACT | TEMPORARY | INTERNSHIP
- `benefits`: String?
- `companyDescription`: String?
- `applicationDeadline`: DateTime?
- `contactInfo`: String? @db.VarChar(500)
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime

**Relaciones REALES**:
- `company`: Company (N:1)
- `interviewFlow`: InterviewFlow (N:1)
- `applications`: Application[] (1:N)

---

### 3. **Application** ⚠️ CRÍTICO

**Tabla**: `Application` en schema.prisma (líneas 155-173)

**Campos REALES**:
- `id`: Int @id @default(autoincrement())
- `positionId`: Int (FK → Position)
- `candidateId`: Int (FK → Candidate)
- `applicationDate`: DateTime @default(now())
- `status`: ApplicationStatus @default(PENDING)
  * Enum: PENDING | REVIEWING | INTERVIEWED | ACCEPTED | REJECTED | WITHDRAWN
- `notes`: String?
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime

**Relaciones REALES**:
- `candidate`: Candidate (N:1)
- `position`: Position (N:1)
- `interviews`: Interview[] (1:N)

**❌ NO TIENE**:
- ❌ Campo `currentInterviewStep`
- ❌ Relación directa con `InterviewStep`

**Restricción única**:
- `@@unique([positionId, candidateId])` → Un candidato solo puede aplicar una vez a una posición

---

### 4. **Interview** ✅

**Tabla**: `Interview` en schema.prisma (líneas 175-195)

**Campos REALES**:
- `id`: Int @id @default(autoincrement())
- `applicationId`: Int (FK → Application)
- `interviewStepId`: Int (FK → InterviewStep)
- `employeeId`: Int (FK → Employee)
- `interviewDate`: DateTime
- `result`: InterviewResult @default(PENDING)
  * Enum: PENDING | PASSED | FAILED | NO_SHOW
- **`score`**: Int? (nullable) ← Campo crítico para puntuación
- `notes`: String?
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime

**Relaciones REALES**:
- `application`: Application (N:1)
- `interviewStep`: InterviewStep (N:1)
- `employee`: Employee (N:1)

---

### 5. **InterviewStep** ✅

**Tabla**: `InterviewStep` en schema.prisma (líneas 108-121)

**Campos REALES**:
- `id`: Int @id @default(autoincrement())
- `interviewFlowId`: Int (FK → InterviewFlow)
- `interviewTypeId`: Int (FK → InterviewType)
- `name`: String @db.VarChar(200)
- **`orderIndex`**: Int ← Secuencia del paso en el flujo
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime

**Relaciones REALES**:
- `interviewFlow`: InterviewFlow (N:1)
- `interviewType`: InterviewType (N:1)
- `interviews`: Interview[] (1:N)

**Restricción única**:
- `@@unique([interviewFlowId, orderIndex])` → No puede haber pasos duplicados en un flujo

---

### 6. **InterviewFlow** ✅

**Tabla**: `InterviewFlow` en schema.prisma (líneas 99-106)

**Campos REALES**:
- `id`: Int @id @default(autoincrement())
- `description`: String @db.VarChar(500)
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime

**Relaciones REALES**:
- `interviewSteps`: InterviewStep[] (1:N)
- `positions`: Position[] (1:N)

---

### 7. **Employee** ✅

**Tabla**: `Employee` en schema.prisma (líneas 73-88)

**Campos REALES**:
- `id`: Int @id @default(autoincrement())
- `companyId`: Int
- `name`: String @db.VarChar(200)
- `email`: String @unique @db.VarChar(255)
- `role`: EmployeeRole
  * Enum: RECRUITER | HIRING_MANAGER | INTERVIEWER | ADMIN
- `isActive`: Boolean @default(true)
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime

**Relaciones REALES**:
- `company`: Company (N:1)
- `interviews`: Interview[] (1:N)

---

## 🔗 Diagrama de Relaciones REAL

```
┌──────────────┐
│   Company    │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐      1:N      ┌──────────────┐
│  Position    │◄───────────────┤ InterviewFlow│
│ flowId (FK)  │                └──────┬───────┘
└──────┬───────┘                       │ 1:N
       │ 1:N                            ▼
       ▼                        ┌──────────────┐
┌──────────────┐      N:1       │InterviewStep │
│ Application  │◄───────────────┤  orderIndex  │
│              │                └──────┬───────┘
│ ❌NO tiene   │                       │ 1:N
│currentStep   │                       │
└──────┬───────┘                       │
       │ 1:N                            │
       ▼                                │
┌──────────────┐      N:1             │
│  Interview   │◄─────────────────────┘
│stepId (FK)   │
│score: Int?   │
│interviewDate │
└──────┬───────┘
       │ N:1
       ▼
┌──────────────┐
│  Employee    │
└──────────────┘
```

**Candidato apunta a Application**
```
┌──────────────┐      N:1      ┌──────────────┐
│  Candidate   │───────────────►│ Application  │
└──────────────┘                └──────────────┘
```

---

## 🎯 Implicaciones para los Endpoints

### **Pregunta Clave**: ¿Cómo determinar la fase actual de un candidato?

**Respuesta**: Ya que `Application` NO tiene `currentInterviewStep`, hay que calcularlo desde `Interview`:

```typescript
// Para obtener la fase actual de una Application:
const latestInterview = await prisma.interview.findFirst({
  where: { applicationId },
  include: { interviewStep: true },
  orderBy: { interviewDate: 'desc' }
});

const currentPhase = latestInterview 
  ? latestInterview.interviewStep
  : null; // Sin entrevistas aún
```

---

## 📋 Campos Relevantes para los Endpoints

### **GET /positions/:id/candidates**

**Datos necesarios**:
1. **Position.id** (parámetro de ruta)
2. **Application** (filtrar por positionId)
3. **Candidate** (a través de Application.candidate)
4. **Interview** (a través de Application.interviews)
5. **InterviewStep** (a través de Interview.interviewStep)

**Cálculos requeridos**:
- **Fase actual**: Interview más reciente (ORDER BY interviewDate DESC, LIMIT 1)
- **Average score**: AVG(Interview.score) WHERE score IS NOT NULL

**Query conceptual**:
```typescript
const applications = await prisma.application.findMany({
  where: { positionId },
  include: {
    candidate: {
      select: { id, firstName, lastName, email }
    },
    interviews: {
      include: {
        interviewStep: {
          select: { id, name, orderIndex }
        }
      },
      orderBy: { interviewDate: 'desc' }
    }
  }
});

// Para cada application:
const currentStep = application.interviews[0]?.interviewStep || null;
const scores = application.interviews.filter(i => i.score !== null).map(i => i.score);
const avgScore = scores.length > 0 
  ? scores.reduce((a, b) => a + b, 0) / scores.length 
  : null;
```

---

### **PUT /candidates/:id/stage**

**Problema**: No existe un campo directo para actualizar la fase.

**Soluciones posibles**:

#### **Opción A: Crear una nueva Interview (RECOMENDADO)**
```typescript
// Crear Interview con el nuevo InterviewStep
await prisma.interview.create({
  data: {
    applicationId,
    interviewStepId: newStepId,
    employeeId,
    interviewDate: new Date(),
    result: 'PENDING',
    score: null, // Se registra después
    notes
  }
});
```

**Pros**:
- ✅ Mantiene historial completo
- ✅ Registra quién movió al candidato (employeeId)
- ✅ Fecha exacta del cambio
- ✅ Coherente con modelo de dominio ATS

**Contras**:
- ⚠️ Requiere más campos en el request (employeeId, etc.)
- ⚠️ No es simplemente un "UPDATE"

#### **Opción B: Agregar campo `currentInterviewStep` a Application**
```prisma
model Application {
  // ... campos existentes
  currentInterviewStep Int?
  currentStep InterviewStep? @relation(fields: [currentInterviewStep], references: [id])
}
```

**Pros**:
- ✅ Acceso directo a fase actual
- ✅ Update simple

**Contras**:
- ⚠️ Requiere migración de BD
- ⚠️ Duplica información (está en Interview también)
- ⚠️ Puede desincronizarse

**DECISIÓN RECOMENDADA**: **Opción A** (crear Interview)

---

## 🔍 Validaciones Necesarias

### **Para GET /positions/:id/candidates**
1. ✅ `positionId` es número entero positivo
2. ✅ `Position` con ese ID existe
3. ✅ Manejar Applications sin Interviews (fase = null)
4. ✅ Manejar Interviews sin score (excluir del promedio)

### **Para PUT /candidates/:id/stage** (con Opción A)
1. ✅ `candidateId` es número entero positivo
2. ✅ `positionId` existe en body y es válido
3. ✅ `newInterviewStepId` existe y es válido
4. ✅ `employeeId` existe y es válido
5. ✅ `Candidate` existe
6. ✅ `Position` existe
7. ✅ `Application` existe (candidateId + positionId)
8. ✅ `InterviewStep` existe
9. ✅ `InterviewStep.interviewFlowId` = `Position.interviewFlowId` (paso pertenece al flujo)
10. ✅ `Employee` existe y está activo

---

## 📊 Comparación: Schema Asumido vs Real

| Campo/Relación | Schema Asumido (❌) | Schema Real (✅) |
|----------------|---------------------|------------------|
| `Application.currentInterviewStep` | Int (FK) | ❌ NO EXISTE |
| `Application.interviewStep` | Relación N:1 | ❌ NO EXISTE |
| `Application.status` | ❌ NO considerado | ✅ Enum (PENDING, etc.) |
| `Interview.interviewStepId` | ✅ Correcto | ✅ Existe |
| `Interview.score` | ✅ Int? | ✅ Correcto |
| Fase actual | Campo directo ❌ | Calculada desde Interview ✅ |

---

## ✅ Conclusiones

1. **Application NO mantiene estado de fase** directamente
   - Fase actual = última Interview
   - Requiere JOIN y ORDER BY

2. **Interview es el registro de progreso**
   - Cada avance = nueva Interview
   - Historial completo preservado

3. **Score está en Interview** (correcto)
   - Cada entrevista tiene su score individual
   - Average = promedio de todos los scores no-null

4. **InterviewStep define la secuencia** (correcto)
   - `orderIndex` determina el orden
   - Pertenece a un `InterviewFlow`
   - Validar que el step pertenece al flow de la position

5. **Approach recomendado para endpoints**:
   - **GET**: Calcular fase desde última Interview
   - **PUT**: Crear nueva Interview (no solo update)

---

## 🚀 Próximos Pasos

1. ✅ **Actualizar docs/03-diseno-contratos-endpoints.md**
   - Diseñar contrato basado en schema real
   - PUT crea Interview (no update campo)

2. ✅ **Actualizar código implementado**
   - Corregir positionService.ts
   - Corregir candidateService.ts
   - Usar lógica de última Interview

3. ✅ **Testing**
   - Probar con datos reales
   - Verificar cálculos de averageScore
   - Validar creación de Interviews

---

**Estado**: ✅ Análisis corregido y validado contra BD real

