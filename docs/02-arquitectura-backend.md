# Arquitectura del Backend - Sistema ATS LTI

**Fecha**: 23 de noviembre de 2025  
**Objetivo**: Comprender la arquitectura existente para implementar los nuevos endpoints respetando las convenciones del proyecto.

---

## 📂 Estructura de Carpetas

```
backend/src/
├── index.ts                      # Punto de entrada, configuración Express
├── routes/                       # Definición de rutas HTTP
│   └── candidateRoutes.ts
├── presentation/                 # Capa de presentación
│   └── controllers/
│       └── candidateController.ts
├── application/                  # Capa de aplicación
│   ├── services/
│   │   ├── candidateService.ts
│   │   └── fileUploadService.ts
│   └── validator.ts
└── domain/                       # Capa de dominio
    └── models/
        ├── Candidate.ts
        ├── Application.ts
        ├── Position.ts
        ├── Interview.ts
        └── ... (otros modelos)
```

---

## 🏗️ Arquitectura en Capas (Layered Architecture)

El proyecto sigue una **arquitectura en capas** inspirada en **DDD (Domain-Driven Design)** con clara separación de responsabilidades:

### **1. Capa de Entrada (Entry Point)**
**Archivo**: `backend/src/index.ts`

**Responsabilidad**:
- Configurar servidor Express
- Registrar middlewares globales
- Montar rutas principales

```typescript
// Ejemplo de registro de rutas (línea 40)
app.use('/candidates', candidateRoutes);
```

---

### **2. Capa de Rutas (Routes Layer)**
**Directorio**: `backend/src/routes/`  
**Archivo ejemplo**: `candidateRoutes.ts`

**Responsabilidad**:
- Definir endpoints HTTP (método + path)
- Mapear rutas a controladores
- Manejar try/catch de alto nivel para cada ruta

**Ejemplo real - POST /candidates**:
```typescript
// backend/src/routes/candidateRoutes.ts (líneas 6-18)
router.post('/', async (req, res) => {
  try {
    const result = await addCandidate(req.body);
    res.status(201).send(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send({ message: error.message });
    } else {
      res.status(500).send({ message: "An unexpected error occurred" });
    }
  }
});
```

**Ejemplo real - GET /candidates/:id**:
```typescript
// backend/src/routes/candidateRoutes.ts (línea 20)
router.get('/:id', getCandidateById);
```

**Principio SOLID aplicado**: 
- **SRP (Single Responsibility Principle)**: Las rutas solo mapean HTTP a controladores, no contienen lógica de negocio.

---

### **3. Capa de Presentación/Controladores (Presentation Layer)**
**Directorio**: `backend/src/presentation/controllers/`  
**Archivo ejemplo**: `candidateController.ts`

**Responsabilidad**:
- Extraer y validar parámetros de `Request` (params, query, body)
- Llamar a servicios de la capa de aplicación
- Formatear respuestas `Response`
- Manejar errores HTTP (códigos de estado)

**Ejemplo real - getCandidateById**:
```typescript
// backend/src/presentation/controllers/candidateController.ts (líneas 18-32)
export const getCandidateById = async (req: Request, res: Response) => {
    try {
        // 1. Extraer y validar parámetros
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        
        // 2. Delegar al servicio
        const candidate = await findCandidateById(id);
        
        // 3. Validar resultado
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        
        // 4. Responder
        res.json(candidate);
    } catch (error) {
        // 5. Manejo de errores HTTP
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
```

**Principio SOLID aplicado**:
- **SRP**: El controlador solo maneja concerns de HTTP, delegando la lógica al servicio.
- **Dependency Inversion**: Depende de abstracciones (funciones de servicio), no de implementaciones concretas.

---

### **4. Capa de Aplicación/Servicios (Application Layer)**
**Directorio**: `backend/src/application/services/`  
**Archivo ejemplo**: `candidateService.ts`

**Responsabilidad**:
- **Lógica de negocio y casos de uso**
- Orquestar operaciones del dominio
- Validar datos de negocio
- Coordinar transacciones
- Llamar a modelos de dominio

**Ejemplo real - findCandidateById**:
```typescript
// backend/src/application/services/candidateService.ts (líneas 57-65)
export const findCandidateById = async (id: number): Promise<Candidate | null> => {
    try {
        // Delegar al modelo de dominio
        const candidate = await Candidate.findOne(id);
        return candidate;
    } catch (error) {
        console.error('Error al buscar el candidato:', error);
        throw new Error('Error al recuperar el candidato');
    }
};
```

