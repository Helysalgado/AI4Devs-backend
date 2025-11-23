# Diseño de Contratos - Nuevos Endpoints

**Fecha**: 23 de noviembre de 2025  
**Objetivo**: Definir contratos claros, consistentes y testables para:
- `GET /positions/:id/candidates`
- `PUT /candidates/:id/stage`

---

## 📋 Principios de Diseño de API

- **Consistencia**: Seguir patrones existentes en `api-spec.yaml`
- **Claridad**: Nombres descriptivos y estructura predecible
- **Robustez**: Validaciones exhaustivas y manejo de errores
- **RESTful**: Seguir convenciones REST para recursos y verbos HTTP
- **Testabilidad**: Contratos bien definidos facilitan testing

---

## 🔍 Endpoint 1: GET /positions/:id/candidates

### **Descripción**
Obtiene la lista de candidatos que han aplicado a una posición específica, incluyendo su fase actual en el proceso y la puntuación promedio de sus entrevistas.

### **URL Pattern**
```
GET /positions/:id/candidates
```

### **Parámetros de Ruta**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | integer | Sí | ID de la posición |

### **Query Parameters** (Opcional - Fase futura)
```
?phase=<interviewStepId>     # Filtrar por fase específica
?minScore=<number>            # Filtrar por score mínimo
?orderBy=<field>              # Ordenar por: name, score, phase
```

### **Request Example**
```http
GET /positions/5/candidates HTTP/1.1
Host: localhost:3010
Accept: application/json
```

### **Response Success (200 OK)**

#### **Estructura JSON**
```json
{
  "positionId": 5,
  "positionTitle": "Senior Backend Developer",
  "candidatesCount": 3,
  "candidates": [
    {
      "candidateId": 12,
      "fullName": "Juan Pérez García",
      "email": "juan.perez@example.com",
      "applicationId": 45,
      "currentInterviewStep": {
        "id": 3,
        "name": "Technical Interview",
        "orderIndex": 2
      },
      "averageScore": 8.5,
      "interviewsCompleted": 2,
      "applicationDate": "2024-11-15T10:30:00.000Z"
    },
    {
      "candidateId": 18,
      "fullName": "María López Fernández",
      "email": "maria.lopez@example.com",
      "applicationId": 47,
      "currentInterviewStep": {
        "id": 2,
        "name": "HR Interview",
        "orderIndex": 1
      },
      "averageScore": 9.0,
      "interviewsCompleted": 1,
      "applicationDate": "2024-11-18T14:20:00.000Z"
    },
    {
      "candidateId": 22,
      "fullName": "Carlos Sánchez Ruiz",
      "email": "carlos.sanchez@example.com",
      "applicationId": 48,
      "currentInterviewStep": {
        "id": 1,
        "name": "Initial Screening",
        "orderIndex": 0
      },
      "averageScore": null,
      "interviewsCompleted": 0,
      "applicationDate": "2024-11-20T09:15:00.000Z"
    }
  ]
}
```

#### **Schema TypeScript**
```typescript
interface GetPositionCandidatesResponse {
  positionId: number;
  positionTitle: string;
  candidatesCount: number;
  candidates: CandidateInfo[];
}

interface CandidateInfo {
  candidateId: number;
  fullName: string;              // firstName + " " + lastName
  email: string;
  applicationId: number;
  currentInterviewStep: {
    id: number;
    name: string;
    orderIndex: number;
  };
  averageScore: number | null;   // null si no hay entrevistas con score
  interviewsCompleted: number;
  applicationDate: string;        // ISO 8601 format
}
```

### **Response Errors**

#### **400 Bad Request** - ID inválido
```json
{
  "error": "Bad Request",
  "message": "Invalid position ID format. Must be a positive integer.",
  "statusCode": 400
}
```

#### **404 Not Found** - Posición no existe
```json
{
  "error": "Not Found",
  "message": "Position with ID 999 not found.",
  "statusCode": 404
}
```

#### **404 Not Found** - Sin candidatos (Alternativa: retornar array vacío)
```json
{
  "positionId": 5,
  "positionTitle": "Senior Backend Developer",
  "candidatesCount": 0,
  "candidates": []
}
```
*Nota: Preferir retornar array vacío en lugar de 404 para este caso.*

