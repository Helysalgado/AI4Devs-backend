# Análisis del Dominio - Sistema ATS LTI

**Fecha**: 23 de noviembre de 2025  
**Objetivo**: Comprender el modelo de dominio para implementar los endpoints:
- `GET /positions/:id/candidates`
- `PUT /candidates/:id/stage`

---

## 📊 Modelo de Datos

### Entidades Principales

#### 1. **Candidate** (Candidato)
**Archivo**: `backend/src/domain/models/Candidate.ts`  
**Tabla**: `Candidate` en `backend/prisma/schema.prisma` (líneas 17-28)

**Campos clave**:
- `id`: Int (PK, autoincrement)
- `firstName`: String (VARCHAR 100)
- `lastName`: String (VARCHAR 100)
- `email`: String (unique, VARCHAR 255)
- `phone`: String? (opcional)
- `address`: String? (opcional)

**Relaciones**:
- `educations`: Education[] (1:N)
- `workExperiences`: WorkExperience[] (1:N)
- `resumes`: Resume[] (1:N)
- `applications`: Application[] (1:N) ← **Relación clave**

---

#### 2. **Position** (Posición/Vacante)
**Archivo**: `backend/src/domain/models/Position.ts`  
**Tabla**: `Position` en `backend/prisma/schema.prisma` (líneas 104-126)

**Campos clave**:
- `id`: Int (PK, autoincrement)
- `companyId`: Int (FK → Company)
- `interviewFlowId`: Int (FK → InterviewFlow)
- `title`: String
- `description`: String
- `status`: String (default: "Draft")
- `location`: String
- `jobDescription`: String

**Relaciones**:
- `company`: Company (N:1)
- `interviewFlow`: InterviewFlow (N:1)
- `applications`: Application[] (1:N) ← **Relación clave**

---

#### 3. **Application** (Aplicación/Postulación)
**Archivo**: `backend/src/domain/models/Application.ts`  
**Tabla**: `Application` en `backend/prisma/schema.prisma` (líneas 128-139)

**Campos clave**:
- `id`: Int (PK, autoincrement)
- `positionId`: Int (FK → Position)
- `candidateId`: Int (FK → Candidate)
- `applicationDate`: DateTime
- **`currentInterviewStep`**: Int (FK → InterviewStep) ← **Campo crítico para fase actual**
- `notes`: String? (opcional)

**Relaciones**:
- `position`: Position (N:1)
- `candidate`: Candidate (N:1)
- `interviewStep`: InterviewStep (N:1) ← Representa la fase actual
- `interviews`: Interview[] (1:N) ← **Historial de entrevistas**

**Rol en el dominio**:  
`Application` es la **entidad pivote** que conecta un candidato con una posición específica y mantiene el estado del proceso de selección.

---

#### 4. **Interview** (Entrevista)
**Archivo**: `backend/src/domain/models/Interview.ts`  
**Tabla**: `Interview` en `backend/prisma/schema.prisma` (líneas 141-153)

**Campos clave**:
- `id`: Int (PK, autoincrement)
- `applicationId`: Int (FK → Application)
- `interviewStepId`: Int (FK → InterviewStep)
- `employeeId`: Int (FK → Employee)
- `interviewDate`: DateTime
- `result`: String? (opcional)
- **`score`**: Int? (opcional) ← **Campo crítico para puntuación**
- `notes`: String? (opcional)

**Relaciones**:
- `application`: Application (N:1)
- `interviewStep`: InterviewStep (N:1)
- `employee`: Employee (N:1) - Entrevistador

---

#### 5. **InterviewStep** (Paso de Entrevista)
**Archivo**: No tiene modelo de dominio dedicado  
**Tabla**: `InterviewStep` en `backend/prisma/schema.prisma` (líneas 92-102)

**Campos clave**:
- `id`: Int (PK, autoincrement)
- `interviewFlowId`: Int (FK → InterviewFlow)
- `interviewTypeId`: Int (FK → InterviewType)
- `name`: String
- `orderIndex`: Int

**Relaciones**:
- `interviewFlow`: InterviewFlow (N:1)
- `interviewType`: InterviewType (N:1)
- `applications`: Application[] (1:N) - Aplicaciones en este paso
- `interviews`: Interview[] (1:N) - Entrevistas de este tipo

