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

## 🎯 Contexto del Proyecto (PERSONALIZAR ANTES DE USAR)

Antes de ejecutar los prompts, define tu contexto:

**Sistema**: [TU SISTEMA - ej: ATS, E-commerce, Blog, CRM, Inventario, etc.]  

**Endpoints a implementar**:
- `[MÉTODO] /[recurso]/:id/[sub-recurso]` - [Descripción]
- `[MÉTODO] /[recurso]/:id/[acción]` - [Descripción]

**Modelos clave del dominio** (los que usarás):
- [Modelo1] - [Descripción breve]
- [Modelo2] - [Descripción breve]
- [Modelo3] - [Descripción breve]

**Stack**: Node.js, TypeScript, Express, Prisma, PostgreSQL

⚠️ **NOTA IMPORTANTE**: Los prompts a continuación usan **PLACEHOLDERS GENÉRICOS** como `[MODELO]`, `[CAMPO]`, `[RELACIÓN]`. Debes **reemplazarlos con los nombres reales** de tu proyecto cuando ejecutes cada prompt.

---

# 📝 PROMPTS EN ORDEN

---

## 🧩 PROMPT 1: Comprender el Dominio

### **Por qué este prompt primero**:
Antes de escribir código, DEBES entender el modelo de datos REAL. Este prompt fuerza verificación explícita y prohíbe asunciones.

### **⚠️ ANTES DE USAR ESTE PROMPT**:
Reemplaza los placeholders con tus modelos reales:
- `[MODELO_PRINCIPAL]` → Tu entidad principal (ej: Position, Product, Order)
- `[MODELO_SECUNDARIO]` → Entidad relacionada (ej: Candidate, Review, OrderItem)
- `[MODELO_RELACION]` → Entidad de relación (ej: Application, Purchase, Assignment)
- `[MODELO_ADICIONAL]` → Otras entidades relevantes

### **Prompt (PERSONALIZAR antes de ejecutar)**:

```
@backend

Eres un experto arquitecto de backend especializado en [TU DOMINIO - ej: E-commerce, ATS, CRM] y en Diseño Guiado por el Dominio (DDD). 
Conoces en profundidad principios SOLID, DRY y patrones de diseño.

**IMPORTANTE: NO ASUMAS NADA. Verifica la estructura REAL de la base de datos antes de analizar.**

## PASO 1: Verificar estructura actual de la base de datos

1. Lee el archivo `backend/prisma/schema.prisma` COMPLETO
2. Ejecuta `cd backend && npx prisma db pull` para obtener el schema actualizado desde la BD
3. Ejecuta `npx prisma studio` y verifica manualmente la estructura de las tablas
4. Confirma qué campos y relaciones REALMENTE existen

## PASO 2: Analizar modelos del dominio

Para los siguientes modelos **DE MI PROYECTO**, lista TODOS los campos que EXISTEN (no inventes):

### [MODELO_1 - reemplazar con tu modelo]
- Lista TODOS los campos del schema
- Lista TODAS las relaciones
- Tipos de dato de cada campo

### [MODELO_2 - reemplazar con tu modelo]
- Lista TODOS los campos del schema
- Lista TODAS las relaciones
- **CRÍTICO**: ¿Tiene un campo que representa [ESTADO/FASE CLAVE]? (ej: currentStatus, stage, state, etc.)
- Si NO existe, dilo explícitamente: "NO existe campo de [estado]"

### [MODELO_3 - reemplazar con tu modelo]
- Lista TODOS los campos del schema
- Lista TODAS las relaciones
- ¿Cómo se relaciona con [MODELO_1] y [MODELO_2]?

### [MODELO_4 - si aplica]
- Lista TODOS los campos del schema
- ¿Tiene campos calculados o métricas? (ej: score, rating, total, quantity)
- Indica el tipo exacto (Int?, String?, Float?, etc.)
- ¿Son nullable?

## PASO 3: Identificar la estructura real vs. necesaria

Para implementar los endpoints que necesitas:
- [MÉTODO] /[recurso]/:id/[sub-recurso] - [Lo que debe retornar]
- [MÉTODO] /[recurso]/:id/[acción] - [Lo que debe hacer]

Responde para CADA endpoint:

1. **¿Existen en el schema los campos que necesito para este endpoint?**
   - Si SÍ: Lista qué modelos y campos usar
   - Si NO: ¿Cómo se puede obtener/calcular esa información?

2. **¿Cómo se obtiene [DATO_CLAVE] que necesito retornar/actualizar?**
   - Con campo directo en [MODELO]
   - Calculando desde relaciones (ej: última transacción, promedio de ratings)
   - Otro método

3. **¿Dónde están los datos numéricos/calculados que necesito?**
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
Evalúa qué opción es mejor para tu caso de uso específico considerando:
- Complejidad de implementación
- Performance esperada (volumen de datos)
- Mantenibilidad a largo plazo
- Integridad de datos y riesgo de inconsistencias
- Tiempo disponible (migración vs lógica compleja)

## FORMATO DE RESPUESTA

Responde con:
- **Estructura REAL** (copiada del schema, NO interpretada ni resumida)
- **Campos que EXISTEN** (lista exacta con tipos, constraints, relaciones)
- **Campos que FALTAN** (para los endpoints requeridos)
- **Cómo obtener datos faltantes** (desde qué relaciones/tablas)
- **Estrategia recomendada** (A o B, con justificación clara)
- **NO generes código todavía**, solo análisis y decisión
```

