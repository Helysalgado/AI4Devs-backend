#!/bin/bash

# Script de prueba para los endpoints corregidos
# Asegúrate de que el servidor esté corriendo (npm run dev)

BASE_URL="http://localhost:3010"

echo "================================================"
echo "   PRUEBAS DE ENDPOINTS - SISTEMA ATS LTI"
echo "================================================"
echo ""

# Test 1: Endpoint básico
echo "✅ Test 1: Verificar que el servidor está corriendo"
echo "GET $BASE_URL/"
curl -s $BASE_URL/
echo -e "\n"

# Test 2: GET /positions/1/candidates
echo "================================================"
echo "✅ Test 2: GET /positions/1/candidates"
echo "GET $BASE_URL/positions/1/candidates"
echo "Respuesta:"
curl -s $BASE_URL/positions/1/candidates | jq '.'
echo ""

# Test 3: GET con position inexistente
echo "================================================"
echo "✅ Test 3: GET /positions/999/candidates (debería dar 404)"
echo "GET $BASE_URL/positions/999/candidates"
echo "Respuesta:"
curl -s $BASE_URL/positions/999/candidates | jq '.'
echo ""

# Test 4: GET con ID inválido
echo "================================================"
echo "✅ Test 4: GET /positions/abc/candidates (debería dar 400)"
echo "GET $BASE_URL/positions/abc/candidates"
echo "Respuesta:"
curl -s $BASE_URL/positions/abc/candidates | jq '.'
echo ""

# Test 5: PUT /candidates/:id/stage
echo "================================================"
echo "✅ Test 5: PUT /candidates/1/stage"
echo "PUT $BASE_URL/candidates/1/stage"
echo "Body: { positionId: 1, newInterviewStepId: 2, employeeId: 1 }"
echo "Respuesta:"
curl -s -X PUT $BASE_URL/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1,
    "newInterviewStepId": 2,
    "employeeId": 1,
    "notes": "Advancing to next stage"
  }' | jq '.'
echo ""

# Test 6: PUT sin employeeId (debería dar 400)
echo "================================================"
echo "✅ Test 6: PUT /candidates/1/stage sin employeeId (debería dar 400)"
echo "PUT $BASE_URL/candidates/1/stage"
echo "Body: { positionId: 1, newInterviewStepId: 2 } (falta employeeId)"
echo "Respuesta:"
curl -s -X PUT $BASE_URL/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{
    "positionId": 1,
    "newInterviewStepId": 2
  }' | jq '.'
echo ""

# Test 7: GET nuevamente para ver el cambio
echo "================================================"
echo "✅ Test 7: GET /positions/1/candidates (debería mostrar el cambio)"
echo "GET $BASE_URL/positions/1/candidates"
echo "Respuesta:"
curl -s $BASE_URL/positions/1/candidates | jq '.'
echo ""

echo "================================================"
echo "   PRUEBAS COMPLETADAS"
echo "================================================"