**Ejemplo real - addCandidate** (caso de uso complejo):
```typescript
// backend/src/application/services/candidateService.ts (líneas 7-55)
export const addCandidate = async (candidateData: any) => {
    try {
        // 1. Validar datos
        validateCandidateData(candidateData);
    } catch (error: any) {
        throw new Error(error);
    }

    // 2. Crear instancia del modelo
    const candidate = new Candidate(candidateData);
    
    try {
        // 3. Guardar candidato principal
        const savedCandidate = await candidate.save();
        const candidateId = savedCandidate.id;

        // 4. Orquestar guardado de entidades relacionadas
        if (candidateData.educations) {
            for (const education of candidateData.educations) {
                const educationModel = new Education(education);
                educationModel.candidateId = candidateId;
                await educationModel.save();
                candidate.education.push(educationModel);
            }
        }

        // ... (similar para workExperiences y resumes)
        
        return savedCandidate;
    } catch (error: any) {
        // 5. Manejo de errores de negocio
        if (error.code === 'P2002') {
            throw new Error('The email already exists in the database');
        } else {
            throw error;
        }
    }
};
```

**Principios SOLID aplicados**:
- **SRP**: Cada servicio se enfoca en un caso de uso específico
- **DRY**: Validaciones reutilizables (validator.ts)
- **Separation of Concerns**: No maneja HTTP directamente

---

### **5. Capa de Dominio/Modelos (Domain Layer)**
**Directorio**: `backend/src/domain/models/`  
**Archivo ejemplo**: `Candidate.ts`

**Responsabilidad**:
- Representar entidades del dominio
- Encapsular lógica de persistencia (Prisma)
- Proveer métodos estáticos para queries (findOne, findAll, etc.)
- Métodos de instancia para operaciones CRUD (save, delete, etc.)

**Ejemplo real - Candidate.findOne**:
```typescript
// backend/src/domain/models/Candidate.ts (líneas 129-162)
static async findOne(id: number): Promise<Candidate | null> {
    const data = await prisma.candidate.findUnique({
        where: { id: id },
        include: {
            educations: true,
            workExperiences: true,
            resumes: true,
            applications: {
                include: {
                    position: {
                        select: {
                            id: true,
                            title: true
                        }
                    },
                    interviews: {
                        select: {
                            interviewDate: true,
                            interviewStep: {
                                select: {
                                    name: true
                                }
                            },
                            notes: true,
                            score: true
                        }
                    }
                }
            }
        }
    });
    if (!data) return null;
    return new Candidate(data);
}
```

**Principios SOLID aplicados**:
- **SRP**: Cada modelo maneja solo su propia persistencia
- **Encapsulation**: Prisma está encapsulado dentro del modelo, no expuesto fuera del dominio

---

## 🔄 Flujo de una Request Típica

### **Ejemplo: GET /candidates/:id**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. HTTP Request: GET /candidates/123                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. index.ts (línea 40)                                          │
│    app.use('/candidates', candidateRoutes)                      │
│    → Rutea a candidateRoutes                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. routes/candidateRoutes.ts (línea 20)                         │
│    router.get('/:id', getCandidateById)                         │
│    → Delega al controlador                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. presentation/controllers/candidateController.ts (línea 18)   │
│    export const getCandidateById = async (req, res) => {        │
│      const id = parseInt(req.params.id)                         │
│      const candidate = await findCandidateById(id) ← SERVICE    │
│      res.json(candidate)                                        │
│    }                                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. application/services/candidateService.ts (línea 57)          │
│    export const findCandidateById = async (id) => {             │
│      return await Candidate.findOne(id) ← DOMAIN MODEL          │
│    }                                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. domain/models/Candidate.ts (línea 129)                       │
│    static async findOne(id) {                                   │
│      const data = await prisma.candidate.findUnique({           │
│        where: { id },                                           │
│        include: { ... }                                         │
│      })                                                         │
│      return new Candidate(data)                                 │
│    }                                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. Prisma → PostgreSQL                                          │
│    SELECT * FROM Candidate WHERE id = 123 ...                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. HTTP Response: 200 OK                                        │
│    { id: 123, firstName: "...", ... }                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Patrón de Manejo de Errores

### **Estrategia de tres niveles**:

1. **Nivel de Modelo/Dominio**:
   - Lanza errores de Prisma (P2002, P2025, etc.)
   - Ejemplo: `Candidate.save()` puede lanzar error de unique constraint

2. **Nivel de Servicio**:
   - Captura errores de dominio
   - Traduce a errores de negocio
   - Ejemplo: `P2002` → `"The email already exists"`