### **Resultado esperado**:
- Lista exhaustiva de campos del schema (sin omitir nada)
- Identificación clara de campos existentes vs faltantes
- Estrategia elegida (Opción A o B) con justificación
- Sin código de implementación, solo análisis

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

### **⚠️ ANTES DE USAR ESTE PROMPT**:
Documenta las decisiones del Prompt 1:
- ¿Qué estrategia elegiste? (A o B)
- ¿Qué campos existen vs cuáles faltan?
- ¿Cómo obtendrás los datos que necesitas?

### **Prompt (PERSONALIZAR con tu contexto)**:

```
@backend

Eres un experto en diseño de APIs REST con enfoque en DDD, claridad de contratos y buenas prácticas de producto.

**IMPORTANTE: Usa SOLO los campos y relaciones que EXISTEN en el schema real.**

Debo crear estos endpoints:

1) [MÉTODO] /[recurso]/:id/[sub-recurso]
   - Debe devolver [DESCRIPCIÓN]:
     * [Campo 1]
     * [Campo 2 - especificar si es calculado]
     * [Campo 3 - especificar origen]
     * [Otros campos necesarios]

2) [MÉTODO] /[recurso]/:id/[acción]
   - Debe [ACCIÓN - ej: actualizar, crear, eliminar] [DESCRIPCIÓN]

**RESTRICCIONES CRÍTICAS (basadas en el schema REAL del Prompt 1)**:

Del análisis previo sabemos que:
- ✅ [MODELO_X] tiene campos: [lista de campos que SÍ existen]
- ❌ [MODELO_Y] NO tiene campo [Z] → se obtendrá desde [origen alternativo]
- 🔄 [DATO_CALCULADO] se calculará desde [explicar cómo]

**Estrategia elegida**: [Opción A (adaptar sin migrar) o Opción B (ya migrado)]

## Para [MÉTODO 1] /[endpoint 1]

1. Propón la estructura JSON de respuesta completa
2. Para cada campo que NO existe directamente en el schema:
   - ¿Cómo se calcula u obtiene?
   - ¿Desde qué modelo/relación?
   - ¿Qué retornar si no hay datos? (null, 0, array vacío)
3. Especifica tipos de dato (number, string, boolean, Date, etc.)

**Ejemplo de respuesta esperada**:
```json
{
  "[campo1]": tipo,
  "[campo2]": tipo,
  "[campoCalculado]": tipo  // Calculado desde [explicar]
}
```

## Para [MÉTODO 2] /[endpoint 2]

Según la estrategia elegida en Prompt 1:

**Si elegiste Opción A (adaptar sin campo directo)**:
- Body debe incluir: [lista de campos necesarios]
- La acción resultante será: [crear registro auxiliar / actualizar mediante relación / etc.]
- Respuesta: [qué se retorna]
- Validaciones de integridad: [qué validar]

**Si elegiste Opción B (campo directo ya existe)**:
- Body debe incluir: [campos necesarios]
- La acción resultante será: [update directo de campo]
- Respuesta: [entidad actualizada]
- Validaciones: [más simples que Opción A]

## Validaciones

Para cada endpoint, lista:
1. **Validaciones de tipos**: IDs numéricos positivos, strings no vacíos, etc.
2. **Validaciones de existencia**: ¿Qué entidades deben existir antes de proceder?
3. **Validaciones de negocio**: Reglas específicas de tu dominio

**No generes código todavía**: concéntrate en diseñar un contrato claro, completo y basado en la estructura REAL de la BD.

### **Resultado esperado**:
- Estructura JSON completa de request/response
- Validaciones identificadas
- Casos especiales documentados

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] JSON de respuesta define todos los campos
- [ ] Body incluye todos los campos necesarios
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

## ⚙️ PROMPT 4: Implementar Primer Endpoint (GET)

### **Por qué este prompt**:
Ahora sí, con el análisis y diseño completos, implementas el código siguiendo la arquitectura identificada.

### **⚠️ PERSONALIZA ANTES DE EJECUTAR**:
- Reemplaza `[MODELO]`, `[CAMPO]`, `[RELACION]` con nombres reales
- Adapta la lógica de cálculo a tu dominio específico
- Usa los nombres de archivos según tu estructura

### **Prompt (PERSONALIZAR con tu endpoint específico)**:

```
@backend

