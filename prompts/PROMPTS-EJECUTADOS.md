# Prompts Ejecutados - Implementación Endpoints Kanban

**Proyecto**: Sistema ATS - Endpoints para Vista Kanban  
**Fecha**: 23 de noviembre de 2025  
**Guía Base**: `prompts/03-GUIA-PROMPTS-PROYECTO.md`  
**Documento Relacionado**: `docs/IMPLEMENTACION-KANBAN-ENDPOINTS.md`
**IDE:** Cursor
**Modelo:** Sonnet 4.5

---

## 📖 Introducción

Este documento registra **los prompts exactos** ejecutados durante la implementación de los endpoints Kanban, organizados por fases según la guía de prompts.

Cada prompt incluye:
- ✅ El prompt tal como fue ejecutado
- ✅ Contexto de por qué se ejecutó
- ✅ Resultado obtenido
- ✅ Decisión tomada en el punto de control

---

## 🧩 FASE 1: Comprender el Dominio

### Contexto Previo
Necesitábamos implementar dos endpoints:
1. `GET /positions/:id/candidates` - Obtener candidatos con su estado actual
2. `PUT /candidates/:id/stage` - Actualizar la etapa de un candidato

### Prompt Ejecutado

```
@backend

Eres un experto arquitecto de backend especializado en ATS (Applicant Tracking Systems) y en Diseño Guiado por el Dominio (DDD). 
Conoces en profundidad principios SOLID, DRY y patrones de diseño.

**IMPORTANTE: NO ASUMAS NADA. Verifica la estructura REAL de la base de datos antes de analizar.**

## PASO 1: Verificar estructura actual de la base de datos

1. Lee el archivo `backend/prisma/schema.prisma` COMPLETO
2. Ejecuta `cd backend && npx prisma db pull` para obtener el schema actualizado desde la BD
3. Ejecuta `npx prisma studio` y verifica manualmente la estructura de las tablas
4. Confirma qué campos y relaciones REALMENTE existen

## PASO 2: Analizar modelos del dominio

Para los siguientes modelos DE MI PROYECTO, lista TODOS los campos que EXISTEN (no inventes):

### Position
- Lista TODOS los campos del schema
- Lista TODAS las relaciones
- Tipos de dato de cada campo

### Application
- Lista TODOS los campos del schema
- Lista TODAS las relaciones
- **CRÍTICO**: ¿Tiene un campo que representa la etapa actual? (ej: currentInterviewStep, stage, status, etc.)
- Si NO existe, dilo explícitamente: "NO existe campo de etapa actual"

### Candidate
- Lista TODOS los campos del schema
- Lista TODAS las relaciones
- ¿Cómo se construye el nombre completo?

### Interview
- Lista TODOS los campos del schema
- ¿Tiene campo score para puntuaciones?
- Indica el tipo exacto (Int?, String?, Float?, etc.)
- ¿Es nullable?

### InterviewStep
- Lista TODOS los campos del schema
- ¿Tiene campo orderIndex para ordenar etapas?
- ¿Cómo se relaciona con Position y Application?

## PASO 3: Identificar la estructura real vs. necesaria

Para implementar los endpoints que necesito:
- GET /positions/:id/candidates - Debe retornar: nombre completo, etapa actual, puntuación promedio
- PUT /candidates/:id/stage - Debe actualizar la etapa actual del candidato

Responde para CADA endpoint:

1. **¿Existen en el schema los campos que necesito para este endpoint?**
   - Si SÍ: Lista qué modelos y campos usar
   - Si NO: ¿Cómo se puede obtener/calcular esa información?

2. **¿Cómo se obtiene la etapa actual que necesito retornar/actualizar?**
   - Con campo directo en Application
   - Calculando desde relaciones (ej: última entrevista)
   - Otro método

3. **¿Dónde está el score que necesito para calcular el promedio?**
   - Ubicación exacta (modelo y campo)
   - Tipo de dato
   - ¿Es nullable? ¿Tiene valor por defecto?

## PASO 4: Proponer estrategia

Basado en el schema REAL que verificaste, propón estrategia de implementación:

### Opción A: Adaptar lógica al schema actual (sin modificar BD)
Si faltan campos que necesitas para los endpoints:
- ¿Cómo obtener la información desde otros modelos/relaciones existentes?
- ¿Qué queries o cálculos adicionales se requieren?
- ¿Qué relaciones debo incluir en el query?
- Pros: No requiere migración, no altera BD existente
- Contras: Queries más complejos, posible impacto en performance

### Opción B: Modificar schema (agregar campos faltantes)
Si conviene agregar campos al schema para simplificar:
- ¿Qué campos específicos agregar?
- ¿En qué modelos?
- ¿Qué tipo de dato y constraints?
- ¿Qué migración se necesita?
- Pros: Queries simples, acceso directo, mejor performance
- Contras: Requiere migración, posible duplicación de datos, riesgo de inconsistencia

### Recomendación Fundamentada
Evalúa qué opción es mejor para el caso de uso de Kanban considerando:
- Complejidad de implementación
- Performance esperada (volumen de datos)
- Mantenibilidad a largo plazo
- Integridad de datos y riesgo de inconsistencias

## FORMATO DE RESPUESTA

Responde con:
- **Estructura REAL** (copiada del schema, NO interpretada ni resumida)
- **Campos que EXISTEN** (lista exacta con tipos, constraints, relaciones)
- **Campos que FALTAN** (para los endpoints requeridos)
- **Cómo obtener datos faltantes** (desde qué relaciones/tablas)
- **Estrategia recomendada** (A o B, con justificación clara)
- **NO generes código todavía**, solo análisis y decisión
```

