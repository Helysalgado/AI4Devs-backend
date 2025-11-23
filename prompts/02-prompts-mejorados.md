# Prompts Mejorados para el ejercicio de endpoints LTI

Este documento contiene los prompts **CORREGIDOS** después de identificar el error en el análisis inicial del dominio.

**Problema detectado**: El análisis inicial asumió que existía un campo `currentInterviewStep` en `Application`, pero el schema real NO lo tiene.

---

## 🔧 Mejoras Aplicadas a los Prompts

1. **Verificación obligatoria** de la estructura real de la BD
2. **Prohibición explícita** de asumir campos o relaciones
3. **Uso de herramientas** (prisma studio, db pull) antes de diseñar
4. **Validación continua** entre lo esperado y lo real

---

## 🧩 1. Comprender el dominio (MEJORADO)

### **Prompt Mejorado**
```
@backend

Eres un experto arquitecto de backend especializado en sistemas ATS y en Diseño Guiado por el Dominio (DDD). 
Conoces en profundidad principios SOLID, DRY y patrones de diseño.

**IMPORTANTE: NO ASUMAS NADA. Verifica la estructura REAL de la base de datos antes de analizar.**

## PASO 1: Verificar estructura actual de la base de datos

1. Lee el archivo `backend/prisma/schema.prisma` COMPLETO
2. Ejecuta `cd backend && npx prisma db pull` para obtener el schema actualizado desde la BD
3. Ejecuta `npx prisma studio` y verifica manualmente la estructura de las tablas
4. Confirma qué campos y relaciones REALMENTE existen

## PASO 2: Analizar modelos del dominio

Para los siguientes modelos, lista TODOS los campos que EXISTEN (no inventes):

### Candidate
- Lista TODOS los campos del schema
- Lista TODAS las relaciones

### Application
- Lista TODOS los campos del schema
- Lista TODAS las relaciones
- **CRÍTICO**: ¿Tiene un campo que representa la fase actual? (ej: currentInterviewStep, currentStage, etc.)
- Si NO existe, dilo explícitamente: "NO existe campo de fase actual"

### Position
- Lista TODOS los campos del schema
- Lista TODAS las relaciones con interviewFlow

### Interview
- Lista TODOS los campos del schema
- ¿Dónde está el campo score? Indica el tipo exacto (Int?, String?, etc.)
- ¿Cómo se relaciona con Application?
- ¿Cómo se relaciona con InterviewStep?

### InterviewStep
- Lista TODOS los campos del schema
- ¿Cómo se relaciona con InterviewFlow?
- ¿Tiene un campo orderIndex para secuencia?

## PASO 3: Identificar la estructura real vs. necesaria

Para implementar los endpoints:
- GET /positions/:id/candidates (con fase actual y averageScore)
- PUT /candidates/:id/stage (actualizar fase)

Responde:

1. **¿Existe un campo en Application que indique la fase actual?**
   - Si SÍ: ¿Cuál es y de qué tipo?
   - Si NO: ¿Cómo se puede determinar la fase actual? (ej: última Interview)

2. **¿Cómo se calcula la fase actual de un candidato?**
   - Con campo directo en Application
   - Con la última Interview realizada
   - Otro método

3. **¿El score está en Interview o en Application?**
   - Ubicación exacta
   - Tipo de dato
   - ¿Es nullable?

## PASO 4: Proponer estrategia

Basado en el schema REAL, propón:

### Opción A: Adaptar lógica al schema actual
Si NO existe `currentInterviewStep` en Application:
- GET: Obtener fase desde la última Interview
- PUT: Crear una nueva Interview (no solo actualizar un campo)
- Pros y contras de esta opción

### Opción B: Modificar schema (agregar campos)
Si conviene agregar `currentInterviewStep`:
- Qué campo agregar
- Tipo de dato
- Migración necesaria
- Pros y contras de esta opción

### Recomendación
¿Qué opción es mejor para el caso de uso ATS?

## FORMATO DE RESPUESTA

Responde con:
- **Estructura REAL** (copiada del schema, no interpretada)
- **Campos que EXISTEN** (lista exacta con tipos)
- **Campos que FALTAN** (para los endpoints requeridos)
- **Estrategia recomendada** (A o B, con justificación)
- **NO generes código todavía**, solo análisis
```

