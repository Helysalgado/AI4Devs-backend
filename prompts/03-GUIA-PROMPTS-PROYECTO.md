# Guía de Prompts - Implementación de Endpoints Backend

**Propósito**: Plantilla reutilizable de prompts para implementar endpoints en proyectos Node.js + TypeScript + Prisma  
**Metodología**: DDD, SOLID, DRY con verificación continua del schema real  
**Resultado**: Endpoints funcionando correctamente desde el primer intento

---

## 📖 Cómo Usar Esta Guía

Esta guía contiene los prompts EXACTOS que debes usar en orden para implementar endpoints backend siguiendo mejores prácticas.

### **Requisitos previos**:
- Proyecto con Prisma configurado
- Base de datos accesible
- IDE con capacidad de referenciar código (ej: Cursor con @backend)

### **Flujo de trabajo** (IMPORTANTE):
1. **Ejecuta UN prompt a la vez**
2. **DETENTE y revisa** la respuesta completamente
3. **Valida con herramientas** (prisma studio, curl, linter)
4. **Aprueba explícitamente** antes de continuar al siguiente prompt
5. **NO avances** si algo no está claro o correcto
6. **Documenta** decisiones en cada paso

⚠️ **CRÍTICO**: No ejecutes todos los prompts seguidos. Cada prompt es un punto de control donde DEBES revisar y aprobar antes de avanzar.

---

## 🎯 Contexto del Proyecto (PERSONALIZAR)

**Sistema**: [TU SISTEMA - ej: E-commerce, Blog, CRM, etc.]  
**Endpoints a implementar**:
- `[MÉTODO] /[recurso]/:id/[sub-recurso]` - [Descripción]
- `[MÉTODO] /[recurso]/:id/[acción]` - [Descripción]

**Stack**: Node.js, TypeScript, Express, Prisma, PostgreSQL

⚠️ **NOTA**: Esta guía usa ejemplos genéricos. Reemplaza con tu dominio específico.

---

# 📝 PROMPTS EN ORDEN

---

## 🧩 PROMPT 1: Comprender el Dominio

### **Por qué este prompt primero**:
Antes de escribir código, DEBES entender el modelo de datos REAL. Este prompt fuerza verificación explícita y prohíbe asunciones.

### **Prompt**:

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

### Opción A: Adaptar lógica al schema actual (sin modificar BD)
Si faltan campos que necesitas para los endpoints:
- ¿Cómo obtener la información desde otros modelos/relaciones?
- ¿Qué queries o cálculos adicionales se requieren?
- Pros: No requiere migración, no altera BD
- Contras: Queries más complejos, posible impacto en performance

### Opción B: Modificar schema (agregar campos faltantes)
Si conviene agregar campos al schema:
- ¿Qué campos específicos agregar?
- ¿En qué modelos?
- ¿Qué tipo de dato?
- ¿Qué migración se necesita?
- Pros: Queries simples, acceso directo
- Contras: Requiere migración, posible duplicación de datos

### Recomendación
Evalúa qué opción es mejor para tu caso de uso considerando:
- Complejidad de implementación
- Performance
- Mantenibilidad a largo plazo
- Integridad de datos

## FORMATO DE RESPUESTA