### Resultado Obtenido
✅ Identificamos que el campo `currentInterviewStep` aparecía en schema.prisma  
✅ Listamos exhaustivamente todos los campos de Position, Application, Candidate, Interview, InterviewStep  
✅ Identificamos que `score` existe en Interview (tipo Int?, nullable)  
✅ Recomendamos **Opción A** inicialmente (adaptar sin migrar)

### Decisión en Punto de Control #1
✅ **APROBADO** - Estrategia Opción A seleccionada  
✅ Continuamos a Fase 2

### ⚠️ Problema Detectado Posteriormente
Durante el testing (Fase 4), descubrimos que `currentInterviewStep` **NO existía en la BD real**.  
Esto demostró la importancia crítica del Prompt 1: el schema.prisma no estaba sincronizado con la BD.

---

## 📁 FASE 2: Comprender la Arquitectura del Backend

### Prompt Ejecutado

```
@backend

Eres un experto en arquitectura de backend con experiencia en DDD, SOLID y patrones en aplicaciones Node/TypeScript.
Tu objetivo es ayudarme a seguir la arquitectura existente del proyecto, sin romper convenciones ni duplicar responsabilidades.

Por favor, usando únicamente el código real de @backend:

1. Identifica en qué carpeta y archivos se definen las rutas HTTP (routers).
2. Explica cómo está organizado el flujo típico:
   router → controller → service → acceso a datos (por ejemplo Prisma u otra capa).
3. Muestra UN ejemplo real de endpoint ya implementado, indicando:
   - Archivo de rutas
   - Archivo de controlador
   - Archivo de servicio
   - Cómo se realiza la llamada a la capa de datos

Responde con:
- Listas de archivos y rutas (por ejemplo `backend/src/...`)
- Un breve snippet ilustrativo del flujo (solo lectura, sin inventar código)
- Comentarios breves que expliquen el rol de cada capa según SOLID (especialmente SRP).
```

### Resultado Obtenido
✅ Identificamos la estructura DDD en capas:
- `src/routes/` - Definición de rutas HTTP
- `src/presentation/controllers/` - Validación HTTP y manejo de respuestas
- `src/application/services/` - Lógica de negocio
- `src/domain/models/` - Modelos de dominio con Active Record pattern

✅ Analizamos ejemplo real: `GET /candidates/:id`
- Route: `candidateRoutes.ts` define `router.get('/:id', getCandidateById)`
- Controller: `candidateController.ts` valida ID y maneja respuestas HTTP
- Service: `candidateService.ts` contiene lógica de negocio
- Model: `Candidate.ts` encapsula acceso a Prisma