### **Por qué este prompt es mejor**

1. ✅ **Fuerza verificación**: "ejecuta prisma db pull", "ejecuta prisma studio"
2. ✅ **Prohibe asumir**: "NO ASUMAS NADA"
3. ✅ **Pide TODO**: "lista TODOS los campos" (no resúmenes)
4. ✅ **Pregunta crítica**: "¿Tiene campo de fase actual? Si NO, dilo explícitamente"
5. ✅ **Contempla desajustes**: "Opción A vs Opción B"
6. ✅ **Pide estrategia**: No solo analiza, propone solución

---

## 📁 2. Comprender la arquitectura del backend (SIN CAMBIOS)

El prompt original del paso 2 es correcto, no necesita modificaciones significativas ya que se enfoca en la estructura de código, no en la base de datos.

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

---

## ✏️ 3. Diseñar el contrato de los endpoints (MEJORADO)

### **Prompt Mejorado**
```
@backend

Eres un experto en diseño de APIs REST con enfoque en DDD, claridad de contratos y buenas prácticas de producto.

**IMPORTANTE: Usa SOLO los campos y relaciones que EXISTEN en el schema real.**

Debo crear estos endpoints:

1) GET /positions/:id/candidates
   - Debe devolver, para una posición:
     * id del candidato
     * nombre completo del candidato (desde Candidate.firstName + lastName)
     * fase actual del proceso
     * media de score de las entrevistas asociadas

2) PUT /candidates/:id/stage
   - Debe actualizar la fase actual del proceso para un candidato en una posición

**RESTRICCIONES CRÍTICAS (basadas en el schema REAL)**:

Del análisis previo sabemos que:
- ❌ Application NO tiene campo `currentInterviewStep`
- ✅ Interview tiene `interviewStepId` y `score`
- ✅ Para saber la fase actual: buscar la última Interview

**PREGUNTA CLAVE ANTES DE DISEÑAR**:

¿Cómo implementamos "actualizar fase" si NO existe `currentInterviewStep` en Application?

Opciones:
A) Crear una nueva Interview con el nuevo interviewStepId (más correcto para ATS)
B) Agregar campo `currentInterviewStep` al schema (requiere migración)
C) Usar el campo `status` de Application (pero no es específico de paso)

**Elige la opción más apropiada** y diseña el contrato basado en esa decisión.

## Para GET /positions/:id/candidates

1. Propón la estructura JSON de respuesta
2. ¿Cómo se calcula "fase actual"?
   - Si no hay campo directo: usar la Interview más reciente ordenada por `interviewDate` DESC
   - Incluir `interviewStep.name` y `interviewStep.orderIndex`
3. ¿Cómo se calcula averageScore?
   - Promedio de `Interview.score` donde `score IS NOT NULL`
   - ¿Qué retornar si no hay interviews? (null o 0)

## Para PUT /candidates/:id/stage

Según la opción elegida (A, B o C):

**Si elegiste A (crear Interview)**:
- Body debe incluir: positionId, newInterviewStepId, employeeId, interviewDate
- Respuesta: detalles de la Interview creada
- Consideración: ¿Requiere que exista un Employee?

**Si elegiste B (agregar campo)**:
- Body debe incluir: positionId, newInterviewStepId
- Respuesta: Application actualizada
- Consideración: Requiere migración antes de implementar

**Si elegiste C (usar status)**:
- Explica por qué esta opción NO es apropiada para un ATS real

## Validaciones

Para ambos endpoints, lista:
1. Validaciones de tipos (IDs positivos, etc.)
2. Validaciones de existencia (Position existe, Candidate existe, etc.)
3. Validaciones de negocio específicas del schema real

**No generes código todavía**: concéntrate en diseñar un contrato claro basado en la estructura REAL de la BD.
```

### **Por qué este prompt es mejor**