3. **Nivel de Controlador/Ruta**:
   - Captura errores de servicio
   - Mapea a códigos HTTP apropiados
   - Ejemplo: `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

**Ejemplo en candidateRoutes.ts**:
```typescript
try {
    const result = await addCandidate(req.body);
    res.status(201).send(result);
} catch (error) {
    if (error instanceof Error) {
        res.status(400).send({ message: error.message });
    } else {
        res.status(500).send({ message: "An unexpected error occurred" });
    }
}
```

---

## 🎯 Convenciones del Proyecto

### **Naming Conventions**:
- **Rutas**: `camelCaseRoutes.ts` (ej: `candidateRoutes.ts`)
- **Controladores**: `camelCaseController.ts` (ej: `candidateController.ts`)
- **Servicios**: `camelCaseService.ts` (ej: `candidateService.ts`)
- **Modelos**: `PascalCase.ts` (ej: `Candidate.ts`)

### **Export Conventions**:
- **Controladores y Servicios**: Named exports
  ```typescript
  export const getCandidateById = async (...) => { ... }
  ```
  
- **Rutas**: Default export del router
  ```typescript
  export default router;
  ```

### **Uso de Async/Await**:
- Todas las operaciones asíncronas usan `async/await`
- Los controladores son funciones async
- Los servicios retornan Promises

---

## ✅ Principios SOLID en la Arquitectura

### **1. Single Responsibility Principle (SRP)**
- ✅ **Routes**: Solo mapear HTTP a controllers
- ✅ **Controllers**: Solo manejar Request/Response
- ✅ **Services**: Solo lógica de negocio
- ✅ **Models**: Solo persistencia y queries

### **2. Open/Closed Principle (OCP)**
- Fácil añadir nuevos endpoints sin modificar código existente
- Nuevos servicios se pueden crear sin tocar servicios existentes

### **3. Liskov Substitution Principle (LSP)**
- Los modelos pueden ser sustituidos por mocks en tests
- Los servicios pueden ser reemplazados por implementaciones alternativas

### **4. Interface Segregation Principle (ISP)**
- Controladores exponen solo las funciones necesarias
- Servicios no fuerzan a implementar métodos innecesarios

### **5. Dependency Inversion Principle (DIP)**
- Controllers dependen de abstracciones (funciones de servicio), no implementaciones concretas
- Services dependen de modelos del dominio, no de Prisma directamente

---

## 🔧 Patrón de Validación

**Archivo**: `backend/src/application/validator.ts`

- Validaciones reutilizables centralizadas
- Aplicadas en la capa de servicio (antes de llamar al dominio)
- Ejemplo: `validateCandidateData(candidateData)`

**Principio DRY**: Evita duplicar lógica de validación en múltiples lugares.

---

## 🚀 Recomendaciones para Nuevos Endpoints

### **Para implementar GET /positions/:id/candidates**:

1. **¿Crear nueva ruta o añadir a existente?**
   - Opción A: Crear `positionRoutes.ts` (recomendado, sigue convención REST)
   - Opción B: Añadir a `candidateRoutes.ts` como `/candidates/by-position/:positionId`

2. **Crear controlador**:
   - Nuevo archivo `positionController.ts` o añadir función a `candidateController.ts`

3. **Crear servicio**:
   - Nuevo archivo `positionService.ts` o añadir función a `candidateService.ts`
   - Implementar lógica para:
     - Buscar `Application` por `positionId`
     - Incluir relaciones: `candidate`, `interviews`
     - Calcular promedio de `score`

4. **Usar modelos existentes**:
   - No necesita nuevos modelos
   - Usar `Application`, `Candidate`, `Interview`

### **Para implementar PUT /candidates/:id/stage**:

1. **Añadir a candidateRoutes.ts**:
   ```typescript
   router.put('/:id/stage', updateCandidateStage);
   ```

2. **Crear controlador** en `candidateController.ts`:
   ```typescript
   export const updateCandidateStage = async (req, res) => { ... }
   ```

3. **Crear servicio** en `candidateService.ts`:
   ```typescript
   export const updateApplicationStage = async (candidateId, positionId, newStepId) => { ... }
   ```

4. **Usar modelo Application**:
   - Buscar application: `Application.findOne()`
   - Actualizar: `application.currentInterviewStep = newStepId`
   - Guardar: `application.save()`

---

## 📝 Resumen

| Capa | Directorio | Responsabilidad | Principio SOLID |
|------|-----------|----------------|-----------------|
| **Entry** | `index.ts` | Configurar Express, registrar rutas | - |
| **Routes** | `routes/` | Mapear HTTP a controllers | SRP |
| **Controllers** | `presentation/controllers/` | Manejar Request/Response | SRP, DIP |
| **Services** | `application/services/` | Lógica de negocio | SRP, DRY |
| **Models** | `domain/models/` | Persistencia y queries | SRP, Encapsulation |

**Flujo típico**: `Route → Controller → Service → Model → Prisma → DB`

---

**Siguiente paso**: Diseñar el contrato de los endpoints (estructura JSON, validaciones)