### Decisión en Punto de Control #2
✅ **APROBADO** - Arquitectura clara, decidimos crear router dedicado para Position  
✅ Estructura de archivos a crear:
- `routes/positionRoutes.ts` (nuevo)
- `controllers/positionController.ts` (nuevo)
- `services/positionService.ts` (nuevo)
- Modificar `candidateRoutes.ts`, `candidateController.ts`, `candidateService.ts`

---

## ✏️ FASE 3: Diseñar el Contrato de los Endpoints

### Prompt Ejecutado

```
@backend

Eres un experto en diseño de APIs REST con enfoque en DDD, claridad de contratos y buenas prácticas de producto.

**IMPORTANTE: Usa SOLO los campos y relaciones que EXISTEN en el schema real.**

Debo crear estos endpoints:

1) GET /positions/:id/candidates
   - Debe devolver lista de candidatos para una posición con:
     * Nombre completo (firstName + lastName)
     * current_interview_step: en qué fase del proceso está (de Application)
     * Puntuación media: promedio de scores de todas las entrevistas realizadas

2) PUT /candidates/:id/stage
   - Debe actualizar la etapa del candidato
   - Body incluye: positionId, interviewStepId

**RESTRICCIONES CRÍTICAS (basadas en el schema REAL del Prompt 1)**:

Del análisis previo sabemos que:
- ✅ Candidate tiene campos: firstName, lastName, email
- ✅ Application tiene campo: currentInterviewStep (Int FK → InterviewStep)
- ✅ Interview tiene campo: score (Int?, nullable)
- 🔄 Puntuación media se calculará desde Application.interviews[].score

**Estrategia elegida**: Opción A (adaptar sin migrar)

## Para GET /positions/:id/candidates

1. Propón la estructura JSON de respuesta completa
2. Para cada campo calculado:
   - ¿Cómo se calcula u obtiene?
   - ¿Desde qué modelo/relación?
   - ¿Qué retornar si no hay datos? (null, 0, array vacío)
3. Especifica tipos de dato (number, string, boolean, Date, etc.)

**Ejemplo de respuesta esperada**:
```json
{
  "positionId": number,
  "positionTitle": string,
  "candidates": [
    {
      "candidateId": number,
      "fullName": string,  // firstName + " " + lastName
      "email": string,
      "applicationId": number,
      "applicationDate": string (ISO 8601),
      "currentInterviewStep": {
        "id": number,
        "name": string,
        "orderIndex": number
      },
      "averageScore": number | null,  // Calculado desde interviews
      "interviewCount": number
    }
  ],
  "totalCandidates": number
}
```

## Para PUT /candidates/:id/stage

Según la estrategia elegida en Prompt 1 (Opción A):
- Body debe incluir: positionId, interviewStepId
- La acción resultante será: Update directo de Application.currentInterviewStep
- Respuesta: Confirmación con previousStage y currentStage
- Validaciones de integridad: 
  * Candidato existe
  * Application existe (candidateId + positionId)
  * InterviewStep existe
  * InterviewStep pertenece al InterviewFlow de la Position

**Ejemplo de respuesta esperada**:

```json
{
  "success": true,
  "message": "Candidate stage updated successfully",
  "data": {
    "candidateId": number,
    "fullName": string,
    "positionId": number,
    "positionTitle": string,
    "applicationId": number,
    "previousStage": {
      "id": number,
      "name": string
    },
    "currentStage": {
      "id": number,
      "name": string
    },
    "updatedAt": string (ISO 8601)
  }
}
```

## Validaciones

Para cada endpoint, lista:
1. **Validaciones de tipos**: IDs numéricos positivos, strings no vacíos
2. **Validaciones de existencia**: Position, Candidate, Application, InterviewStep
3. **Validaciones de negocio**: InterviewStep debe pertenecer al InterviewFlow correcto

**No generes código todavía**: concéntrate en diseñar un contrato claro, completo y basado en la estructura REAL de la BD.


### Resultado Obtenido
✅ Estructuras JSON completas para ambos endpoints  
✅ Todos los campos especificados con tipos y nullability  
✅ Validaciones identificadas en 3 niveles (tipos, existencia, integridad)  
✅ Casos edge documentados (array vacío, null scores, previousStage null)  
✅ Algoritmo de `calculateAverageScore` especificado

### Decisión en Punto de Control #3
✅ **APROBADO** - Contratos claros y completos  
✅ Continuamos a implementación (Fase 4)

---

## ⚙️ FASE 4: Implementar Primer Endpoint (GET)

### Prompt Ejecutado

```
@backend