Eres un ingeniero backend senior especializado en DDD, SOLID, DRY y refactorización.
Vamos a implementar [MÉTODO] /[recurso]/:id/[sub-recurso] respetando la arquitectura actual.

**IMPORTANTE: Usa SOLO el schema real y la estrategia elegida en Prompt 1**

## Requisitos funcionales

- Recibe [PARAM_ID] en la ruta
- Devuelve lista/objeto de [RECURSO] con:
  * [Campo 1 - directo del schema]
  * [Campo 2 - directo del schema]
  * **[Campo calculado]**: [Explica cómo se obtiene según estrategia del Prompt 1]
  * [Campo N]

## Lógica para datos calculados o faltantes

Según la estrategia elegida en Prompt 1:

**Si elegiste Opción A (adaptar sin modificar schema)**:
1. Obtener datos desde [MODELO_PRINCIPAL]
2. Incluir relaciones: [RELACION_1], [RELACION_2]
3. Calcular [DATO_FALTANTE] desde [ORIGEN - ej: última transacción, promedio, sum, etc.]
4. Ordenar por [CAMPO] [ASC/DESC] si es necesario

**Si elegiste Opción B (ya hiciste la migración)**:
1. Accede directamente al campo [NUEVO_CAMPO] agregado en [MODELO]
2. Query simple sin cálculos complejos

**Ejemplo de query Prisma (ADAPTA A TU CASO)**:
```typescript
const results = await prisma.[TU_MODELO].findMany({
  where: { [condición] },
  include: {
    [relación1]: { 
      select: { [campos_necesarios] } 
    },
    [relación2]: {
      include: { [sub-relación] },
      orderBy: { [campo_fecha]: 'desc' }  // Si necesitas ordenar
    }
  }
});
```

## Requisitos de diseño

- Seguir el flujo: router → controller → service → Prisma
- Evitar duplicar lógica (DRY)
- Controller fino (solo validación HTTP), lógica en service (SRP)
- Si hay cálculos complejos: extraer en función helper

## Implementación

Por favor, genera el código para:

1. **Ruta** (archivo: [nombreRoutes.ts] - según arquitectura del Prompt 2)
   - Definir [MÉTODO] /:id/[sub-recurso]
   - Conectar con controller

2. **Controlador** (archivo: [nombreController.ts])
   - Validar [PARAM_ID] (tipo, rango)
   - Delegar al servicio
   - Formatear respuesta HTTP (200, 404, 500)

3. **Servicio** (archivo: [nombreService.ts])
   - Verificar que [ENTIDAD_PRINCIPAL] existe
   - Obtener [DATOS] con sus relaciones
   - Calcular [CAMPOS_DERIVADOS]
   - Transformar a formato de respuesta

4. **Helper para cálculos** (SI APLICA)
   - Función: `calculate[MetricaNombre](datos)`
   - Filtrar valores null/undefined
   - Aplicar lógica de cálculo
   - Retornar tipo apropiado

5. **Registrar ruta** (en index.ts o archivo principal)
   - Importar el router
   - Registrar en la app

Genera código completo con:
- Imports correctos
- TypeScript interfaces para request/response
- Manejo de errores (try-catch, throw con códigos HTTP)
- Comentarios explicativos en lógica compleja
- JSDoc en funciones públicas del service

### **Resultado esperado**:
- Archivos creados (routes, controller, service)
- Código funcional sin errores de linter
- Helpers extraídos si hay cálculos (DRY)
- Ruta registrada en el servidor

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] Código sin errores de linter (`npm run dev` compila)
- [ ] SRP respetado (cada capa su responsabilidad)
- [ ] Helpers reutilizables si hay cálculos
- [ ] Manejo de casos edge (registros vacíos, nulls)
- [ ] **PROBADO con curl** y funciona

### **🛑 PUNTO DE CONTROL #4**:
**ANTES de continuar al Prompt 5, PRUEBA el endpoint:**

```bash
# 1. Asegúrate de que el servidor está corriendo
npm run dev

# 2. Prueba el endpoint (REEMPLAZA con tu endpoint real)
curl http://localhost:[PUERTO]/[recurso]/[id_existente]/[sub-recurso]

# 3. Verifica la respuesta
```

**Confirma:**
- ✅ ¿El servidor inició sin errores?
- ✅ ¿El endpoint responde (status 200)?
- ✅ ¿La respuesta tiene la estructura JSON correcta?
- ✅ ¿Los campos calculados se obtienen correctamente?
- ✅ ¿Maneja bien casos sin datos relacionados? (retorna null o array vacío)
- ✅ ¿Maneja ID inválido correctamente? (status 404)

**Si TODO funciona → Continúa al Prompt 5**  
**Si hay errores → Corrígelos ANTES de implementar el segundo endpoint**

---

## 🔄 PROMPT 5: Implementar Segundo Endpoint (PUT/POST/DELETE)

### **Por qué este prompt**:
Segundo endpoint, siguiendo la misma metodología y la estrategia elegida en Prompt 1.