#### **500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred while fetching candidates.",
  "statusCode": 500
}
```

### **Casos Especiales**

| Caso | Comportamiento |
|------|----------------|
| **Sin entrevistas** | `averageScore: null`, `interviewsCompleted: 0` |
| **Entrevistas sin score** | Excluir del cálculo del promedio, solo contar las que tienen score |
| **Posición sin candidatos** | Retornar `candidates: []`, no error 404 |
| **Score decimal** | Redondear a 1 decimal (ej: 8.5) |

### **Lógica de Cálculo de averageScore**

```typescript
// Pseudocódigo
const scores = interviews.filter(i => i.score !== null).map(i => i.score);

if (scores.length === 0) {
  averageScore = null;
} else {
  averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}
```

### **Validaciones Requeridas**

1. ✅ `positionId` debe ser un número entero positivo
2. ✅ `positionId` debe existir en la base de datos
3. ✅ Verificar relaciones: `Position` → `Application` → `Candidate`, `Interview`
4. ✅ Manejar gracefully cuando no hay entrevistas o scores

---

## ✏️ Endpoint 2: PUT /candidates/:id/stage

### **Descripción**
Actualiza la fase actual del proceso de selección (currentInterviewStep) para un candidato en una posición específica.

### **URL Pattern**
```
PUT /candidates/:id/stage
```

### **Parámetros de Ruta**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | integer | Sí | ID del candidato |

### **Request Body**

#### **Estructura JSON**
```json
{
  "positionId": 5,
  "newInterviewStepId": 3
}
```

#### **Schema TypeScript**
```typescript
interface UpdateCandidateStageRequest {
  positionId: number;           // ID de la posición (para identificar la Application)
  newInterviewStepId: number;   // ID del nuevo InterviewStep
}
```

#### **Validaciones del Body**

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `positionId` | integer | Sí | > 0, debe existir |
| `newInterviewStepId` | integer | Sí | > 0, debe existir, debe pertenecer al InterviewFlow de la Position |

### **Request Example**
```http
PUT /candidates/12/stage HTTP/1.1
Host: localhost:3010
Content-Type: application/json

{
  "positionId": 5,
  "newInterviewStepId": 3
}
```

### **Response Success (200 OK)**

#### **Estructura JSON**
```json
{
  "message": "Candidate stage updated successfully",
  "data": {
    "candidateId": 12,
    "candidateName": "Juan Pérez García",
    "positionId": 5,
    "positionTitle": "Senior Backend Developer",
    "applicationId": 45,
    "previousInterviewStep": {
      "id": 2,
      "name": "HR Interview"
    },
    "currentInterviewStep": {
      "id": 3,
      "name": "Technical Interview"
    },
    "updatedAt": "2024-11-23T15:45:30.123Z"
  }
}
```

#### **Schema TypeScript**
```typescript
interface UpdateCandidateStageResponse {
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
    };
    currentInterviewStep: {
      id: number;
      name: string;
    };
    updatedAt: string;  // ISO 8601
  };
}
```

### **Response Errors**

#### **400 Bad Request** - ID inválido en ruta
```json
{
  "error": "Bad Request",
  "message": "Invalid candidate ID format. Must be a positive integer.",
  "statusCode": 400
}
```

#### **400 Bad Request** - Body inválido
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    "positionId is required and must be a positive integer",
    "newInterviewStepId is required and must be a positive integer"
  ],
  "statusCode": 400
}
```

#### **404 Not Found** - Candidato no existe
```json
{
  "error": "Not Found",
  "message": "Candidate with ID 999 not found.",
  "statusCode": 404
}
```

#### **404 Not Found** - Application no existe
```json
{
  "error": "Not Found",
  "message": "No application found for candidate 12 in position 5.",
  "statusCode": 404
}
```

#### **404 Not Found** - InterviewStep no existe
```json
{
  "error": "Not Found",
  "message": "Interview step with ID 99 not found.",
  "statusCode": 404
}
```

#### **400 Bad Request** - InterviewStep no pertenece al InterviewFlow
```json
{
  "error": "Bad Request",
  "message": "Interview step 10 does not belong to the interview flow of position 5.",
  "statusCode": 400
}
```