Eres un ingeniero backend senior especializado en DDD, SOLID, DRY y refactorización.
Vamos a implementar GET /positions/:id/candidates respetando la arquitectura actual.

**IMPORTANTE: Usa SOLO el schema real y la estrategia elegida en Prompt 1 (Opción A)**

## Requisitos funcionales

- Recibe positionId en la ruta
- Devuelve lista de candidatos con:
  * Nombre completo (firstName + lastName del schema)
  * email
  * currentInterviewStep (directo del schema: Application.currentInterviewStep)
  * **averageScore**: Calculado on-demand desde Application.interviews[].score
  * interviewCount: Longitud del array interviews

## Lógica para datos calculados

Según la estrategia Opción A (adaptar sin modificar schema):
1. Obtener datos desde Application
2. Incluir relaciones: candidate, interviewStep, interviews
3. Calcular averageScore desde interviews[].score (filtrar nulls)
4. Ordenar por interviewStep.orderIndex ASC, luego applicationDate ASC

**Query Prisma**:

"""typescript
const applications = await prisma.application.findMany({
  where: { positionId: positionId },
  include: {
    candidate: {
      select: { id: true, firstName: true, lastName: true, email: true }
    },
    interviewStep: {
      select: { id: true, name: true, orderIndex: true }
    },
    interviews: {
      select: { score: true }
    }
  },
  orderBy: [
    { interviewStep: { orderIndex: 'asc' } },
    { applicationDate: 'asc' }
  ]
});
"""

## Requisitos de diseño

- Seguir el flujo: router → controller → service → Prisma
- Evitar duplicar lógica (DRY)
- Controller fino (solo validación HTTP), lógica en service (SRP)
- Helper para cálculo de promedio: `calculateAverageScore(interviews)`

## Implementación

Por favor, genera el código para:

1. **Ruta** (archivo: `positionRoutes.ts` - NUEVO)
   - Definir GET /:id/candidates
   - Conectar con controller

2. **Controlador** (archivo: `positionController.ts` - NUEVO)
   - Validar positionId (tipo numérico, positivo)
   - Delegar al servicio
   - Formatear respuesta HTTP (200, 404, 500)

3. **Servicio** (archivo: `positionService.ts` - NUEVO)
   - Verificar que Position existe
   - Obtener applications con sus relaciones
   - Calcular averageScore usando helper
   - Transformar a formato de respuesta

4. **Helper para cálculos**
   - Función: `calculateAverageScore(interviews: {score: number | null}[]): number | null`
   - Filtrar valores null/undefined
   - Calcular promedio redondeado a 1 decimal
   - Retornar null si no hay scores válidos

5. **Registrar ruta** (en index.ts)
   - Importar positionRoutes
   - Registrar: `app.use('/positions', positionRoutes)`