### **⚠️ PERSONALIZA ANTES DE EJECUTAR**:
- Define si es PUT (actualizar), POST (crear) o DELETE
- Adapta el body según tu dominio
- Considera la estrategia del Prompt 1

### **Prompt (PERSONALIZAR con tu endpoint específico)**:

```
@backend

Eres un experto en backend y diseño de casos de uso, con experiencia en DDD y patrones de actualización de estado.

**Estrategia elegida del Prompt 1**: [Opción A (adaptar sin migrar) o Opción B (ya migrado)]

## Requisitos funcionales

- Recibe [PARAM_ID] en la ruta
- El body incluye:
  * [Campo requerido 1]: [tipo] - [descripción]
  * [Campo requerido 2]: [tipo] - [descripción]
  * [Campo opcional N]: [tipo] - [descripción]

## Acción según estrategia elegida

**Si elegiste Opción A (adaptar sin campo directo en el schema)**:
- Debe crear un registro en [MODELO_RELACIONADO] para representar el cambio
- Campos del nuevo registro:
  * [campo1]: valor desde body
  * [campo2]: valor calculado/generado
  * [campoAuditoria]: quién hace el cambio
  * [timestamp]: cuándo se hace el cambio
- Validaciones de integridad referencial entre modelos

**Si elegiste Opción B (campo directo existe después de migración)**:
- Debe actualizar el campo [NUEVO_CAMPO] directamente en [MODELO]
- Validaciones más simples (solo existencia de entidad)
- Posible auditoría adicional (updatedAt, updatedBy)

## Lógica de validación de integridad (ADAPTA A TU DOMINIO)

```typescript
// Ejemplo: Verificar que un elemento pertenece a la jerarquía correcta
const [elemento] = await prisma.[MODELO_HIJO].findFirst({
  where: {
    id: [id_desde_body],
    [campo_FK]: [valor_esperado_desde_contexto]
  }
});

if (![elemento]) {
  throw new BadRequestError(`[Elemento] ${[id]} no pertenece a [Jerarquía] ${[parent_id]}`);
}
```

## Requisitos de diseño

- Seguir patrón router → controller → service
- Controller: validar entrada HTTP (tipos, campos requeridos)
- Service: lógica de negocio y validaciones de dominio
- Si hay transacción compleja: usar `prisma.$transaction`

## Implementación

Genera código para:

1. **Ruta** (añadir a [recursoRoutes.ts])
   - [MÉTODO] /:id/[acción]
   - Conectar con controller

2. **Controlador** (añadir a [recursoController.ts])
   - Validar [PARAM_ID] (ruta)
   - Validar body (campos requeridos, tipos)
   - Delegar al servicio
   - Retornar respuesta (200, 400, 404, 500)

3. **Servicio** (añadir a [recursoService.ts])
   - Validar que [ENTIDAD_PRINCIPAL] existe
   - Validar que [ENTIDADES_RELACIONADAS] existen
   - Validar reglas de negocio (ej: jerarquía, estados válidos)
   - Ejecutar acción:
     * SI Opción A: crear registro en [MODELO_RELACIONADO]
     * SI Opción B: actualizar campo directamente
   - Retornar respuesta detallada con el cambio realizado

## Respuesta esperada del endpoint

```json
{
  "message": "[Descripción del éxito]",
  "data": {
    "[campo1]": valor,
    "[campo2]": valor,
    "[entidadCreada/Actualizada]": {
      // Detalle del cambio
    }
  }
}
```

Genera código completo con:
- Validaciones exhaustivas (tipos, existencia, integridad)
- Manejo de errores específicos (404 para not found, 400 para invalid)
- Comentarios en lógica compleja
- TypeScript types para body y response


### **Resultado esperado**:
- Ruta agregada al archivo de routes correspondiente
- Controller con validaciones completas de body
- Service con lógica de creación/actualización según estrategia
- Todas las validaciones de integridad implementadas
- Respuesta JSON estructurada

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] Body valida todos los campos requeridos (tipos y presencia)
- [ ] Valida integridad referencial (ej: elemento pertenece a jerarquía)
- [ ] Ejecuta la acción correcta según estrategia (crear registro o update directo)
- [ ] Retorna información detallada del cambio
- [ ] **PROBADO con curl** y funciona

### **🛑 PUNTO DE CONTROL #5**:
**ANTES de continuar al Prompt 6, PRUEBA el endpoint exhaustivamente:**

```bash
# 1. Verifica en Prisma Studio qué IDs existen
npx prisma studio

# 2. Prueba el endpoint con datos válidos (ADAPTA A TU ENDPOINT)
curl -X [MÉTODO] http://localhost:[PUERTO]/[recurso]/[id]/[acción] \
  -H "Content-Type: application/json" \
  -d '{
    "[campo1]": valor1,
    "[campo2]": valor2
  }'

