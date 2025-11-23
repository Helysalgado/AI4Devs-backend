# Prompts iniciales para el ejercicio de endpoints LTI

<!-- documento generado por chatgpt 5.1 y copiado al proyecto como contexto inicial 

ejecutado en cursor modelo: Sonnet 4.5
-->

Este documento contiene los prompts a ser utilizados para implementar los endpoints solicitados en el ejercicio:  
- `GET /positions/:id/candidates`  
- `PUT /candidates/:id/stage`  

Los prompts serán usados dentro del IDE **Cursor**, aprovechando la capacidad de referencia al código mediante `@backend`.

---

## 🧩 1. Comprender el dominio (Candidate, Position, Application, Interview)

### **Prompt**

```
@backend

Eres un experto arquitecto de backend especializado en sistemas ATS y en Diseño Guiado por el Dominio (DDD). 
Conoces en profundidad principios SOLID, DRY y patrones de diseño, y te vas a basar EXCLUSIVAMENTE en el código real del proyecto LTI referenciado como @backend (sin inventar archivos, tablas ni nombres).

Quiero implementar dos endpoints nuevos relacionados con posiciones, candidatos y entrevistas, pero antes necesito entender bien el dominio.

1. Revisa el esquema de base de datos (por ejemplo schema.prisma) y/o los modelos de dominio relacionados con:
   - Candidate
   - Application
   - Position
   - Interview (o el nombre que se use para las entrevistas)
2. Explícame:
   - Cómo se relacionan Position, Application y Candidate.
   - Dónde se guarda el campo que representa la fase del proceso (current_interview_step o similar).
   - En qué tabla y campo se guarda el score de cada entrevista.
3. Indícame qué campos y relaciones serían relevantes para:
   - Listar candidatos de una posición, con su fase actual y la media de score.
   - Actualizar la fase de un candidato en una posición.

Responde con:
- Bullets claros
- Referencias a tipos/tablas/clases reales (nombre de archivo y entidad)
- Sin generar todavía código nuevo, sólo descripción del dominio.

```

### **Cómo ayudó**
Este prompt permite entender el modelo de dominio real del proyecto, respetando DDD y evitando suposiciones, asegurando que los endpoints se apoyaran en entidades, relaciones y campos existentes.

---

## 📁 2. Comprender la arquitectura del backend (rutas, controladores, servicios)

### **Prompt**
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

### **Cómo ayudó**
Este prompt permite identificar el patrón arquitectónico existente y respetarlo al añadir los nuevos endpoints, alineando las nuevas rutas con la estructura router → controller → service y manteniendo responsabilidad única.

---

## ✏️ 3. Diseñar el contrato de los endpoints

### **Prompt**
```
@backend

Eres un experto en diseño de APIs REST con enfoque en DDD, claridad de contratos y buenas prácticas de producto.

Debo crear estos endpoints:

1) GET /positions/:id/candidates
   - Debe devolver, para una posición:
     * id del candidato
     * nombre completo del candidato (a partir de los campos reales del modelo)
     * current_interview_step (desde la entidad de aplicación)
     * media de score de las entrevistas asociadas

2) PUT /candidates/:id/stage
   - Debe actualizar la fase actual del proceso (current_interview_step) para un candidato en una posición.

Usando el modelo real de @backend:

1. Propón la estructura JSON de respuesta para GET /positions/:id/candidates (una lista de objetos).
2. Propón el body y la respuesta de PUT /candidates/:id/stage.
3. Lista las validaciones mínimas que deberían aplicarse:
   - Identificadores inexistentes
   - Valores inválidos de fase/etapa
   - Casos sin entrevistas

No generes todavía código de implementación: concéntrate en diseñar un contrato claro, consistente y fácil de testear.

```

### **Cómo ayudó**
Este prompt ayuda a separar diseño de contrato de la implementación, siguiendo buenas prácticas de producto y permitiendo una API limpia, coherente y fácil de consumir antes de escribir código.

---

## ⚙️ 4. Implementación de `GET /positions/:id/candidates`

### **Prompt**
```
@backend

Eres un ingeniero backend senior especializado en DDD, SOLID, DRY y refactorización (Extract Method, Inline Method, etc.).
Vamos a implementar el endpoint GET /positions/:id/candidates respetando la arquitectura actual.

Requisitos funcionales:
- Recibe positionId en la ruta.
- Devuelve una lista de candidatos en proceso para esa posición, cada uno con:
  - id del candidato
  - nombre completo
  - current_interview_step
  - averageScore (media de sus scores de entrevistas)

Requisitos de diseño:
- Seguir el flujo router → controller → service → acceso a datos.
- Evitar duplicar lógica ya existente (aplicar DRY).
- Mantener el controller fino y delegar la lógica al service (SRP).

Por favor, usando los archivos reales de @backend:

1. Indica en qué archivo de rutas debo agregar este endpoint, siguiendo la convención del proyecto.
2. Genera el código necesario para:
   - La ruta (router)
   - El controlador o handler
   - El método de servicio responsable de:
     * Consultar las applications por positionId
     * Unir con los datos de candidate
     * Calcular la media de score de las entrevistas
3. Si ves lógica compleja, aplica el patrón **Extract Method** en el service para hacer el código más legible.
4. Mantén consistencia con el manejo de errores y respuestas del proyecto.

Devuélveme el código separado por archivo con comentarios del tipo:
// backend/src/rutas/...
// backend/src/controllers/...
// backend/src/services/...
```