Genera código completo con:
- Imports correctos
- TypeScript interfaces para request/response
- Manejo de errores (try-catch, throw con códigos HTTP)
- Comentarios explicativos en lógica compleja
- JSDoc en funciones públicas del service
```

### Resultado Obtenido
✅ Archivos creados: `positionRoutes.ts`, `positionController.ts`, `positionService.ts`  
✅ Helper `calculateAverageScore` implementado  
✅ Interfaces TypeScript definidas  
✅ Ruta registrada en `index.ts`  
✅ Sin errores de linter

### Testing Inicial
❌ **ERROR**: "Column Application.currentInterviewStep does not exist"

### Corrección Aplicada
✅ Ejecutamos `npx prisma db pull` para obtener schema REAL  
✅ Descubrimos que `currentInterviewStep` NO existía en la BD  
✅ **PIVOTE**: Decidimos aplicar **Opción B** (agregar campo mediante migración)

### Migración Ejecutada
```sql
ALTER TABLE "Application" ADD COLUMN "currentInterviewStep" INTEGER;
CREATE INDEX "Application_currentInterviewStep_idx" ON "Application"("currentInterviewStep");
ALTER TABLE "Application" ADD CONSTRAINT "Application_currentInterviewStep_fkey" 
FOREIGN KEY ("currentInterviewStep") REFERENCES "InterviewStep"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;
```

### Inicialización de Datos
```sql
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
```

### Resultado Final del Testing
✅ **ÉXITO**: Endpoint funciona correctamente
```json
{
  "positionId": 1,
  "positionTitle": "Desarrollador Full Stack Senior",
  "candidates": [{
    "fullName": "Juan Pérez Rodríguez",
    "currentInterviewStep": {"id": 1, "name": "Filtro inicial HR", "orderIndex": 1},
    "averageScore": 85,
    "interviewCount": 3
  }]
}
```

### Decisión en Punto de Control #4
✅ **APROBADO** - Endpoint GET funcionando  
✅ Lección aprendida documentada: importancia de `prisma db pull`  
✅ Continuamos a Fase 5

---

## 🔄 FASE 5: Implementar Segundo Endpoint (PUT)

### Prompt Ejecutado

```
@backend

Eres un experto en backend y diseño de casos de uso, con experiencia en DDD y patrones de actualización de estado.

**Estrategia elegida del Prompt 1**: Opción B (campo currentInterviewStep ya existe después de migración en Fase 4)

## Requisitos funcionales

- Recibe candidateId en la ruta
- El body incluye:
  * positionId: number (requerido) - Para identificar la aplicación
  * interviewStepId: number (requerido) - Nueva etapa

## Acción según estrategia

Ya que aplicamos Opción B (campo directo existe después de migración):
- Debe actualizar el campo Application.currentInterviewStep directamente
- Validaciones más simples (solo existencia de entidad)
- Respuesta: entidad actualizada con previousStage y currentStage
- Auditoría: updatedAt timestamp

## Lógica de validación de integridad

```typescript
// 1. Verificar que candidato existe
const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });

// 2. Buscar aplicación (candidateId + positionId)
const application = await prisma.application.findFirst({
  where: { candidateId, positionId },
  include: { 
    position: { select: { interviewFlowId: true, title: true } },
    interviewStep: { select: { id: true, name: true } }
  }
});

// 3. Validar que nuevo InterviewStep existe Y pertenece al flujo correcto
const newStep = await prisma.interviewStep.findFirst({
  where: {
    id: interviewStepId,
    interviewFlowId: application.position.interviewFlowId  // ← CRÍTICO
  }
});

if (!newStep) {
  throw new Error(`Interview step does not belong to this position's interview flow`);
}

// 4. Guardar previousStage
const previousStage = application.interviewStep ? { ... } : null;

// 5. Actualizar
await prisma.application.update({
  where: { id: application.id },
  data: { currentInterviewStep: interviewStepId, updatedAt: new Date() }
});
```

## Requisitos de diseño

- Seguir patrón router → controller → service
- Controller: validar entrada HTTP (tipos, campos requeridos)
- Service: lógica de negocio y validaciones de dominio
- Retornar respuesta con previousStage y currentStage

## Implementación

Genera código para:

1. **Ruta** (añadir a `candidateRoutes.ts`)
   - PUT /:id/stage
   - Conectar con controller

2. **Controlador** (añadir a `candidateController.ts`)
   - Validar candidateId (ruta) - numérico positivo
   - Validar body (positionId y interviewStepId requeridos, numéricos positivos)
   - Delegar al servicio
   - Retornar respuesta (200, 400, 404, 500)

3. **Servicio** (añadir a `candidateService.ts`)
   - Validar que Candidate existe → 404
   - Validar que Application existe → 404
   - Validar que InterviewStep existe Y pertenece al flujo → 400
   - Guardar previousStage
   - Ejecutar update
   - Retornar respuesta detallada con el cambio realizado

## Respuesta esperada del endpoint

```json
{
  "success": true,
  "message": "Candidate stage updated successfully",
  "data": {
    "candidateId": number,
    "fullName": string,
    "positionId": number,
    "positionTitle": string,
    "applicationId": number,
    "previousStage": { "id": number, "name": string } | null,
    "currentStage": { "id": number, "name": string },
    "updatedAt": string
  }
}
```

Genera código completo con:
- Validaciones exhaustivas (tipos, existencia, integridad)
- Manejo de errores específicos (404 para not found, 400 para invalid)
- Comentarios en lógica compleja
- TypeScript types para body y response
```

