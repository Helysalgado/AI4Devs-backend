# Guía de Testing - Endpoints Kanban

**Proyecto**: Sistema ATS - Endpoints para Vista Kanban  
**Última actualización**: 23 de noviembre de 2025  
**Documento relacionado**: `docs/IMPLEMENTACION-KANBAN-ENDPOINTS.md`

---

## 📋 Índice

1. [Prerequisitos](#-prerequisitos)
2. [Iniciar el Sistema](#-iniciar-el-sistema)
3. [Testing Endpoint GET](#-testing-endpoint-get)
4. [Testing Endpoint PUT](#-testing-endpoint-put)
5. [Suite Completa de Pruebas](#-suite-completa-de-pruebas)
6. [Script de Testing Automatizado](#-script-de-testing-automatizado)
7. [Verificación con Prisma Studio](#-verificación-con-prisma-studio)
8. [Troubleshooting](#-troubleshooting)

---

## 📦 Prerequisitos

### Software Necesario:
- ✅ Node.js (v18+)
- ✅ PostgreSQL corriendo
- ✅ npm o yarn

### Variables de Entorno:
Verifica que el archivo `backend/.env` exista con:
```env
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"
```

### Dependencias Instaladas:
```bash
cd backend
npm install
```

---

## 🚀 Iniciar el Sistema

### 1. Iniciar PostgreSQL

**macOS (Homebrew)**:
```bash
brew services start postgresql
```

**Linux**:
```bash
sudo systemctl start postgresql
```

**Docker**:
```bash
docker-compose up -d
```

### 2. Iniciar el Servidor Backend

```bash
cd backend
npm run dev
```

**Salida esperada**:
```
Server is running at http://localhost:3010
```

### 3. Verificar que el Servidor Funciona

```bash
curl http://localhost:3010/
```

**Respuesta esperada**:
```
Hola LTI!
```

✅ Si ves este mensaje, el servidor está funcionando correctamente.

---

## 📥 Testing Endpoint GET

### Endpoint: `GET /positions/:id/candidates`

**Propósito**: Obtener todos los candidatos de una posición con su estado actual en el proceso de entrevistas.

---

### ✅ Test 1: Happy Path - Obtener Candidatos

**Método 1: curl (Terminal)**

```bash
curl http://localhost:3010/positions/1/candidates
```

**Método 2: curl con formato JSON legible**

```bash
curl http://localhost:3010/positions/1/candidates | jq
```

**Método 3: Navegador Web**

Abre en tu navegador:
```
http://localhost:3010/positions/1/candidates
```

**Método 4: Postman**
1. Nuevo Request → GET
2. URL: `http://localhost:3010/positions/1/candidates`
3. Send

---

#### Respuesta Esperada (200 OK):

```json
{
  "positionId": 1,
  "positionTitle": "Desarrollador Full Stack Senior",
  "candidates": [
    {
      "candidateId": 1,
      "fullName": "Juan Pérez Rodríguez",
      "email": "juan.perez@email.com",
      "applicationId": 1,
      "applicationDate": "2025-11-14T23:33:40.373Z",
      "currentInterviewStep": {
        "id": 1,
        "name": "Filtro inicial HR",
        "orderIndex": 1
      },
      "averageScore": 85,
      "interviewCount": 3
    }
  ],
  "totalCandidates": 1
}
```

#### ✅ Validaciones:
- [x] Status code: 200
- [x] `positionId` es el ID solicitado
- [x] `positionTitle` existe
- [x] `candidates` es un array
- [x] `fullName` es la concatenación de firstName + lastName
- [x] `currentInterviewStep` contiene: id, name, orderIndex
- [x] `averageScore` es un número (85 en este caso)
- [x] `interviewCount` es 3 (número de entrevistas realizadas)
- [x] `totalCandidates` coincide con la longitud del array

---

### ❌ Test 2: Error 404 - Posición No Existe

```bash
curl http://localhost:3010/positions/9999/candidates
```

#### Respuesta Esperada (404 Not Found):

```json
{
  "error": "Position not found",
  "message": "No position found with id 9999",
  "statusCode": 404
}
```

#### ✅ Validaciones:
- [x] Status code: 404
- [x] Mensaje de error claro
- [x] `statusCode` en el body

---

### ❌ Test 3: Error 400 - ID Inválido (No Numérico)

```bash
curl http://localhost:3010/positions/abc/candidates
```

#### Respuesta Esperada (400 Bad Request):

```json
{
  "error": "Invalid ID format",
  "message": "Position ID must be a valid number",
  "statusCode": 400
}
```

#### ✅ Validaciones:
- [x] Status code: 400
- [x] Mensaje descriptivo del error de validación

---

### ❌ Test 4: Error 400 - ID Negativo

```bash
curl http://localhost:3010/positions/-5/candidates
```

#### Respuesta Esperada (400 Bad Request):

```json
{
  "error": "Invalid ID format",
  "message": "Position ID must be a positive integer",
  "statusCode": 400
}
```

---

### ✅ Test 5: Posición Sin Candidatos

Si tienes una posición sin candidatos aplicados:

```bash
curl http://localhost:3010/positions/2/candidates
```

#### Respuesta Esperada (200 OK):

```json
{
  "positionId": 2,
  "positionTitle": "Frontend Developer",
  "candidates": [],
  "totalCandidates": 0
}
```

#### ✅ Validaciones:
- [x] Status code: 200 (no es error)
- [x] `candidates` es array vacío
- [x] `totalCandidates` es 0

---

## 🔄 Testing Endpoint PUT

### Endpoint: `PUT /candidates/:id/stage`

**Propósito**: Actualizar la etapa actual del proceso de entrevistas de un candidato (para mover en el Kanban).

---

### ✅ Test 1: Happy Path - Actualizar Etapa

**Método 1: curl (Una línea)**

```bash
curl -X PUT http://localhost:3010/candidates/1/stage -H "Content-Type: application/json" -d '{"positionId": 1, "interviewStepId": 2}'
```

**Método 2: curl (Formato legible)**

```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1,
    "interviewStepId": 2
  }'
```

**Método 3: curl con output formateado**

```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1, "interviewStepId": 2}' | jq
```

**Método 4: Postman**

1. Nuevo Request → PUT
2. URL: `http://localhost:3010/candidates/1/stage`
3. Headers:
   - Key: `Content-Type`
   - Value: `application/json`
4. Body → raw → JSON:
   ```json
   {
     "positionId": 1,
     "interviewStepId": 2
   }
   ```
5. Send

---

#### Respuesta Esperada (200 OK):

```json
{
  "success": true,
  "message": "Candidate stage updated successfully",
  "data": {
    "candidateId": 1,
    "fullName": "Juan Pérez Rodríguez",
    "positionId": 1,
    "positionTitle": "Desarrollador Full Stack Senior",
    "applicationId": 1,
    "previousStage": {
      "id": 1,
      "name": "Filtro inicial HR"
    },
    "currentStage": {
      "id": 2,
      "name": "Evaluación técnica"
    },
    "updatedAt": "2025-11-23T05:48:36.597Z"
  }
}
```

#### ✅ Validaciones:
- [x] Status code: 200
- [x] `success` es true
- [x] `previousStage` muestra la etapa anterior (id: 1)
- [x] `currentStage` muestra la nueva etapa (id: 2)
- [x] `updatedAt` tiene timestamp ISO 8601

---

### ✅ Test 2: Verificar el Cambio con GET

Después de ejecutar el PUT, verifica que el cambio se aplicó:

```bash
curl http://localhost:3010/positions/1/candidates | jq '.candidates[0].currentInterviewStep'
```

#### Respuesta Esperada:

```json
{
  "id": 2,
  "name": "Evaluación técnica",
  "orderIndex": 2
}
```

#### ✅ Validaciones:
- [x] El `id` cambió de 1 a 2
- [x] El `name` cambió a "Evaluación técnica"
- [x] El `orderIndex` cambió a 2

---

### ✅ Test 3: Mover Hacia Atrás en el Flujo

El sistema permite retroceder candidatos en el proceso:

```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1, "interviewStepId": 1}'
```

#### Respuesta Esperada (200 OK):

```json
{
  "success": true,
  "data": {
    "previousStage": {
      "id": 2,
      "name": "Evaluación técnica"
    },
    "currentStage": {
      "id": 1,
      "name": "Filtro inicial HR"
    }
  }
}
```

#### ✅ Validaciones:
- [x] Permite mover hacia atrás (no hay restricción)
- [x] `previousStage.id` es 2
- [x] `currentStage.id` es 1

---

### ✅ Test 4: Mover a la Misma Etapa (Idempotente)

```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1, "interviewStepId": 1}'
```

#### Respuesta Esperada (200 OK):

```json
{
  "success": true,
  "data": {
    "previousStage": {
      "id": 1,
      "name": "Filtro inicial HR"
    },
    "currentStage": {
      "id": 1,
      "name": "Filtro inicial HR"
    }
  }
}
```

#### ✅ Validaciones:
- [x] No es error (operación idempotente)
- [x] `previousStage` == `currentStage`

---

### ❌ Test 5: Error 404 - Candidato No Existe

```bash
curl -X PUT http://localhost:3010/candidates/9999/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1, "interviewStepId": 2}'
```

#### Respuesta Esperada (404 Not Found):

```json
{
  "error": "Candidate not found",
  "message": "Candidate with id 9999 not found",
  "statusCode": 404
}
```

---

### ❌ Test 6: Error 404 - Aplicación No Existe

El candidato existe pero no aplicó a esa posición:

```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 9999, "interviewStepId": 2}'
```

#### Respuesta Esperada (404 Not Found):

```json
{
  "error": "Application not found",
  "message": "Application not found for candidate 1 in position 9999",
  "statusCode": 404
}
```

---

### ❌ Test 7: Error 400 - Campo Faltante (positionId)

```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"interviewStepId": 2}'
```

#### Respuesta Esperada (400 Bad Request):

```json
{
  "error": "Validation error",
  "message": "Missing required field: positionId",
  "statusCode": 400
}
```

---

### ❌ Test 8: Error 400 - Campo Faltante (interviewStepId)

```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1}'
```

#### Respuesta Esperada (400 Bad Request):

```json
{
  "error": "Validation error",
  "message": "Missing required field: interviewStepId",
  "statusCode": 400
}
```

---

### ❌ Test 9: Error 400 - Tipo de Dato Inválido

```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": "abc", "interviewStepId": 2}'
```

#### Respuesta Esperada (400 Bad Request):

```json
{
  "error": "Validation error",
  "message": "positionId must be a valid number",
  "statusCode": 400
}
```

---

### ❌ Test 10: Error 400 - InterviewStep No Pertenece al Flujo

Si intentas asignar una etapa de un flujo diferente:

```bash
# Ejemplo: interviewStepId 99 existe pero pertenece a otro InterviewFlow
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1, "interviewStepId": 99}'
```

#### Respuesta Esperada (400 Bad Request):

```json
{
  "error": "Invalid interview step",
  "message": "Interview step 99 does not belong to the interview flow of position 1",
  "statusCode": 400
}
```

**Nota**: Este test solo funcionará si tienes un InterviewStep con ese ID en otro flujo.

---

## 🧪 Suite Completa de Pruebas

### Checklist de Testing Manual

#### Endpoint GET /positions/:id/candidates
- [ ] ✅ Happy path con candidatos (200)
- [ ] ❌ Position no existe (404)
- [ ] ❌ ID no numérico (400)
- [ ] ❌ ID negativo (400)
- [ ] ✅ Position sin candidatos - array vacío (200)

#### Endpoint PUT /candidates/:id/stage
- [ ] ✅ Happy path actualizar etapa (200)
- [ ] ✅ Verificar cambio con GET (200)
- [ ] ✅ Mover hacia atrás (200)
- [ ] ✅ Mover a misma etapa - idempotente (200)
- [ ] ❌ Candidato no existe (404)
- [ ] ❌ Aplicación no existe (404)
- [ ] ❌ Campo positionId faltante (400)
- [ ] ❌ Campo interviewStepId faltante (400)
- [ ] ❌ Tipo de dato inválido (400)
- [ ] ❌ InterviewStep de flujo diferente (400)

---

## 🤖 Script de Testing Automatizado

Crea un archivo `test-endpoints.sh` en el directorio raíz del proyecto:

```bash
#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3010"

echo "========================================"
echo "🧪 Testing Endpoints Kanban"
echo "========================================"

# Función para imprimir resultados
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC}: $2"
    else
        echo -e "${RED}❌ FAILED${NC}: $2"
    fi
}

# Test 1: Verificar servidor
echo ""
echo "--- Test 1: Verificar servidor ---"
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/)
if [ "$response" -eq 200 ]; then
    print_result 0 "Servidor respondiendo"
else
    print_result 1 "Servidor no responde"
    exit 1
fi

# Test 2: GET /positions/1/candidates
echo ""
echo "--- Test 2: GET /positions/1/candidates ---"
response=$(curl -s -w "\n%{http_code}" $BASE_URL/positions/1/candidates)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    print_result 0 "GET con positionId válido"
    echo "$body" | jq '.'
else
    print_result 1 "GET falló con código $http_code"
fi

# Test 3: GET con ID inválido (404)
echo ""
echo "--- Test 3: GET con positionId inexistente (404) ---"
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/positions/9999/candidates)
if [ "$response" -eq 404 ]; then
    print_result 0 "404 para position inexistente"
else
    print_result 1 "Esperaba 404, obtuvo $response"
fi

# Test 4: GET con ID no numérico (400)
echo ""
echo "--- Test 4: GET con ID inválido (400) ---"
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/positions/abc/candidates)
if [ "$response" -eq 400 ]; then
    print_result 0 "400 para ID inválido"
else
    print_result 1 "Esperaba 400, obtuvo $response"
fi

# Test 5: PUT actualizar etapa a 2
echo ""
echo "--- Test 5: PUT actualizar a etapa 2 ---"
response=$(curl -s -w "\n%{http_code}" -X PUT $BASE_URL/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1, "interviewStepId": 2}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    print_result 0 "PUT actualización exitosa"
    echo "$body" | jq '.data | {previousStage, currentStage}'
else
    print_result 1 "PUT falló con código $http_code"
fi

# Test 6: Verificar cambio con GET
echo ""
echo "--- Test 6: Verificar cambio con GET ---"
response=$(curl -s $BASE_URL/positions/1/candidates)
current_step=$(echo "$response" | jq -r '.candidates[0].currentInterviewStep.id')

if [ "$current_step" -eq 2 ]; then
    print_result 0 "Cambio reflejado en GET (currentStep es 2)"
else
    print_result 1 "Cambio NO reflejado, currentStep es $current_step"
fi

# Test 7: PUT con campo faltante (400)
echo ""
echo "--- Test 7: PUT con campo faltante (400) ---"
response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1}')
if [ "$response" -eq 400 ]; then
    print_result 0 "400 para campo faltante"
else
    print_result 1 "Esperaba 400, obtuvo $response"
fi

# Test 8: PUT con candidato inexistente (404)
echo ""
echo "--- Test 8: PUT con candidato inexistente (404) ---"
response=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/candidates/9999/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1, "interviewStepId": 2}')
if [ "$response" -eq 404 ]; then
    print_result 0 "404 para candidato inexistente"
else
    print_result 1 "Esperaba 404, obtuvo $response"
fi

# Test 9: Volver a etapa 1
echo ""
echo "--- Test 9: Volver a etapa 1 (retroceder) ---"
response=$(curl -s -w "\n%{http_code}" -X PUT $BASE_URL/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"positionId": 1, "interviewStepId": 1}')
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 200 ]; then
    print_result 0 "Permite retroceder en el flujo"
else
    print_result 1 "No permitió retroceder, código $http_code"
fi

echo ""
echo "========================================"
echo "✨ Testing completado"
echo "========================================"
```

### Ejecutar el Script:

```bash
# Dar permisos de ejecución
chmod +x test-endpoints.sh

# Ejecutar
./test-endpoints.sh
```

**Nota**: Requiere `jq` instalado:
```bash
brew install jq  # macOS
sudo apt install jq  # Linux
```

---

## 🔍 Verificación con Prisma Studio

Puedes verificar visualmente los cambios en la base de datos mientras pruebas:

### 1. Iniciar Prisma Studio

```bash
cd backend
npx prisma studio
```

Abre en tu navegador: `http://localhost:5555`

### 2. Navegar a las Tablas

**Para verificar GET**:
1. Click en **Position** → Busca el ID que estás consultando
2. Click en **Application** → Verifica que existen aplicaciones para esa position
3. Click en **Candidate** → Ve los nombres completos
4. Click en **Interview** → Ve los scores

**Para verificar PUT**:
1. Click en **Application**
2. Busca la aplicación del candidato
3. Observa el campo **currentInterviewStep**
4. Ejecuta el PUT
5. **Refresca la página** (F5)
6. Verifica que **currentInterviewStep** cambió

### 3. Datos Disponibles

Según nuestras pruebas, tienes:

#### Position (ID: 1):
- **title**: "Desarrollador Full Stack Senior"
- **interviewFlowId**: 1

#### Candidate (ID: 1):
- **firstName**: "Juan"
- **lastName**: "Pérez Rodríguez"
- **email**: "juan.perez@email.com"

#### Application (ID: 1):
- **candidateId**: 1
- **positionId**: 1
- **currentInterviewStep**: 1 (o 2 si lo cambiaste)

#### InterviewStep disponibles (para Position 1):
- **ID 1**: "Filtro inicial HR" (orderIndex: 1)
- **ID 2**: "Evaluación técnica" (orderIndex: 2)

#### Interview (para Application 1):
- 3 entrevistas registradas con scores
- **Promedio**: 85

---

## 🐛 Troubleshooting

### Problema: "Connection refused" al hacer curl

**Solución**:
```bash
# Verifica que el servidor esté corriendo
curl http://localhost:3010/

# Si no responde, inicia el servidor
cd backend
npm run dev
```

---

### Problema: "Position with id X not found"

**Solución**:
```bash
# Verifica qué positions existen en Prisma Studio
npx prisma studio
# O consulta directamente:
psql -h localhost -U LTIdbUser -d LTIdb -c "SELECT id, title FROM \"Position\";"
```

---

### Problema: "Column Application.currentInterviewStep does not exist"

**Solución**: La migración no se aplicó. Ejecuta:
```bash
cd backend
PGPASSWORD=D1ymf8wyQEGthFR1E9xhCq psql -h localhost -U LTIdbUser -d LTIdb -f prisma/migrations/20241123_add_current_interview_step/migration.sql
npx prisma generate
```

Luego reinicia el servidor.

---

### Problema: curl muestra JSON sin formato

**Solución**: Instala `jq` y úsalo:
```bash
# Instalar jq
brew install jq  # macOS
sudo apt install jq  # Linux

# Usar con curl
curl http://localhost:3010/positions/1/candidates | jq
```

---

### Problema: "Missing required field: positionId" en PUT

**Solución**: Asegúrate de incluir el header `Content-Type`:
```bash
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \    # ← Importante
  -d '{"positionId": 1, "interviewStepId": 2}'
```

---

### Problema: averageScore es null pero hay entrevistas

**Posibles causas**:
1. Los scores en Interview son todos null
2. Verifica en Prisma Studio:
   ```sql
   SELECT * FROM "Interview" WHERE "applicationId" = 1;
   ```

---

### Problema: El cambio no se refleja en GET después de PUT

**Solución**:
1. Verifica que el PUT retornó 200
2. Verifica el campo `currentStage.id` en la respuesta del PUT
3. Ejecuta el GET de nuevo
4. Si persiste, verifica en Prisma Studio directamente

---

## 📊 Datos de Prueba Adicionales

Si necesitas crear más datos para testing:

### Crear más candidatos en Prisma Studio:

1. Abre `http://localhost:5555`
2. Click en **Candidate** → **Add record**
3. Completa: firstName, lastName, email
4. Save

### Crear una aplicación:

1. Click en **Application** → **Add record**
2. Completa:
   - candidateId: (el ID del candidato creado)
   - positionId: 1
   - applicationDate: (fecha actual)
   - currentInterviewStep: 1
   - status: PENDING
3. Save

### Crear entrevistas con scores:

1. Click en **Interview** → **Add record**
2. Completa:
   - applicationId: (el ID de la aplicación)
   - interviewStepId: 1
   - employeeId: (algún ID de Employee)
   - interviewDate: (fecha)
   - score: 80
   - result: PASSED
3. Save

---

## ✅ Checklist Final de Validación

Antes de considerar el testing completo, verifica:

### Funcionalidad Básica:
- [ ] Servidor inicia sin errores
- [ ] `curl http://localhost:3010/` retorna "Hola LTI!"
- [ ] Prisma Studio accesible en `http://localhost:5555`

### Endpoint GET:
- [ ] Retorna candidatos con status 200
- [ ] `fullName` es concatenación correcta
- [ ] `averageScore` se calcula bien
- [ ] `currentInterviewStep` incluye id, name, orderIndex
- [ ] Maneja posición inexistente (404)
- [ ] Maneja ID inválido (400)

### Endpoint PUT:
- [ ] Actualiza etapa correctamente (200)
- [ ] Retorna previousStage y currentStage
- [ ] Cambio se refleja en GET
- [ ] Permite retroceder
- [ ] Valida candidato inexistente (404)
- [ ] Valida campos faltantes (400)
- [ ] Valida tipos de dato (400)

### Integración:
- [ ] PUT → GET refleja cambios
- [ ] Cambios visibles en Prisma Studio
- [ ] Múltiples PUTs consecutivos funcionan

---

## 🎯 Próximos Pasos

Una vez completado el testing manual:

1. **Documentar bugs encontrados** (si los hay)
2. **Crear tests automatizados** (Jest, Supertest)
3. **Testing de performance** (muchos candidatos)
4. **Testing de concurrencia** (múltiples PUTs simultáneos)
5. **Testing de seguridad** (SQL injection, XSS)

---

**Última actualización**: 23 de noviembre de 2025  
**Versión**: 1.0  
**Mantenedor**: Equipo Backend ATS

