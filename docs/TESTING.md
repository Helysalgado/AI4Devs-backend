# Guía de Testing - Nuevos Endpoints

**Fecha**: 23 de noviembre de 2025

---

## 🚀 Pasos para Iniciar el Sistema

### **1. Iniciar la Base de Datos**

Si usas Docker:
```bash
cd AI4Devs-backend
docker-compose up -d
```

Si PostgreSQL está instalado localmente, asegúrate de que esté corriendo:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Iniciar desde Services
```

### **2. Verificar la Conexión a la Base de Datos**

Verifica la conexión con:
```bash
cd backend
npx prisma studio
```

Esto abrirá Prisma Studio en tu navegador donde puedes ver y editar los datos.

### **3. Verificar que hay datos de prueba**

Necesitas al menos:
- Una `Position` con datos
- Un `Candidate` con datos
- Una `Application` que relacione el candidate con la position
- Opcionalmente: `Interview` con scores

Si no hay datos, puedes usar el seed:
```bash
cd backend
npx prisma db seed
```

O insertar datos manualmente en Prisma Studio.

### **4. Iniciar el Servidor Backend**

```bash
cd backend
npm run dev
```

Deberías ver:
```
Server is running at http://localhost:3010
```

---

## 🧪 Casos de Prueba

### **Caso 1: GET /positions/:id/candidates - Position Exists**

**Request:**
```bash
curl http://localhost:3010/positions/1/candidates
```

**Expected Response (200 OK):**
```json
{
  "positionId": 1,
  "positionTitle": "Software Engineer",
  "candidatesCount": 2,
  "candidates": [
    {
      "candidateId": 1,
      "fullName": "John Doe",
      "email": "john@example.com",
      "applicationId": 1,
      "currentInterviewStep": {
        "id": 1,
        "name": "Initial Screening",
        "orderIndex": 0
      },
      "averageScore": 8.5,
      "interviewsCompleted": 2,
      "applicationDate": "2024-11-15T10:30:00.000Z"
    }
  ]
}
```

---

### **Caso 2: GET /positions/:id/candidates - Position Not Found**

**Request:**
```bash
curl http://localhost:3010/positions/999/candidates
```

**Expected Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "Position with ID 999 not found.",
  "statusCode": 404
}
```

---

### **Caso 3: GET /positions/:id/candidates - Invalid ID**

**Request:**
```bash
curl http://localhost:3010/positions/abc/candidates
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "Invalid position ID format. Must be a positive integer.",
  "statusCode": 400
}
```

---

### **Caso 4: GET /positions/:id/candidates - No Candidates**

**Request:**
```bash
curl http://localhost:3010/positions/5/candidates
```

**Expected Response (200 OK):**
```json
{
  "positionId": 5,
  "positionTitle": "Backend Developer",
  "candidatesCount": 0,
  "candidates": []
}
```

---

### **Caso 5: PUT /candidates/:id/stage - Success**

**Request:**
```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1,
    "newInterviewStepId": 2
  }'
```

**Expected Response (200 OK):**
```json
{
  "message": "Candidate stage updated successfully",
  "data": {
    "candidateId": 1,
    "candidateName": "John Doe",
    "positionId": 1,
    "positionTitle": "Software Engineer",
    "applicationId": 1,
    "previousInterviewStep": {
      "id": 1,
      "name": "Initial Screening"
    },
    "currentInterviewStep": {
      "id": 2,
      "name": "Technical Interview"
    },
    "updatedAt": "2024-11-23T15:45:30.123Z"
  }
}
```

---

### **Caso 6: PUT /candidates/:id/stage - Candidate Not Found**

**Request:**
```bash
curl -X PUT http://localhost:3010/candidates/999/stage \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1,
    "newInterviewStepId": 2
  }'
```

**Expected Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "Candidate with ID 999 not found.",
  "statusCode": 404
}
```

---

### **Caso 7: PUT /candidates/:id/stage - Invalid Interview Step**

**Request:**
```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1,
    "newInterviewStepId": 99
  }'
```

**Expected Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "Interview step with ID 99 not found.",
  "statusCode": 404
}
```

---

### **Caso 8: PUT /candidates/:id/stage - Interview Step from Different Flow**

**Request:**
```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1,
    "newInterviewStepId": 10
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "Interview step 10 does not belong to the interview flow of position 1.",
  "statusCode": 400
}
```

---

### **Caso 9: PUT /candidates/:id/stage - Missing Fields**

**Request:**
```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    "newInterviewStepId is required and must be a positive integer"
  ],
  "statusCode": 400
}
```

---

## 🐛 Troubleshooting

### **Error 500 - Internal Server Error**

**Causa común**: Problema de conexión con la base de datos

**Solución**:
1. Verifica que PostgreSQL esté corriendo
2. Verifica la cadena de conexión en `prisma/schema.prisma`
3. Revisa los logs del servidor para más detalles

```bash
# Ver logs del servidor
# En la terminal donde corre npm run dev
```

### **Error: "Position with ID X not found"**

**Causa**: La posición no existe en la base de datos

**Solución**:
1. Abre Prisma Studio: `npx prisma studio`
2. Verifica qué posiciones existen en la tabla `Position`
3. Usa un ID que exista o crea nuevas posiciones

### **Error: "No application found"**

**Causa**: No existe una Application que relacione el candidate con la position

**Solución**:
1. Verifica en Prisma Studio la tabla `Application`
2. Asegúrate de que exista un registro con el `candidateId` y `positionId` correctos

---

## 📊 Verificar Datos en la Base de Datos

### **Usar Prisma Studio (Recomendado)**

```bash
cd backend
npx prisma studio
```

Esto abre una interfaz web donde puedes:
- Ver todas las tablas
- Inspeccionar datos
- Crear/editar/eliminar registros

### **Usar psql (Terminal)**

```bash
psql postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb

# Listar posiciones
SELECT id, title FROM "Position";

# Listar candidatos
SELECT id, "firstName", "lastName", email FROM "Candidate";

# Listar applications
SELECT id, "candidateId", "positionId", "currentInterviewStep" FROM "Application";

# Listar interview steps
SELECT id, name, "orderIndex", "interviewFlowId" FROM "InterviewStep";
```

---

## ✅ Checklist de Verificación

Antes de probar los endpoints, asegúrate de que:

- [ ] PostgreSQL está corriendo
- [ ] La base de datos `LTIdb` existe
- [ ] Las migraciones de Prisma se ejecutaron (`npx prisma migrate dev`)
- [ ] Hay datos de prueba (usa `npx prisma db seed` o Prisma Studio)
- [ ] El servidor backend está corriendo (`npm run dev`)
- [ ] Puedes acceder a http://localhost:3010 (debería responder "Hola LTI!")

---

## 🔧 Comandos Útiles

```bash
# Resetear base de datos y aplicar migraciones
cd backend
npx prisma migrate reset

# Ver estructura de la base de datos
npx prisma studio

# Generar cliente de Prisma después de cambios en schema
npx prisma generate

# Formatear el schema de Prisma
npx prisma format

# Ver el estado de las migraciones
npx prisma migrate status
```

---

## 📝 Notas

- Los endpoints están protegidos con validaciones exhaustivas
- Los errores 404 son normales si los IDs no existen
- El cálculo de `averageScore` excluye entrevistas sin score
- Las fechas se retornan en formato ISO 8601
- Los scores se redondean a 1 decimal

---

**Estado Actual**: Los endpoints están implementados y funcionando correctamente. Si ves errores 500, verifica la conexión a la base de datos y que haya datos de prueba.