# 3. Prueba validaciones (IDs inválidos, campos faltantes)
curl -X [MÉTODO] http://localhost:[PUERTO]/[recurso]/999/[acción] \
  -H "Content-Type: application/json" \
  -d '{"[campo1]": valor1}'  # Falta campo2

# 4. Verifica que el cambio se aplicó (con el primer endpoint)
curl http://localhost:[PUERTO]/[recurso]/[id]/[sub-recurso]
```

**Confirma:**
- ✅ ¿Responde correctamente con datos válidos? (status 200)
- ✅ ¿Se creó el registro o actualizó el campo según estrategia?
- ✅ ¿Las validaciones funcionan correctamente?
  - ID inválido → 404
  - Campo faltante → 400
  - Integridad violada → 400 con mensaje claro
- ✅ ¿El primer endpoint (GET) refleja el cambio?

**Si TODO funciona → Continúa al Prompt 6**  
**Si hay errores → Corrígelos ANTES de refactorizar**

---

## 🧹 PROMPT 6: Revisión de Buenas Prácticas

### **Por qué este prompt**:
Revisión final para asegurar calidad del código (SOLID, DRY, DDD) antes de documentar.

### **Prompt (GENÉRICO)**:

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

**RESTRICCIÓN**: No alteres el comportamiento funcional de los endpoints, solo mejora la calidad interna del código.
```

### **Resultado esperado**:
- Máximo 5 mejoras concretas identificadas
- Código refactorizado aplicando mejoras
- Mejor calidad interna manteniendo funcionalidad externa

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] Helpers de validación extraídos si había duplicación
- [ ] Controllers solo manejan HTTP, sin lógica de negocio
- [ ] Services con responsabilidad única (no hacen demasiado)
- [ ] Código sin errores de linter
- [ ] Magic numbers/strings reemplazados por constantes si corresponde
- [ ] **RE-PROBADO** que todo sigue funcionando

### **🛑 PUNTO DE CONTROL #6**:
**DESPUÉS del refactor, RE-PRUEBA EXHAUSTIVAMENTE:**

```bash
# 1. Verifica que el código compila sin errores
npm run dev

# 2. Re-prueba TODOS los casos del endpoint 1
curl http://localhost:[PUERTO]/[endpoint1]  # Happy path
curl http://localhost:[PUERTO]/[endpoint1-invalido]  # Error case

# 3. Re-prueba TODOS los casos del endpoint 2
curl -X [MÉTODO] http://localhost:[PUERTO]/[endpoint2] \
  -H "Content-Type: application/json" \
  -d '{...}'  # Happy path
  
curl -X [MÉTODO] http://localhost:[PUERTO]/[endpoint2-invalido] \
  -H "Content-Type: application/json" \
  -d '{...}'  # Error case
```

**Confirma:**
- ✅ ¿El refactor NO rompió funcionalidad? (todos los tests pasan)
- ✅ ¿El código es más limpio y legible?
- ✅ ¿Se eliminó duplicación (DRY)?
- ✅ ¿Sigue sin errores de linter/compilación?
- ✅ ¿Los helpers son reutilizables?

**Si TODO funciona → Continúa al Prompt 7**  
**Si algo se rompió → Revierte los cambios y refactoriza más cuidadosamente**

---

## 📝 PROMPT 7: Actualizar Especificación OpenAPI

### **Por qué este prompt**:
Documentar la API en formato estándar (OpenAPI/Swagger) para que otros desarrolladores y herramientas la puedan consumir.

### **Prompt (PERSONALIZAR con tus endpoints)**:

```
@backend

Genera la especificación OpenAPI 3.0 para los endpoints implementados:
- [MÉTODO] /[recurso]/:id/[sub-recurso]
- [MÉTODO] /[recurso]/:id/[acción]

Si existe un archivo `backend/api-spec.yaml`, usa su formato y estructura.
Si NO existe, créalo siguiendo el estándar OpenAPI 3.0.

Para CADA endpoint incluye:

1. **Descripción clara** del propósito
2. **Parámetros**:
   - Path parameters (ej: id)
   - Query parameters (si aplica)
   - Request body (para POST/PUT)
3. **Schemas** de request y response (con tipos TypeScript → OpenAPI):
   - string, integer, number, boolean, array, object
   - Indicar campos required
4. **Códigos de respuesta** con ejemplos:
   - 200: Éxito (con ejemplo de response)
   - 400: Bad Request (campos faltantes, tipos inválidos)
   - 404: Not Found (entidad no existe)
   - 500: Internal Server Error
5. **Ejemplos reales** para request y response

Genera el YAML completo listo para copiar/agregar al archivo api-spec.yaml.
```

### **Resultado esperado**:
- YAML completo de especificación OpenAPI 3.0
- Schemas de request/response definidos
- Listo para agregar a `api-spec.yaml`