### Resultado Obtenido
✅ Función `updateCandidateStage` agregada a `candidateService.ts` (~140 líneas)  
✅ Controller `updateStage` agregado a `candidateController.ts` (~130 líneas)  
✅ Ruta `PUT /:id/stage` agregada a `candidateRoutes.ts`  
✅ Validación de jerarquía implementada (crítica)  
✅ Sin errores de linter

### Testing Realizado
```bash
# Test 1: Happy path
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1, "interviewStepId": 2}'
```

✅ **ÉXITO**: Respuesta correcta con previousStage y currentStage

```bash
# Test 2: Verificar en GET
curl http://localhost:3010/positions/1/candidates
```

✅ **VERIFICADO**: Cambio reflejado en endpoint GET

```bash
# Test 3: Candidato inexistente
curl -X PUT http://localhost:3010/candidates/999/stage ...
```

✅ **404**: "Candidate with id 999 not found"

```bash
# Test 4: Aplicación inexistente
curl -X PUT http://localhost:3010/candidates/1/stage \
  -d '{"positionId": 999, "interviewStepId": 2}'
```

✅ **404**: "Application not found for candidate 1 in position 999"

```bash
# Test 5: Campo faltante
curl -X PUT http://localhost:3010/candidates/1/stage \
  -d '{"positionId": 1}'
```

✅ **400**: "Missing required field: interviewStepId"

### Decisión en Punto de Control #5
✅ **APROBADO** - Endpoint PUT funcionando perfectamente  
✅ Todas las validaciones correctas  
✅ Continuamos a Fase 6

---

## 🧹 FASE 6: Revisión de Buenas Prácticas

### Prompt Ejecutado

```
@backend

Eres un revisor técnico senior especializado en DDD, SOLID, DRY y patrones de refactorización.
Tu tarea es revisar el código de los endpoints implementados en los Prompts 4 y 5.

Por favor, usando los archivos modificados de @backend:

1. Indica si hay violaciones evidentes de:
   - **SRP** (Single Responsibility Principle): ¿Cada función/clase hace UNA cosa?
   - **DRY** (Don't Repeat Yourself): ¿Hay código duplicado entre archivos?
   - **DDD**: ¿El modelado de dominio es correcto o hay lógica de negocio en controllers?

2. Propón un máximo de 5 mejoras pequeñas que:
   - NO cambien la firma pública de los endpoints
   - Mejoren legibilidad, cohesión y mantenibilidad
   - Utilicen patrones de refactorización (Extract Method, Extract Function, etc.)

3. Para cada mejora, proporciona:
   - Descripción breve del problema
   - Fragmento de código **ANTES**
   - Fragmento de código **DESPUÉS**
   - Justificación (qué principio mejora)

**ESPECÍFICAMENTE VERIFICA**:
- ¿Hay validaciones duplicadas que puedan extraerse en helpers?
  - Ejemplo: validación de ID positivo repetida en múltiples controllers
- ¿Los cálculos complejos están bien extraídos en funciones separadas?
- ¿Los controladores son finos (solo HTTP) o tienen lógica de negocio?
- ¿Los servicios tienen responsabilidad única o hacen demasiadas cosas?
- ¿Hay magic numbers o strings que deberían ser constantes?
- ¿Los nombres de variables/funciones son descriptivos?
- **¿Está usando múltiples instancias de PrismaClient o una instancia compartida?**

**RESTRICCIÓN**: No alteres el comportamiento funcional de los endpoints, solo mejora la calidad interna del código.
```