Responde con:
- **Estructura REAL** (copiada del schema, no interpretada)
- **Campos que EXISTEN** (lista exacta con tipos)
- **Campos que FALTAN** (para los endpoints requeridos)
- **Estrategia recomendada** (A o B, con justificación)
- **NO generes código todavía**, solo análisis
```

### **Resultado esperado**:
- Lista exacta de campos del schema
- Identificación de si existe `currentInterviewStep` o no
- Estrategia clara (Opción A o B)
- Sin código, solo análisis

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] Ejecutaste `npx prisma studio` y verificaste visualmente
- [ ] Confirmaste qué campos existen vs cuáles faltan
- [ ] Elegiste una estrategia (A o B)
- [ ] **Documentaste la estrategia elegida** (la necesitarás en Prompt 3)

### **🛑 PUNTO DE CONTROL #1**:
**ANTES de continuar al Prompt 2, confirma:**
- ✅ ¿Entiendes el schema real de tu base de datos?
- ✅ ¿Identificaste si existe o no el campo clave (ej: currentInterviewStep)?
- ✅ ¿Elegiste Opción A o B?
- ✅ ¿Documentaste tu decisión?

**Si TODO está claro → Continúa al Prompt 2**  
**Si algo NO está claro → Repite el Prompt 1 con más detalles**

---

## 📁 PROMPT 2: Comprender la Arquitectura del Backend

### **Por qué este prompt**:
Necesitas seguir las convenciones del proyecto existente (routers, controllers, services) para mantener consistencia.

### **Prompt**:

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

### **Resultado esperado**:
- Estructura de carpetas (routes/, controllers/, services/)
- Flujo típico documentado
- Ejemplo de endpoint existente

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] Identificaste dónde crear los nuevos archivos
- [ ] Entendiste el patrón de separación de capas
- [ ] Viste un ejemplo real del proyecto
- [ ] **Documentaste la estructura** (routes/ controllers/ services/)

### **🛑 PUNTO DE CONTROL #2**:
**ANTES de continuar al Prompt 3, confirma:**
- ✅ ¿Sabes en qué carpetas crear los archivos?
- ✅ ¿Entiendes el flujo router → controller → service?
- ✅ ¿Viste cómo se hace en el código existente?

**Si TODO está claro → Continúa al Prompt 3**  
**Si algo NO está claro → Pregunta específicamente sobre la arquitectura**

---

## ✏️ PROMPT 3: Diseñar el Contrato de los Endpoints

### **Por qué este prompt**:
Antes de codificar, defines la API (request/response) basándote en el schema REAL y la estrategia elegida.

### **Prompt**:

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

Del análisis previo (Prompt 1) sabemos que:
- [INSERTAR AQUÍ los campos que EXISTEN en tu schema]
- [INSERTAR los campos que NO EXISTEN pero necesitas]
- [INSERTAR cómo obtendrás la información faltante]

**Estrategia elegida**: [INSERTAR: Opción A (adaptar) o B (migrar) del Prompt 1]

**Ejemplo**:
- ❌ MAL: "Application tiene currentInterviewStep" (específico de un proyecto)
- ✅ BIEN: "Model X tiene campo Y" / "Model X NO tiene campo Z, se calculará desde..."

## Para GET /positions/:id/candidates

1. Propón la estructura JSON de respuesta
2. ¿Cómo se calcula "fase actual"? (basado en la estrategia)
3. ¿Cómo se calcula averageScore?
   - Promedio de `Interview.score` donde `score IS NOT NULL`
   - ¿Qué retornar si no hay interviews? (null o 0)

## Para PUT /candidates/:id/stage

Según la estrategia elegida:

**Si elegiste Opción A (crear Interview)**:
- Body debe incluir: positionId, newInterviewStepId, employeeId, notes (opcional)
- Respuesta: detalles de la Interview creada
- Validaciones necesarias

**Si elegiste Opción B (agregar campo)**:
- Body debe incluir: positionId, newInterviewStepId
- Respuesta: Application actualizada
- Validaciones necesarias

## Validaciones

Para ambos endpoints, lista:
1. Validaciones de tipos (IDs positivos, etc.)
2. Validaciones de existencia (Position existe, Candidate existe, etc.)
3. Validaciones de negocio específicas

**No generes código todavía**: concéntrate en diseñar un contrato claro basado en la estructura REAL de la BD.
```

### **Resultado esperado**:
- Estructura JSON completa de request/response
- Validaciones identificadas
- Casos especiales documentados

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] JSON de respuesta define todos los campos
- [ ] Body del PUT incluye todos los campos necesarios
- [ ] Validaciones listadas (tipos, existencia, negocio)
- [ ] **Guardaste los contratos** (los necesitarás para implementar)