### **Validación** (OBLIGATORIA antes de continuar):
- [ ] YAML válido (sin errores de sintaxis)
- [ ] Todos los campos request/response documentados
- [ ] Códigos de respuesta incluidos (200, 400, 404, 500)
- [ ] Ejemplos incluidos para cada endpoint
- [ ] **Agregado al archivo** `api-spec.yaml`

### **🛑 PUNTO DE CONTROL #7**:
**DESPUÉS de actualizar api-spec.yaml, VALIDA:**

```bash
# Instala la herramienta de validación si no la tienes
npm install -g @apidevtools/swagger-cli

# Valida que el YAML es correcto según OpenAPI 3.0
npx @apidevtools/swagger-cli validate backend/api-spec.yaml

# Opcional: visualiza la documentación
npx swagger-ui-express backend/api-spec.yaml
```

**Confirma:**
- ✅ ¿El YAML es válido (sin errores de sintaxis)?
- ✅ ¿Está agregado/actualizado en `api-spec.yaml`?
- ✅ ¿Todos los endpoints nuevos están documentados?
- ✅ ¿Los schemas son correctos (tipos, required)?

**Si TODO está bien → Continúa al Prompt 8**  
**Si hay errores de sintaxis → Corrígelos antes de continuar**

---

## 🧪 PROMPT 8: Generar Documentación y Guía de Testing

### **Por qué este prompt**:
Documentar el proceso completo y crear una guía para que otros (o tú en el futuro) puedan entender, probar y mantener los endpoints.

### **Prompt (GENÉRICO)**:

```
@backend

Genera dos archivos de documentación profesional en Markdown:

## 1. docs/TESTING.md

Incluye las siguientes secciones:

### **Requisitos Previos**
- Software necesario (Node, PostgreSQL, etc.)
- Variables de entorno
- Cómo clonar/configurar el proyecto

### **Iniciar el Sistema**
- Pasos para iniciar BD (docker-compose, pg_ctl, etc.)
- Pasos para iniciar el servidor (`npm run dev`)
- Cómo verificar que está corriendo

### **Testing de Endpoints**

Para CADA endpoint:
- Comando `curl` completo para happy path
- Comando `curl` para casos de error (404, 400)
- Respuesta esperada (ejemplo JSON)
- Cómo interpretar los resultados

### **Verificación de Datos**
- Cómo usar Prisma Studio para ver datos
- Qué tablas/campos revisar
- Cómo verificar que los cambios se aplicaron

### **Troubleshooting**
- Errores comunes y soluciones
- Logs útiles
- Cómo reiniciar el sistema

---

## 2. docs/IMPLEMENTACION-FINAL.md

Incluye las siguientes secciones:

### **Resumen Ejecutivo**
- Qué se implementó
- Endpoints agregados
- Fecha y contexto

### **Archivos Creados/Modificados**
- Lista con path completo
- Descripción breve del rol de cada archivo

### **Decisiones Arquitectónicas**
- ¿Por qué se eligió Opción A o B del Prompt 1?
- ¿Qué patrones se aplicaron?
- ¿Qué trade-offs se consideraron?

### **Modelo de Dominio**
- Diagrama o descripción de relaciones entre modelos
- Campos clave utilizados

### **Validaciones Implementadas**
- Validaciones de tipos (HTTP layer)
- Validaciones de negocio (Service layer)
- Mensajes de error

### **Principios SOLID Aplicados**
- SRP: cómo se separaron responsabilidades
- DRY: qué helpers/funciones se extrajeron
- Otros principios aplicados

### **Cómo Usar los Endpoints**
- Ejemplos de uso con curl/Postman
- Campos requeridos vs opcionales
- Casos de uso comunes

### **Próximos Pasos** (opcional)
- Mejoras futuras
- Tests automatizados pendientes
- Documentación adicional

---

Genera markdown completo, profesional y bien estructurado para ambos documentos.
```

### **Resultado esperado**:
- `docs/TESTING.md` completo con comandos curl y troubleshooting
- `docs/IMPLEMENTACION-FINAL.md` con resumen técnico y decisiones
- Documentación lista para commit

### **Validación** (OBLIGATORIA antes de finalizar):
- [ ] TESTING.md incluye todos los comandos curl funcionales
- [ ] IMPLEMENTACION-FINAL.md documenta decisiones y estrategia
- [ ] Ambos archivos usan markdown correcto
- [ ] Archivos guardados en `docs/`

---

## ✅ CHECKLIST DE VALIDACIÓN FINAL

### **🛑 PUNTO DE CONTROL FINAL**

Antes de considerar el proyecto terminado, **REVISA ESTE CHECKLIST COMPLETO**:

### **Código**:
- [ ] Sin errores de linter/compilación
- [ ] Todos los imports correctos
- [ ] TypeScript types/interfaces definidos para request/response
- [ ] Manejo de errores completo (try-catch, throw con mensajes claros)
- [ ] Nombres de variables/funciones descriptivos