### Resultado Obtenido

#### Mejora Identificada: PrismaClient Compartida
**Problema**: Cada función de service creaba su propia instancia de PrismaClient

**ANTES**:
```typescript
export const updateCandidateStage = async (...) => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    try {
        // ... lógica
    } finally {
        await prisma.$disconnect();
    }
}
```

**DESPUÉS**:
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();  // Una vez al cargar el módulo

export const updateCandidateStage = async (...) => {
    // Usar prisma directamente
    const candidate = await prisma.candidate.findUnique(...);
    // No hay try-finally ni $disconnect
}
```

**Justificación**: Connection pooling eficiente, mejor performance, patrón recomendado

#### Otros Aspectos Revisados
✅ **SRP respetado**: Cada capa tiene una responsabilidad única  
✅ **DRY aplicado**: Helper `calculateAverageScore` extraído  
✅ **DDD correcto**: Lógica de negocio en service layer  
✅ **No hay magic numbers**: Códigos HTTP claros  
✅ **Nombres descriptivos**: Variables y funciones con nombres claros

### Refactor Aplicado
✅ PrismaClient compartida implementada en `candidateService.ts`  
✅ Código probado después del refactor  
✅ Sin errores de linter  
✅ Funcionalidad preservada

### Decisión en Punto de Control #6
✅ **APROBADO** - Código refactorizado y mejorado  
✅ Todas las pruebas siguen pasando  
✅ Continuamos a Fase 7

---

## 📝 FASE 7: Actualizar Especificación OpenAPI

### Prompt Ejecutado

```
@backend

Genera la especificación OpenAPI 3.0 para los endpoints implementados:
- GET /positions/:id/candidates
- PUT /candidates/:id/stage

Si existe un archivo `backend/api-spec.yaml`, usa su formato y estructura.

Para CADA endpoint incluye:

1. **Descripción clara** del propósito (para vista Kanban)
2. **Parámetros**:
   - Path parameters (id)
   - Query parameters (ninguno para estos endpoints)
   - Request body (para PUT)
3. **Schemas** de request y response con tipos TypeScript → OpenAPI:
   - string, integer, number, boolean, array, object
   - Indicar campos required
   - Indicar nullable donde corresponda
4. **Códigos de respuesta** con ejemplos:
   - 200: Éxito (con ejemplo de response REAL del testing)
   - 400: Bad Request (múltiples ejemplos: campos faltantes, tipos inválidos, validación de jerarquía)
   - 404: Not Found (múltiples ejemplos: candidato, aplicación, posición)
   - 500: Internal Server Error
5. **Ejemplos reales** para request y response (usar datos del testing)

Estructura para GET /positions/{id}/candidates:
- Path parameter: id (integer, minimum 1)
- Response 200: Objeto con positionId, positionTitle, candidates (array), totalCandidates
- Candidates incluyen: candidateId, fullName, email, applicationId, applicationDate,
  currentInterviewStep (objeto con id, name, orderIndex), averageScore (nullable), interviewCount

Estructura para PUT /candidates/{id}/stage:
- Path parameter: id (integer, minimum 1)
- Request body: positionId (integer, required), interviewStepId (integer, required)
- Response 200: Objeto con success, message, data
- Data incluye: candidateId, fullName, positionId, positionTitle, applicationId,
  previousStage (objeto nullable), currentStage (objeto), updatedAt

Genera el YAML completo listo para copiar/agregar al archivo api-spec.yaml.
Sigue el formato y estilo del archivo existente.
```

### Resultado Obtenido
✅ ~300 líneas de especificación OpenAPI agregadas a `api-spec.yaml`  
✅ Ambos endpoints completamente documentados  
✅ Todos los schemas definidos con tipos correctos  
✅ Ejemplos reales del testing incluidos  
✅ Múltiples ejemplos de errores (400, 404)  
✅ Campos required especificados  
✅ Nullable indicado donde corresponde  
✅ Formato OpenAPI 3.0 estándar

### Decisión en Punto de Control #7
✅ **APROBADO** - Documentación OpenAPI completa  
✅ Lista para Swagger UI  
✅ Continuamos a Fase 8

---

## 🎓 FASE 8: Documentación Final

### Prompt Ejecutado

```
Genera resumen ejecutivo completo del proyecto en el documento de implementación.