---

## 🔗 Diagrama de Relaciones

```
┌──────────────┐
│   Position   │
└──────┬───────┘
       │ 1:N
       ▼
┌──────────────┐      N:1      ┌──────────────┐
│ Application  │◄───────────────┤  Candidate   │
└──────┬───────┘                └──────────────┘
       │ 1:N
       │
       │ currentInterviewStep (FK)
       ├────────────────────────► InterviewStep
       │
       │ 1:N
       ▼
┌──────────────┐
│  Interview   │
│  score: Int? │
└──────────────┘
```

---

## 🎯 Campos Relevantes para los Endpoints

### **GET /positions/:id/candidates**

Necesitamos consultar y combinar:

1. **Filtrar por posición**:
   - `Application.positionId = :id`

2. **Obtener información del candidato**:
   - `Candidate.id`
   - `Candidate.firstName` + `Candidate.lastName` → construir nombre completo

3. **Fase actual del proceso**:
   - `Application.currentInterviewStep` (ID del paso)
   - Opcionalmente: `InterviewStep.name` (nombre legible del paso)

4. **Calcular puntuación promedio**:
   - `Interview.score` (promedio de todos los interviews donde `Interview.applicationId = Application.id`)
   - **Consideración**: Manejar casos donde no hay entrevistas o scores son `null`

**Query conceptual**:
```sql
SELECT 
  c.id,
  c.firstName || ' ' || c.lastName AS fullName,
  a.currentInterviewStep,
  AVG(i.score) AS averageScore
FROM Application a
JOIN Candidate c ON a.candidateId = c.id
LEFT JOIN Interview i ON i.applicationId = a.id
WHERE a.positionId = :id
GROUP BY c.id, c.firstName, c.lastName, a.currentInterviewStep
```

---

### **PUT /candidates/:id/stage**

Necesitamos actualizar:

1. **Identificar la aplicación**:
   - `Application.candidateId = :id`
   - `Application.positionId` (probablemente del body para identificar la aplicación específica)

2. **Actualizar fase**:
   - `Application.currentInterviewStep` → nuevo valor

3. **Validaciones necesarias**:
   - El `candidateId` existe
   - La `Application` existe para ese candidato y posición
   - El nuevo `InterviewStep.id` es válido y pertenece al `InterviewFlow` de la posición
   - (Opcional) Validar transiciones válidas según el `orderIndex` de los steps

**Query conceptual**:
```sql
UPDATE Application
SET currentInterviewStep = :newStepId
WHERE candidateId = :id 
  AND positionId = :positionId
```

---

## 📋 Consideraciones de Diseño

### **Campo de fase actual**
- **Ubicación**: `Application.currentInterviewStep`
- **Tipo**: `Int` (FK a `InterviewStep.id`)
- **Significado**: Representa en qué etapa del proceso está el candidato para una posición específica

### **Puntuación (score)**
- **Ubicación**: `Interview.score` (nullable)
- **Agregación**: Debe calcularse el promedio de todas las entrevistas de una aplicación
- **Casos especiales**:
  - Sin entrevistas: `averageScore = null` o `0`
  - Entrevistas sin score: Excluir del cálculo o considerar como `0`

### **Multiplicidad de aplicaciones**
Un candidato puede aplicar a múltiples posiciones, por lo que:
- Cada combinación `(candidateId, positionId)` genera una `Application` única
- El endpoint PUT debe especificar `positionId` para identificar qué aplicación actualizar

---

## ✅ Conclusiones

1. **Application es la entidad central** para ambos endpoints, conectando Position, Candidate e Interview

2. **currentInterviewStep** es el campo que mantiene el estado del proceso y debe actualizarse en PUT

3. **score** está en Interview (no en Application), requiere agregación para obtener el promedio

4. **Relaciones claras**:
   - Position 1:N Application N:1 Candidate
   - Application 1:N Interview

5. **Para la implementación**:
   - Usar Prisma con includes para cargar relaciones eficientemente
   - Aplicar validaciones a nivel de servicio (DDD)
   - Mantener la separación de capas (router → controller → service → data access)

---

**Siguiente paso**: Analizar la arquitectura del backend (rutas, controladores, servicios)