### **🛑 PUNTO DE CONTROL #3**:
**ANTES de continuar al Prompt 4, confirma:**
- ✅ ¿El contrato JSON está completo y claro?
- ✅ ¿Sabes qué campos incluir en request/response?
- ✅ ¿Las validaciones están identificadas?
- ✅ ¿El diseño es consistente con la estrategia del Prompt 1?

**Si TODO está claro → Continúa al Prompt 4**  
**Si falta algo → Refina el contrato antes de codificar**

---

## ⚙️ PROMPT 4: Implementar GET /positions/:id/candidates

### **Por qué este prompt**:
Ahora sí, con el análisis y diseño completos, implementas el código siguiendo la arquitectura identificada.

### **Prompt**:

```
@backend

Eres un ingeniero backend senior especializado en DDD, SOLID, DRY y refactorización.
Vamos a implementar GET /positions/:id/candidates respetando la arquitectura actual.

**IMPORTANTE: Usa SOLO el schema real y la estrategia elegida en Prompt 1**

## Requisitos funcionales

[PERSONALIZA SEGÚN TU ENDPOINT - Este es un ejemplo genérico]:

- Recibe [ID] en la ruta
- Devuelve [RECURSO] con:
  * [Campo 1]
  * [Campo 2]
  * **[Campo calculado]**: [Explica cómo se obtiene según estrategia del Prompt 1]
  * [Otros campos necesarios]

## Lógica para datos calculados o faltantes

Según la estrategia elegida en Prompt 1:

**Si elegiste Opción A (adaptar sin modificar schema)**:
1. Identifica de dónde obtener los datos faltantes
2. Define qué relaciones incluir en el query
3. Explica cómo calcular/derivar la información

**Si elegiste Opción B (ya hiciste la migración)**:
1. Accede directamente a los campos agregados
2. Query simple sin cálculos complejos

**Ejemplo de query (ADAPTA A TU CASO)**:
```typescript
const results = await prisma.[TU_MODELO].findMany({
  where: { [condición] },
  include: {
    [relación1]: { select: { [campos] } },
    [relación2]: {
      include: { [sub-relación] },
      orderBy: { [campo]: 'desc' }  // Si aplica
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

1. **Ruta** (crear positionRoutes.ts)
2. **Controlador** (crear positionController.ts)
   - Validar positionId
   - Delegar al servicio
   - Formatear respuesta
3. **Servicio** (crear positionService.ts)
   - Verificar Position existe
   - Obtener Applications con Interviews
   - Calcular fase actual y averageScore
   - Transformar a formato de respuesta
4. **Helper para averageScore**
   - Función: `calculateAverageScore(interviews)`
   - Filtrar scores no-null
   - Calcular promedio
   - Redondear a 1 decimal

Genera código completo con:
- Imports correctos
- TypeScript interfaces
- Manejo de errores
- Comentarios explicativos
- JSDoc en funciones públicas
```

### **Resultado esperado**:
- 3 archivos creados (routes, controller, service)
- Código funcional sin errores de linter
- Helper para averageScore extraído (DRY)

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] Código sin errores de linter (`npm run dev` compila)
- [ ] SRP respetado (cada capa su responsabilidad)
- [ ] Helper de averageScore reutilizable
- [ ] Manejo de casos edge (sin interviews, sin scores)
- [ ] **PROBADO con curl** y funciona

### **🛑 PUNTO DE CONTROL #4**:
**ANTES de continuar al Prompt 5, PRUEBA el endpoint:**

```bash
# 1. Asegúrate de que el servidor está corriendo
npm run dev

# 2. Prueba el endpoint GET
curl http://localhost:3010/positions/1/candidates

# 3. Verifica la respuesta
```

**Confirma:**
- ✅ ¿El servidor inició sin errores?
- ✅ ¿El endpoint responde?
- ✅ ¿La respuesta tiene la estructura correcta?
- ✅ ¿El averageScore se calcula bien?
- ✅ ¿Maneja bien cuando no hay interviews?

**Si TODO funciona → Continúa al Prompt 5**  
**Si hay errores → Corrígelos ANTES de implementar PUT**

---

## 🔄 PROMPT 5: Implementar PUT /candidates/:id/stage

### **Por qué este prompt**:
Segundo endpoint, siguiendo la misma metodología y la estrategia elegida en Prompt 1.

### **Prompt**:

```
@backend

Eres un experto en backend y diseño de casos de uso, con experiencia en DDD y patrones de actualización de estado.

**Estrategia elegida del Prompt 1**: [INSERTAR: Opción A (adaptar) o B (ya migrado)]

## Requisitos funcionales

[PERSONALIZA SEGÚN TU ENDPOINT - Este es un ejemplo genérico]:

- Recibe [ID] en la ruta
- El body incluye:
  * [Campo requerido 1]
  * [Campo requerido 2]
  * [Campos opcionales]

Según la estrategia elegida:

**Si elegiste Opción A (adaptar sin campo directo)**:
- Debe crear un registro en [TABLA_RELACIONADA] para representar el cambio
- Incluye campos de auditoría (quién, cuándo)
- Validaciones de relaciones entre modelos

**Si elegiste Opción B (campo directo existe)**:
- Debe actualizar el campo directamente
- Validaciones más simples

## Lógica de validación específica

[ADAPTA ESTE EJEMPLO A TU DOMINIO]:

```typescript
// Ejemplo: Verificar que un elemento pertenece a la jerarquía correcta
const elemento = await prisma.[MODELO].findFirst({
  where: {
    id: [id_elemento],
    [campo_relacion]: [valor_esperado]
  }
});

if (!elemento) {
  throw new Error(`[Elemento] no pertenece a [Jerarquía]`);
}
```

## Requisitos de diseño

- Seguir patrón router → controller → service
- Controller: validar entrada HTTP
- Service: lógica de negocio y validaciones de dominio

## Implementación

Genera código para:

1. **Ruta** (añadir a candidateRoutes.ts: PUT /:id/stage)
2. **Controlador** (añadir a candidateController.ts: updateCandidateStage)
   - Validar candidateId (ruta)
   - Validar body (positionId, newInterviewStepId, employeeId)
   - Delegar al servicio
3. **Servicio** (añadir a candidateService.ts)
   - Validar todas las entidades existen
   - Validar InterviewStep pertenece al InterviewFlow
   - Crear Interview
   - Retornar respuesta detallada

Genera código completo con validaciones exhaustivas.
```

### **Resultado esperado**:
- Ruta PUT agregada
- Controller con validaciones de body
- Service con creación de Interview
- Todas las validaciones implementadas

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] Body valida todos los campos requeridos
- [ ] Valida que InterviewStep pertenece al flow
- [ ] Crea Interview (no update de campo inexistente)
- [ ] Retorna información del cambio
- [ ] **PROBADO con curl** y funciona

### **🛑 PUNTO DE CONTROL #5**:
**ANTES de continuar al Prompt 6, PRUEBA el endpoint PUT:**

```bash
# 1. Verifica en Prisma Studio qué IDs existen
npx prisma studio

# 2. Prueba el endpoint PUT
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1,
    "newInterviewStepId": 2,
    "employeeId": 1,
    "notes": "Test"
  }'

# 3. Verifica que el cambio se aplicó
curl http://localhost:3010/positions/1/candidates
```

**Confirma:**
- ✅ ¿El PUT responde correctamente?
- ✅ ¿Se creó la Interview (o actualizó el campo)?
- ✅ ¿Las validaciones funcionan (prueba con IDs inválidos)?
- ✅ ¿El GET muestra el cambio?

**Si TODO funciona → Continúa al Prompt 6**  
**Si hay errores → Corrígelos ANTES de refactorizar**

---

## 🧹 PROMPT 6: Revisión de Buenas Prácticas

### **Por qué este prompt**:
Revisión final para asegurar calidad del código (SOLID, DRY, DDD).

### **Prompt**:

```
@backend

Eres un revisor técnico senior especializado en DDD, SOLID, DRY y patrones de refactorización.
Tu tarea es revisar el código de los endpoints GET /positions/:id/candidates y PUT /candidates/:id/stage.

Por favor, usando los archivos modificados de @backend:

1. Indica si hay violaciones evidentes de:
   - SRP (Single Responsibility Principle)
   - DRY (código duplicado)
   - Modelado correcto de dominio (DDD)

2. Propón un máximo de 5 mejoras pequeñas que:
   - No cambien la firma pública de los endpoints
   - Mejoren legibilidad, cohesión y mantenibilidad
   - Utilicen patrones como Extract Method cuando tenga sentido

3. Para cada mejora, proporciona:
   - Descripción breve
   - Fragmento de código antes/después

**ESPECÍFICAMENTE VERIFICA**:
- ¿Hay validaciones de IDs duplicadas que puedan extraerse?
- ¿El cálculo de averageScore está bien extraído?
- ¿Los controladores son finos o tienen lógica de negocio?
- ¿Los servicios tienen responsabilidad única?

No alteres el comportamiento funcional, solo la calidad interna.
```

### **Resultado esperado**:
- Máximo 5 mejoras identificadas
- Código refactorizado si es necesario
- Mejor calidad manteniendo funcionalidad

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] Creado helper `validatePositiveIntegerId` si había duplicación
- [ ] Controllers solo manejan HTTP, sin lógica de negocio
- [ ] Services con responsabilidad única
- [ ] Código sin errores de linter
- [ ] **RE-PROBADO** que todo sigue funcionando

### **🛑 PUNTO DE CONTROL #6**:
**DESPUÉS del refactor, RE-PRUEBA todo:**

```bash
# 1. Verifica que no rompiste nada
npm run dev

# 2. Re-prueba ambos endpoints
curl http://localhost:3010/positions/1/candidates
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1, "newInterviewStepId": 2, "employeeId": 1}'
```

**Confirma:**
- ✅ ¿El refactor no rompió funcionalidad?
- ✅ ¿El código es más limpio?
- ✅ ¿Se eliminó duplicación?
- ✅ ¿Sigue sin errores de linter?

**Si TODO funciona → Continúa al Prompt 7**  
**Si algo se rompió → Revierte y refactoriza más cuidadosamente**

---

## 📝 PROMPT 7: Actualizar Especificación OpenAPI

### **Por qué este prompt**:
Documentar la API en formato estándar.

### **Prompt**:

```
@backend

Genera la especificación OpenAPI 3.0 para los dos endpoints implementados:
- GET /positions/:id/candidates
- PUT /candidates/:id/stage

Usa el formato del archivo `backend/api-spec.yaml` existente.

Para cada endpoint incluye:
1. Descripción clara
2. Parámetros (path, query, body)
3. Schemas de request/response
4. Códigos de respuesta (200, 400, 404, 500)
5. Ejemplos

Genera el YAML completo listo para copiar al archivo api-spec.yaml.
```

### **Resultado esperado**:
- YAML completo de especificación OpenAPI
- Listo para agregar a api-spec.yaml

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] YAML válido (sin errores de sintaxis)
- [ ] Todos los campos documentados
- [ ] Códigos de error incluidos
- [ ] **Agregado al archivo** api-spec.yaml

### **🛑 PUNTO DE CONTROL #7**:
**DESPUÉS de actualizar api-spec.yaml, verifica:**

```bash
# Valida que el YAML es correcto
npx @apidevtools/swagger-cli validate backend/api-spec.yaml
```

**Confirma:**
- ✅ ¿El YAML es válido?
- ✅ ¿Está agregado a api-spec.yaml?
- ✅ ¿Todos los endpoints están documentados?

**Si TODO está bien → Continúa al Prompt 8**  
**Si hay errores de sintaxis → Corrígelos antes de continuar**

---

## 🧪 PROMPT 8: Generar Documentación y Tests

### **Por qué este prompt**:
Documentar el proceso y crear guía de testing.

### **Prompt**:

```
@backend

Genera dos archivos de documentación:

## 1. TESTING.md

Incluye:
- Pasos para iniciar el sistema (BD, servidor)
- Comandos curl para probar ambos endpoints
- Casos de prueba (happy path y errores)
- Cómo verificar datos en Prisma Studio
- Troubleshooting común

## 2. IMPLEMENTACION-FINAL.md

Incluye:
- Resumen de lo implementado
- Archivos creados/modificados
- Decisiones arquitectónicas tomadas
- Validaciones implementadas
- Principios SOLID aplicados
- Cómo usar los endpoints
- Estado final del proyecto

Genera markdown completo y bien estructurado para ambos documentos.
```

### **Resultado esperado**:
- Documentación completa de testing
- Documentación de implementación final
- Guías reutilizables

---

## ✅ CHECKLIST DE VALIDACIÓN FINAL

### **🛑 PUNTO DE CONTROL FINAL**

Antes de considerar el proyecto terminado, **REVISA ESTE CHECKLIST COMPLETO**:

### **Código**:
- [ ] Sin errores de linter
- [ ] Todos los imports correctos
- [ ] TypeScript types definidos
- [ ] Manejo de errores completo

### **Funcionalidad**:
- [ ] GET retorna candidatos correctamente
- [ ] GET calcula averageScore bien
- [ ] GET maneja casos sin interviews
- [ ] PUT crea Interview (o actualiza campo según estrategia)
- [ ] PUT valida InterviewStep pertenece al flow
- [ ] PUT valida Employee existe y está activo

### **Principios**:
- [ ] SRP: Cada clase/función una responsabilidad
- [ ] DRY: Sin código duplicado
- [ ] DDD: Dominio bien modelado
- [ ] Validaciones en la capa correcta

### **Documentación**:
- [ ] api-spec.yaml actualizado
- [ ] TESTING.md creado
- [ ] IMPLEMENTACION-FINAL.md creado
- [ ] README actualizado

### **Testing**:
- [ ] GET con position válida funciona
- [ ] GET con position inválida da 404
- [ ] GET con ID no numérico da 400
- [ ] PUT con datos válidos funciona
- [ ] PUT sin employeeId da 400
- [ ] PUT con InterviewStep de otro flow da 400

---

## 📊 Resumen del Flujo CON PUNTOS DE CONTROL

```
1. VERIFICAR SCHEMA REAL
   ↓ (prisma studio, db pull)
   🛑 PUNTO DE CONTROL #1: ¿Schema claro? → APROBAR ✅

2. IDENTIFICAR ARQUITECTURA
   ↓ (routes, controllers, services)
   🛑 PUNTO DE CONTROL #2: ¿Arquitectura clara? → APROBAR ✅

3. DISEÑAR CONTRATOS
   ↓ (JSON request/response)
   🛑 PUNTO DE CONTROL #3: ¿Contratos completos? → APROBAR ✅

4. IMPLEMENTAR GET
   ↓ (routes → controller → service)
   🛑 PUNTO DE CONTROL #4: ¿GET funciona? → PROBAR Y APROBAR ✅

5. IMPLEMENTAR PUT
   ↓ (seguir misma arquitectura)
   🛑 PUNTO DE CONTROL #5: ¿PUT funciona? → PROBAR Y APROBAR ✅

6. REFACTORIZAR (DRY)
   ↓ (extraer duplicados)
   🛑 PUNTO DE CONTROL #6: ¿Sigue funcionando? → RE-PROBAR ✅

7. ACTUALIZAR OPENAPI
   ↓ (api-spec.yaml)
   🛑 PUNTO DE CONTROL #7: ¿YAML válido? → VALIDAR ✅

8. DOCUMENTAR
   ↓ (guides completos)
   🛑 PUNTO DE CONTROL #8: ¿Docs completas? → REVISAR ✅

9. CHECKLIST FINAL
   ↓ (ver abajo)
   🛑 PUNTO DE CONTROL FINAL: ¿Todo OK? → APROBAR ✅

10. ✅ LISTO PARA PRODUCCIÓN
```

⚠️ **CRÍTICO**: En CADA 🛑 debes DETENERTE, REVISAR y APROBAR antes de avanzar.

---

## 🎯 Diferencia Clave de Esta Guía

### **❌ Approach Incorrecto**:
```
1. Asumir estructura de BD
2. Diseñar basándose en asunciones
3. Implementar
4. Probar
5. ❌ Error: campo no existe
6. Corregir todo
```

### **✅ Approach Correcto (esta guía)**:
```
1. VERIFICAR estructura real de BD
2. LISTAR todos los campos que existen
3. ELEGIR estrategia basada en realidad
4. Diseñar con schema real
5. Implementar correctamente
6. Probar
7. ✅ Funciona desde el primer intento
```

---

## 💡 Principios Clave

1. **"NO ASUMAS NADA"** - Siempre verifica contra la fuente de verdad (BD)
2. **"Lista TODOS los campos"** - No resumir, ser exhaustivo
3. **"Si NO existe, dilo explícitamente"** - No inventar soluciones sin validar
4. **"Elige estrategia ANTES de codificar"** - Diseño primero, código después
5. **"Valida en cada paso"** - No esperar al final para probar

---

## 🚀 Para Usar en Tu Proyecto

### **Proceso Paso a Paso**:

1. **Copia estos prompts** a tu proyecto
2. **Reemplaza** los contextos específicos:
   - "ATS" → Tu dominio
   - "positions/candidates" → Tus entidades
   - "Interview/InterviewStep" → Tus modelos
3. **Ejecuta UN prompt a la vez** (NO todos seguidos)
4. **DETENTE en cada 🛑 PUNTO DE CONTROL**
5. **Revisa, valida, prueba**
6. **Aprueba explícitamente**: "Sí, continúa al siguiente prompt"
7. **NO avances** si algo no funciona
8. **Documenta** decisiones conforme avanzas

### **⚠️ ERRORES COMUNES A EVITAR**:

❌ **ERROR 1**: Ejecutar todos los prompts seguidos sin revisar
✅ **CORRECTO**: Un prompt → Revisar → Aprobar → Siguiente

❌ **ERROR 2**: No probar el código hasta el final
✅ **CORRECTO**: Probar en Punto de Control #4 y #5

❌ **ERROR 3**: Ignorar errores de linter "para arreglar después"
✅ **CORRECTO**: Sin errores antes de continuar

❌ **ERROR 4**: Asumir que el código funciona sin probarlo
✅ **CORRECTO**: curl/postman en CADA endpoint

❌ **ERROR 5**: Avanzar aunque algo no esté claro
✅ **CORRECTO**: Preguntar/clarificar antes de continuar

---

## 📚 Recursos Complementarios

- **Prisma**: https://www.prisma.io/docs
- **DDD**: Domain-Driven Design by Eric Evans
- **SOLID**: Clean Code by Robert C. Martin
- **OpenAPI**: https://swagger.io/specification/

---

## ✨ Resultado Esperado

Al seguir estos prompts en orden:
- ✅ Código funcionando desde el primer intento
- ✅ Arquitectura limpia (SOLID + DRY + DDD)
- ✅ Sin deuda técnica
- ✅ Documentación completa
- ✅ API bien diseñada
- ✅ Tests validados

---

**Versión**: 1.0  
**Última actualización**: Noviembre 2025  
**Tested en**: Node.js 20, TypeScript 4.9, Prisma 5, PostgreSQL 15