### **Cómo ayudó**
Genera un esqueleto de implementación completo y alineado con SRP, DRY y refactor limpio (extracción de lógica al servicio), evitando controllers “gordos” y respetando la arquitectura existente.
---

## 🔄 5. Implementación de `PUT /candidates/:id/stage`

### **Prompt**
```
@backend

Eres un experto en backend y diseño de casos de uso, con experiencia en DDD y en patrones de actualización de estado en dominios como ATS.

Vamos a implementar el endpoint PUT /candidates/:id/stage.

Requisitos funcionales:
- Recibe candidateId en la ruta.
- El body incluye al menos:
  - newStage (nuevo valor de current_interview_step)
  - positionId si el modelo lo requiere para identificar la application.
- Debe:
  - Localizar la application correspondiente de ese candidate para esa position (o la actual/activa, según el modelo).
  - Validar la existencia de candidate y application.
  - Validar que newStage sea un valor permitido.
  - Actualizar current_interview_step.
  - Devolver un resumen del estado actualizado.

Requisitos de diseño:
- Seguir el patrón router → controller → service.
- Mantener el controller simple; toda la lógica de negocio debe estar en el service (SRP).
- Evitar duplicación de validaciones si ya existen utilidades o métodos similares.

Por favor, con base en @backend:

1. Indica el archivo de rutas donde debe vivir este endpoint (ej. candidates o similar), respetando la organización actual.
2. Genera:
   - La ruta correspondiente
   - El controlador
   - El método de servicio con:
     * Búsqueda de candidate/application
     * Validaciones
     * Actualización del campo current_interview_step
3. Si detectas lógica repetida con otros servicios, sugiere cómo extraerla en métodos reutilizables (DRY), sin cambiar la firma pública del endpoint.

Devuélveme el código por archivo, como antes, con comentarios de ruta de archivo.


```

### **Cómo ayudó**
Este prompt permite implementar la actualización de fase aplicando SRP, DRY y buena separación de capas, además de introducir oportunidades de refactorización si la lógica se repetía con otros casos de uso.
---

## 🧹 6. Revisión de buenas prácticas (DDD, SOLID, DRY)

### **Prompt**
```
@backend

Eres un revisor técnico senior especializado en DDD, SOLID, DRY y patrones de refactorización (Extract Method, Inline Method, etc.).
Tu tarea ahora es revisar el código de los endpoints GET /positions/:id/candidates y PUT /candidates/:id/stage ya implementados.

Por favor, usando los archivos modificados de @backend:

1. Indica si hay violaciones evidentes de:
   - SRP (Single Responsibility Principle)
   - DRY (código duplicado)
   - Modelado correcto de dominio (DDD) para Candidate, Application, Position, Interview.
2. Propón un máximo de 5 mejoras pequeñas que:
   - No cambien la firma pública de los endpoints.
   - Mejoren legibilidad, cohesión y mantenibilidad.
   - Utilicen patrones de refactor como Extract Method o Inline Method cuando tenga sentido.
3. Para cada mejora, proporciona:
   - Descripción breve
   - Fragmento de código antes/después o sugerencia concreta de cambio.

No alteres el comportamiento funcional de los endpoints, solo su calidad interna.
```

### **Cómo ayudó**
Permite realizar una revisión centrada en calidad interna: legibilidad, cohesión, eliminación de duplicación y mejor uso de refactorizaciones puntuales sin modificar el contrato externo. 

---

## 📝 7. Generación final del archivo `prompts-iniciales.md`

### **Prompt**
```
@backend

Eres un asistente de documentación técnica experto en Markdown y buenas prácticas de transparencia en uso de IA.

Quiero generar el archivo `prompts/prompts-iniciales.md` que resuma cómo utilicé la IA (Cursor) en este ejercicio.

Por favor:
1. Resume los prompts principales usados en esta sesión, organizados por fases:
   - Entender el dominio
   - Entender la arquitectura del backend
   - Diseñar los contratos
   - Implementar GET
   - Implementar PUT
   - Revisar buenas prácticas y refactor
   - Generar este propio archivo
2. Para cada prompt incluye:
   - El texto del prompt
   - Una breve sección "Cómo ayudó"
3. Usa formato Markdown limpio y profesional.
4. No inventes prompts que no se hayan utilizado; ajusta ligeramente el wording solo si es para mejorar claridad.

El objetivo es dejar evidencia clara y honesta del rol de la IA en el desarrollo del ejercicio.

```

### **Cómo ayudó**
Automatiza la creación de este documento, dejando bien descrito el rol del asistente de IA en cada fase: análisis de dominio, diseño, implementación y refactor, documentando el proceso de forma reproducible y transparente.