#### **409 Conflict** - Ya está en esa fase (opcional)
```json
{
  "error": "Conflict",
  "message": "Candidate is already in interview step 3.",
  "statusCode": 409
}
```

#### **500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred while updating candidate stage.",
  "statusCode": 500
}
```

### **Casos Especiales**

| Caso | Comportamiento |
|------|----------------|
| **Candidato no aplicó a la posición** | Error 404: "No application found..." |
| **InterviewStep de otro InterviewFlow** | Error 400: "Interview step does not belong to..." |
| **Ya está en esa fase** | Opción 1: Retornar 200 OK (idempotente)<br>Opción 2: Retornar 409 Conflict |
| **Saltar fases** | Permitir (no validar orderIndex secuencial) |
| **Retroceder en el proceso** | Permitir (business logic puede permitirlo) |

### **Validaciones Requeridas**

1. ✅ `candidateId` (ruta) debe ser un número entero positivo
2. ✅ `positionId` (body) debe ser un número entero positivo y existir
3. ✅ `newInterviewStepId` (body) debe ser un número entero positivo y existir
4. ✅ `candidateId` debe existir en la base de datos
5. ✅ Debe existir una `Application` con `candidateId` + `positionId`
6. ✅ `newInterviewStepId` debe pertenecer al `InterviewFlow` de la `Position`
7. ⚠️ (Opcional) Validar transiciones válidas según `orderIndex`

### **Query para Validar InterviewStep pertenece al Flow**

```sql
SELECT is1.id 
FROM InterviewStep is1
JOIN Position p ON p.interviewFlowId = is1.interviewFlowId
WHERE is1.id = :newInterviewStepId 
  AND p.id = :positionId
```

Si no retorna filas → Error 400

---

## 🔄 Comparación con Endpoints Existentes

### **Patrón de Respuestas del Proyecto**

Según `candidateController.ts`:

```typescript
// Success
res.status(201).json({ 
  message: 'Candidate added successfully', 
  data: candidate 
});