1. ✅ **Usa schema real**: "SOLO los campos que EXISTEN"
2. ✅ **Reconoce restricción**: "Application NO tiene currentInterviewStep"
3. ✅ **Pide decisión**: Opción A vs B vs C
4. ✅ **Adapta contrato**: El diseño cambia según la opción
5. ✅ **Más realista**: Considera requisitos del mundo real (employeeId, etc.)

---

## ⚙️ 4. Implementación de GET /positions/:id/candidates (MEJORADO)

### **Prompt Mejorado**
```
@backend

Eres un ingeniero backend senior especializado en DDD, SOLID, DRY y refactorización.
Vamos a implementar GET /positions/:id/candidates respetando la arquitectura actual.

**IMPORTANTE: Usa SOLO el schema real. Application NO tiene campo currentInterviewStep.**

## Requisitos funcionales

- Recibe positionId en la ruta
- Devuelve lista de candidatos para esa posición, cada uno con:
  * id del candidato
  * nombre completo (firstName + lastName)
  * **fase actual**: calculada desde la Interview más reciente
  * averageScore: promedio de Interview.score (excluir nulls)
  * interviewsCompleted: cantidad de interviews

## Lógica para obtener fase actual

Ya que Application NO tiene `currentInterviewStep`, debes:

1. Para cada Application:
   - Obtener todas sus Interviews con `include: { interviewStep: true }`
   - Ordenar por `interviewDate DESC`
   - La primera (más reciente) indica la fase actual
   - Si no hay interviews: fase = null o "Not Started"

2. Query recomendado:
```typescript
const applications = await prisma.application.findMany({
  where: { positionId },
  include: {
    candidate: { select: { id, firstName, lastName, email } },
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
```

## Requisitos de diseño

- Seguir el flujo router → controller → service → Prisma
- Evitar duplicar lógica (DRY)
- Controller fino, lógica en service (SRP)
- Extraer cálculo de averageScore en función separada

## Implementación

Por favor, genera el código para:

1. **Ruta** (positionRoutes.ts o crear archivo nuevo)
2. **Controlador** (positionController.ts)
   - Validar positionId
   - Delegar al servicio
   - Formatear respuesta
3. **Servicio** (positionService.ts)
   - Verificar Position existe
   - Obtener Applications con Interviews
   - Para cada Application:
     * Calcular fase actual (última Interview)
     * Calcular averageScore
   - Transformar a formato de respuesta
4. **Helper para averageScore**
   - Función: `calculateAverageScore(interviews)`
   - Filtrar scores no-null
   - Calcular promedio
   - Redondear a 1 decimal

## Consideraciones especiales

- Si Application no tiene Interviews: `currentInterviewStep: null, averageScore: null`
- Si Position no existe: error 404
- Si Position no tiene Applications: retornar array vacío (no 404)

Genera código completo con:
- Imports correctos
- TypeScript interfaces
- Manejo de errores
- Comentarios explicativos
- JSDoc en funciones públicas
```

---

## 🔄 5. Implementación de PUT /candidates/:id/stage (MEJORADO)

### **Prompt Mejorado**
```
@backend

Eres un experto en backend y diseño de casos de uso, con experiencia en DDD y patrones de actualización de estado.

**DECISIÓN CRÍTICA**: Ya que Application NO tiene `currentInterviewStep`, vamos a implementar este endpoint creando una nueva Interview (approach más correcto para un ATS real).

## Requisitos funcionales

- Recibe candidateId en la ruta
- El body incluye:
  * positionId: para identificar la Application
  * newInterviewStepId: el paso al que avanza
  * employeeId: quién registra este cambio
  * interviewDate: fecha de la interview (default: now)
  * notes: notas opcionales

- Debe:
  1. Localizar la Application (candidateId + positionId)
  2. Validar que el candidate, position, interviewStep y employee existen
  3. Validar que newInterviewStepId pertenece al InterviewFlow de la Position
  4. **Crear una nueva Interview** con:
     - applicationId
     - interviewStepId = newInterviewStepId
     - employeeId
     - interviewDate
     - result = 'PENDING' (default)
     - score = null (se registra después)
     - notes
  5. Retornar resumen del cambio

## Lógica de validación del InterviewFlow

```typescript
// Verificar que el InterviewStep pertenece al InterviewFlow de la Position
const interviewStep = await prisma.interviewStep.findFirst({
  where: {
    id: newInterviewStepId,
    interviewFlowId: position.interviewFlowId
  }
});

if (!interviewStep) {
  throw new Error(`Interview step ${newInterviewStepId} does not belong to the interview flow of position ${positionId}`);
}
```

## Requisitos de diseño

- Seguir patrón router → controller → service
- Controller: validar entrada HTTP
- Service: lógica de negocio y validaciones de dominio
- Transacción si es necesario (en este caso, solo un INSERT)

## Implementación

Genera código para:

1. **Ruta** (candidateRoutes.ts - agregar PUT /:id/stage)
2. **Controlador** (candidateController.ts - función updateCandidateStage)
   - Validar candidateId (ruta)
   - Validar body (positionId, newInterviewStepId, employeeId)
   - Delegar al servicio
3. **Servicio** (candidateService.ts - función updateApplicationStage o createInterviewForStage)
   - Validar Candidate existe
   - Validar Position existe
   - Buscar Application (candidateId + positionId)
   - Validar Application existe
   - Validar Employee existe
   - Validar InterviewStep existe y pertenece al InterviewFlow
   - Crear Interview
   - Retornar respuesta detallada

## Respuesta esperada

```json
{
  "message": "Interview stage updated successfully",
  "data": {
    "candidateId": 1,
    "candidateName": "John Doe",
    "positionId": 1,
    "positionTitle": "Software Engineer",
    "applicationId": 1,
    "interviewCreated": {
      "id": 5,
      "interviewStepId": 2,
      "interviewStepName": "Technical Interview",
      "interviewDate": "2024-11-23T10:00:00Z",
      "result": "PENDING"
    }
  }
}
```

## Casos especiales

- Si no existe Application: 404 "No application found for candidate X in position Y"
- Si InterviewStep no pertenece al flow: 400 "Interview step does not belong to flow"
- Si Employee no existe: 404 "Employee not found"

Genera código completo con validaciones exhaustivas.
```

---

## 🧹 6. Revisión de buenas prácticas (SIN CAMBIOS MAYORES)

El prompt original es válido, solo agregar una nota:

```
... (prompt original) ...

**NOTA ADICIONAL**: Verifica que el código implementado:
- NO asume campos que no existen en el schema (como currentInterviewStep en Application)
- Usa correctamente las relaciones del schema real
- Calcula la fase actual desde Interview cuando sea necesario
```

---

## 📝 7. Generación del archivo de documentación (SIN CAMBIOS)

El prompt original es válido.

---

## 📊 Resumen de Cambios en los Prompts

| Prompt | Cambio Principal | Razón |
|--------|------------------|-------|
| **#1 Dominio** | Agregar verificación obligatoria con herramientas | Evitar asumir campos inexistentes |
| **#2 Arquitectura** | Sin cambios | No depende del schema |
| **#3 Contratos** | Diseñar considerando ausencia de currentInterviewStep | Adaptar al schema real |
| **#4 GET** | Calcular fase desde última Interview | Application no tiene el campo |
| **#5 PUT** | Crear Interview en lugar de update campo | Approach más correcto para ATS |
| **#6 Revisión** | Nota adicional sobre schema real | Validar contra realidad |
| **#7 Docs** | Sin cambios | No afecta |

---

## ✅ Checklist para Evitar Errores Futuros

Antes de diseñar endpoints en cualquier proyecto:

- [ ] Ejecutar `npx prisma db pull` para schema actualizado
- [ ] Abrir `npx prisma studio` y verificar estructura visualmente
- [ ] Listar TODOS los campos de cada modelo (no resumir)
- [ ] Confirmar qué relaciones existen (no asumir)
- [ ] Si un campo crítico no existe, decidir: ¿agregar o adaptar?
- [ ] Documentar diferencias entre schema esperado y real
- [ ] Diseñar contrato basado en schema REAL

---

**Próximo paso**: Usar estos prompts mejorados para re-implementar los endpoints correctamente.