### **Funcionalidad Endpoint 1 (GET/LIST)**:
- [ ] Retorna datos correctamente con campos esperados
- [ ] Calcula/obtiene campos derivados correctamente
- [ ] Maneja casos sin datos relacionados (retorna null o array vacío)
- [ ] Valida ID inválido → 404
- [ ] Valida ID malformado → 400

### **Funcionalidad Endpoint 2 (POST/PUT/DELETE)**:
- [ ] Ejecuta la acción correcta según estrategia (crear registro o update campo)
- [ ] Valida todos los campos requeridos → 400 si faltan
- [ ] Valida integridad referencial (ej: elemento pertenece a jerarquía) → 400
- [ ] Valida entidades relacionadas existen → 404 si no existen
- [ ] Retorna respuesta detallada del cambio

### **Principios SOLID/DRY/DDD**:
- [ ] SRP: Cada clase/función tiene una responsabilidad única
- [ ] DRY: Sin código duplicado (helpers extraídos)
- [ ] DDD: Lógica de negocio en service layer, NO en controllers
- [ ] Validaciones HTTP en controllers, validaciones de dominio en services
- [ ] Controllers finos (solo manejo de HTTP)

### **Documentación**:
- [ ] `api-spec.yaml` actualizado con OpenAPI 3.0
- [ ] `docs/TESTING.md` creado con comandos curl
- [ ] `docs/IMPLEMENTACION-FINAL.md` creado con decisiones y arquitectura
- [ ] README actualizado (si corresponde)

### **Testing Manual**:
- [ ] Endpoint 1 con ID válido → 200 con datos correctos
- [ ] Endpoint 1 con ID inválido → 404
- [ ] Endpoint 1 con ID malformado → 400
- [ ] Endpoint 2 con datos válidos → 200/201 con cambio aplicado
- [ ] Endpoint 2 con campo faltante → 400
- [ ] Endpoint 2 con ID inválido → 404
- [ ] Endpoint 2 con violación de integridad → 400 con mensaje claro
- [ ] Endpoint 1 refleja cambios del Endpoint 2 (si aplica)

---

## 📊 Resumen del Flujo CON PUNTOS DE CONTROL

```
1. VERIFICAR SCHEMA REAL (Prompt 1)
   ↓ Herramientas: prisma studio, db pull, leer schema.prisma COMPLETO
   🛑 PUNTO DE CONTROL #1: ¿Schema claro? ¿Campos existentes vs faltantes identificados? → APROBAR ✅
   ↓ Decisión: ¿Opción A (adaptar) o B (migrar)?

2. IDENTIFICAR ARQUITECTURA (Prompt 2)
   ↓ Analizar: routes/, controllers/, services/, flujo existente
   🛑 PUNTO DE CONTROL #2: ¿Arquitectura clara? ¿Sabes dónde crear archivos? → APROBAR ✅
   
3. DISEÑAR CONTRATOS (Prompt 3)
   ↓ Definir: JSON request/response, validaciones, casos edge
   🛑 PUNTO DE CONTROL #3: ¿Contratos completos? ¿Campos claros? → APROBAR ✅

4. IMPLEMENTAR ENDPOINT 1 (Prompt 4)
   ↓ Crear: routes → controller → service → helpers
   🛑 PUNTO DE CONTROL #4: ¿Endpoint funciona? → PROBAR CON CURL ✅
   ↓ Validar: Happy path, 404, 400

5. IMPLEMENTAR ENDPOINT 2 (Prompt 5)
   ↓ Seguir: misma arquitectura, validaciones exhaustivas
   🛑 PUNTO DE CONTROL #5: ¿Endpoint funciona? → PROBAR CON CURL ✅
   ↓ Validar: Happy path, errores, integridad

6. REFACTORIZAR (Prompt 6)
   ↓ Aplicar: DRY (extraer duplicados), SRP (separar responsabilidades)
   🛑 PUNTO DE CONTROL #6: ¿Sigue funcionando? → RE-PROBAR TODO ✅
   ↓ Validar: No se rompió nada, código más limpio

7. ACTUALIZAR OPENAPI (Prompt 7)
   ↓ Documentar: api-spec.yaml con schemas y ejemplos
   🛑 PUNTO DE CONTROL #7: ¿YAML válido? → VALIDAR CON HERRAMIENTA ✅

8. DOCUMENTAR (Prompt 8)
   ↓ Crear: TESTING.md, IMPLEMENTACION-FINAL.md
   🛑 PUNTO DE CONTROL #8: ¿Docs completas? → REVISAR Y APROBAR ✅

9. CHECKLIST FINAL
   ↓ Verificar: Código, funcionalidad, principios, docs, testing
   🛑 PUNTO DE CONTROL FINAL: ¿Todo OK según checklist? → APROBAR ✅

10. ✅ LISTO PARA COMMIT/PRODUCCIÓN
```

⚠️ **CRÍTICO**: En CADA 🛑 debes:
1. DETENERTE completamente
2. REVISAR el resultado
3. PROBAR si es código funcional
4. APROBAR explícitamente antes de avanzar
5. NO continuar si algo no está claro