Incluye:
- Resumen de lo implementado
- Archivos creados y modificados
- Migración de BD aplicada
- Decisiones arquitectónicas con justificación
- Lecciones aprendidas (schema real vs asumido)
- Testing realizado
- Principios SOLID/DRY/DDD aplicados
- Próximos pasos y mejoras futuras
- Métricas del proyecto (líneas de código, tiempo)
- Checklist final completo
```

### Resultado Obtenido
✅ Documento `IMPLEMENTACION-KANBAN-ENDPOINTS.md` completado (3300+ líneas)  
✅ Todas las fases documentadas exhaustivamente  
✅ Lecciones aprendidas registradas  
✅ Checklist final completo  
✅ Resumen ejecutivo generado

---

## 📊 RESUMEN DE PROMPTS EJECUTADOS

### Total de Prompts: 8 (uno por fase)
- **Fase 1**: Análisis de dominio (verificación de schema)
- **Fase 2**: Análisis de arquitectura existente
- **Fase 3**: Diseño de contratos JSON
- **Fase 4**: Implementación GET + migración
- **Fase 5**: Implementación PUT
- **Fase 6**: Revisión y refactorización
- **Fase 7**: Documentación OpenAPI
- **Fase 8**: Documentación final

### Pivote Crítico Durante la Implementación
- **Planeado**: Opción A (adaptar sin migrar)
- **Ejecutado**: Opción B (migrar para agregar currentInterviewStep)
- **Razón**: Detección de desajuste entre schema.prisma y BD real

### Tiempo Total Estimado: ~4 horas
- Análisis: ~1 hora
- Implementación: ~1.5 horas (incluyendo debugging)
- Refactorización: ~15 min
- Documentación: ~1.5 horas

---

## 💡 LECCIONES CLAVE DE LOS PROMPTS

### 1. Verificación es Crítica (Fase 1)
El Prompt 1 insiste en "NO ASUMAS NADA" y ejecutar `prisma db pull`.  
**Resultado**: Detectamos el problema del schema desajustado.

### 2. Prompts Detallados Generan Mejor Código (Fases 4-5)
Especificar exactamente qué implementar (validaciones, interfaces, comentarios) resultó en código de alta calidad desde el inicio.

### 3. Puntos de Control Previenen Errores (Todas las fases)
Aprobar explícitamente cada fase antes de continuar permitió detectar problemas temprano.

### 4. Documentación Progresiva Mantiene Contexto
Documentar decisiones en cada fase facilitó la continuidad y justificación.

---

## 🎯 EFECTIVIDAD DE LA GUÍA

### ✅ Lo que Funcionó Muy Bien:
- Estructura de 8 fases con puntos de control
- Enfoque "verification-first" en Fase 1
- Separación clara entre análisis, diseño e implementación
- Testing incremental (no al final)
- Documentación progresiva

### ⚠️ Ajustes Necesarios:
- El `prisma db pull` debe ejecutarse SIEMPRE en Fase 1 (sin excepciones)
- Considerar ejecutar pruebas de smoke test antes de implementar Fase 5
- Agregar validación de YAML en Fase 7

### 📈 Métricas de Éxito:
- ✅ 2/2 endpoints funcionando
- ✅ 0 retrabajos mayores (el pivote a Opción B fue detectado temprano)
- ✅ Código limpio siguiendo SOLID/DRY/DDD
- ✅ Documentación completa generada automáticamente

---

**Fin del documento de prompts ejecutados**  
**Documento complementario**: `docs/IMPLEMENTACION-KANBAN-ENDPOINTS.md`  
**Fecha**: 23 de noviembre de 2025