// Error
res.status(400).json({ 
  message: 'Error adding candidate', 
  error: error.message 
});
```

**Observación**: El proyecto usa estructura `{ message, data }` para success y `{ message, error }` para errores.

### **Recomendación para Consistencia**

Seguir el patrón existente con pequeñas mejoras:

**Success**:
```json
{
  "message": "...",
  "data": { ... }
}
```

**Error**:
```json
{
  "error": "Error Type",
  "message": "Descriptive message",
  "statusCode": 400
}
```

---

## 📊 Matriz de Validaciones

### **GET /positions/:id/candidates**

| Validación | Dónde | Tipo Error | Código |
|------------|-------|-----------|--------|
| `id` es número | Controller | 400 | Bad Request |
| `id` > 0 | Controller | 400 | Bad Request |
| Position existe | Service | 404 | Not Found |
| Sin candidatos | Service | 200 | OK (array vacío) |

### **PUT /candidates/:id/stage**

| Validación | Dónde | Tipo Error | Código |
|------------|-------|-----------|--------|
| `id` es número | Controller | 400 | Bad Request |
| `id` > 0 | Controller | 400 | Bad Request |
| `positionId` presente | Controller | 400 | Bad Request |
| `newInterviewStepId` presente | Controller | 400 | Bad Request |
| `positionId` es número > 0 | Controller | 400 | Bad Request |
| `newInterviewStepId` es número > 0 | Controller | 400 | Bad Request |
| Candidate existe | Service | 404 | Not Found |
| Position existe | Service | 404 | Not Found |
| Application existe | Service | 404 | Not Found |
| InterviewStep existe | Service | 404 | Not Found |
| InterviewStep pertenece al Flow | Service | 400 | Bad Request |

---

## 🧪 Casos de Prueba Sugeridos

### **GET /positions/:id/candidates**

1. ✅ Happy path: Posición con 3 candidatos, todos con entrevistas
2. ✅ Posición con candidatos sin entrevistas (averageScore = null)
3. ✅ Posición con candidatos con entrevistas pero sin scores
4. ✅ Posición sin candidatos (retornar array vacío)
5. ❌ Posición inexistente (404)
6. ❌ ID inválido: string, negativo, 0 (400)

### **PUT /candidates/:id/stage**

1. ✅ Happy path: Actualizar fase exitosamente
2. ✅ Actualizar a la misma fase (idempotente)
3. ✅ Retroceder en el proceso
4. ✅ Saltar fases
5. ❌ Candidato inexistente (404)
6. ❌ Posición inexistente (404)
7. ❌ Application inexistente (404)
8. ❌ InterviewStep inexistente (404)
9. ❌ InterviewStep de otro InterviewFlow (400)
10. ❌ Body inválido: campos faltantes, tipos incorrectos (400)
11. ❌ ID inválido en ruta (400)

---

## 📝 Especificación OpenAPI 3.0

### **Fragmento para api-spec.yaml**

```yaml
  /positions/{id}/candidates:
    get:
      summary: Get candidates for a position
      description: Retrieves all candidates who have applied to a specific position, including their current interview stage and average score.
      parameters:
        - name: id
          in: path
          required: true
          description: ID of the position
          schema:
            type: integer
            minimum: 1
      responses:
        '200':
          description: List of candidates retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  positionId:
                    type: integer
                  positionTitle:
                    type: string
                  candidatesCount:
                    type: integer
                  candidates:
                    type: array
                    items:
                      type: object
                      properties:
                        candidateId:
                          type: integer
                        fullName:
                          type: string
                        email:
                          type: string
                        applicationId:
                          type: integer
                        currentInterviewStep:
                          type: object
                          properties:
                            id:
                              type: integer
                            name:
                              type: string
                            orderIndex:
                              type: integer
                        averageScore:
                          type: number
                          nullable: true
                        interviewsCompleted:
                          type: integer
                        applicationDate:
                          type: string
                          format: date-time
        '400':
          description: Invalid position ID format
        '404':
          description: Position not found
        '500':
          description: Internal server error

  /candidates/{id}/stage:
    put:
      summary: Update candidate's interview stage
      description: Updates the current interview step for a candidate in a specific position.
      parameters:
        - name: id
          in: path
          required: true
          description: ID of the candidate
          schema:
            type: integer
            minimum: 1
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - positionId
                - newInterviewStepId
              properties:
                positionId:
                  type: integer
                  minimum: 1
                  description: ID of the position
                newInterviewStepId:
                  type: integer
                  minimum: 1
                  description: ID of the new interview step
      responses:
        '200':
          description: Candidate stage updated successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  data:
                    type: object
                    properties:
                      candidateId:
                        type: integer
                      candidateName:
                        type: string
                      positionId:
                        type: integer
                      positionTitle:
                        type: string
                      applicationId:
                        type: integer
                      previousInterviewStep:
                        type: object
                        properties:
                          id:
                            type: integer
                          name:
                            type: string
                      currentInterviewStep:
                        type: object
                        properties:
                          id:
                            type: integer
                          name:
                            type: string
                      updatedAt:
                        type: string
                        format: date-time
        '400':
          description: Invalid input or interview step does not belong to position's flow
        '404':
          description: Candidate, position, application, or interview step not found
        '500':
          description: Internal server error
```

---

## ✅ Checklist de Implementación

### **Antes de codificar**:
- [x] Contrato JSON definido para ambos endpoints
- [x] Validaciones identificadas
- [x] Casos especiales documentados
- [x] Códigos de error HTTP definidos
- [x] Casos de prueba listados

### **Durante la implementación**:
- [ ] Actualizar `api-spec.yaml` con los nuevos endpoints
- [ ] Implementar validaciones en el controller
- [ ] Implementar lógica de negocio en el service
- [ ] Calcular correctamente averageScore
- [ ] Validar InterviewStep pertenece al InterviewFlow
- [ ] Manejar todos los casos de error
- [ ] Mantener consistencia con respuestas existentes

### **Después de implementar**:
- [ ] Probar todos los casos happy path
- [ ] Probar todos los casos de error
- [ ] Verificar que los scores decimales se redondean correctamente
- [ ] Verificar manejo de null/undefined
- [ ] Code review aplicando SOLID y DRY

---

**Siguiente paso**: Implementar `GET /positions/:id/candidates`