---

## 🎯 Diferencia Clave de Esta Guía

### **❌ Approach Incorrecto (común en desarrollo rápido)**:
```
1. Asumir estructura de BD ("debe tener un campo X")
2. Diseñar endpoints basándose en asunciones
3. Implementar código rápidamente
4. Probar al final
5. ❌ Error: "campo X no existe" / "relación Y no encontrada"
6. Rehacer todo: schema, service, controller
7. Tiempo perdido: 2-3 horas en correcciones
```

### **✅ Approach Correcto (esta guía - Verification First)**:
```
1. VERIFICAR estructura real de BD (prisma studio, db pull)
2. LISTAR exhaustivamente campos que EXISTEN
3. IDENTIFICAR campos que FALTAN para los requisitos
4. ELEGIR estrategia basada en realidad (adaptar vs migrar)
5. DISEÑAR contratos con datos reales
6. IMPLEMENTAR correctamente desde el inicio
7. PROBAR en cada paso (no solo al final)
8. ✅ Funciona desde el primer intento
9. Tiempo total: menos, sin retrabajos
```

**Beneficio clave**: Detectar desajustes entre requisitos y realidad ANTES de escribir código, no después.

---

## 💡 Principios Clave

1. **"NO ASUMAS NADA"** - Siempre verifica contra la fuente de verdad (BD)
2. **"Lista TODOS los campos"** - No resumir, ser exhaustivo
3. **"Si NO existe, dilo explícitamente"** - No inventar soluciones sin validar
4. **"Elige estrategia ANTES de codificar"** - Diseño primero, código después
5. **"Valida en cada paso"** - No esperar al final para probar

---

## 🚀 Cómo Usar Esta Guía en Tu Proyecto

### **Proceso Paso a Paso**:

1. **Lee la guía completa** antes de empezar (no ejecutes nada aún)

2. **Define tu contexto** (sección inicial):
   - Tu sistema/dominio (E-commerce, Blog, Inventario, etc.)
   - Endpoints que necesitas implementar
   - Modelos clave del dominio

3. **Personaliza CADA prompt ANTES de ejecutarlo**:
   - Reemplaza `[MODELO]`, `[CAMPO]`, `[RELACION]` con nombres reales de tu proyecto
   - Adapta los ejemplos a tu caso de uso específico
   - Usa los nombres de archivos/carpetas de tu estructura

4. **Ejecuta UN prompt a la vez** (NO todos seguidos):
   - Copia el prompt personalizado
   - Ejecútalo en Cursor (con @backend)
   - Lee la respuesta completa

5. **DETENTE en cada 🛑 PUNTO DE CONTROL**:
   - Revisa el resultado
   - Si es código: pruébalo con curl
   - Si hay errores: corrígelos ANTES de continuar
   
6. **Aprueba explícitamente** antes de avanzar:
   - Di: "Sí, continúa al siguiente prompt" o "Listo, siguiente paso"
   - Si algo no está claro: pregunta, NO avances

7. **Documenta decisiones** conforme avanzas:
   - Estrategia elegida (A o B) en Prompt 1
   - Contratos JSON en Prompt 3
   - Problemas encontrados y soluciones

8. **NO avances si algo no funciona**:
   - Si un endpoint falla: corrígelo antes de implementar el siguiente
   - Si el refactor rompe algo: revierte y hazlo más cuidadosamente

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

## ✨ Resultado Esperado al Seguir Esta Guía

Al completar los 8 prompts con sus puntos de control:

- ✅ **Código funcionando** desde el primer intento (sin rehacer por errores evitables)
- ✅ **Arquitectura limpia** (SOLID + DRY + DDD aplicados correctamente)
- ✅ **Sin deuda técnica** (código refactorizado, sin duplicación)
- ✅ **Documentación completa** (OpenAPI, testing, implementación)
- ✅ **API bien diseñada** (contratos claros, validaciones exhaustivas)
- ✅ **Testing validado** (happy path y casos de error probados)
- ✅ **Listo para producción** (o para PR con alta confianza)

**Tiempo estimado**: 2-4 horas (vs 4-6 horas con approach incorrecto)  
**Retrabajos evitados**: 80-90% (al verificar schema ANTES de implementar)

---

## 📋 Licencia y Contribuciones

Esta guía es de uso libre. Si la mejoras, comparte tus aprendizajes.

**Créditos**: Basado en experiencia real resolviendo endpoints backend para sistemas ATS, adaptado como plantilla reutilizable.

---

**Versión**: 2.0 (Genérica y Reutilizable)  
**Última actualización**: Noviembre 2025  
**Probado en**: Node.js 18-20, TypeScript 4.9-5.x, Prisma 4.x-5.x, PostgreSQL 12-16  
**Compatible con**: Express, Fastify, NestJS (adaptando estructura de archivos)

