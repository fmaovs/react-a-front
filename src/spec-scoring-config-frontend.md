# Especificacion API Scoring Parametrizable (Frontend)

Este documento describe los flujos, endpoints y payloads para configurar el motor de scoring y consumir el flujo automatico luego del cargue batch.

Base URL
- /api

Autenticacion
- Bearer Token (Authorization: Bearer <token>)

## Flujo principal (operativo)
1) Configurar modelo, variables, rangos, umbrales e intensidad
2) Cargar batch CSV en /integration/batches/csv/upload
3) El backend procesa: staging -> validacion -> promocion -> scoring automatico
4) Consultar scores y decisiones de cobranza

## 1) Carga batch CSV
Endpoint
- POST /integration/batches/csv/upload

Content-Type
- multipart/form-data

Parametro
- file: archivo CSV

Formato CSV (obligatorio)
Linea 1: fecha,consecutivo,cantidad,lote
Linea 2: 2024-04-24,CONS-2024-042,2,LOTE-ABRIL-2024-001
Linea 3: document_type,document_number,client_name,obligation_id,obligation_amount,due_date,days_past_due,currency,mobile,email
Lineas 4+: CC,1023456789,Juan Perez,OBL-001,4500000.00,2024-03-01,54,COP,3001234567,juan@example.com

Respuesta 200 (ejemplo)
{
  "batchId": 12,
  "batchNumber": "BATCH-AB12CD34",
  "lote": "LOTE-ABRIL-2024-001",
  "status": "COMPLETED",
  "totalRecords": 2,
  "stagedRecords": 2,
  "validRecords": 2,
  "failedRecords": 0,
  "clientsUpserted": 2,
  "obligationsUpserted": 2,
  "casesCreated": 2,
  "scoresGenerated": 2,
  "scoresFailed": 0,
  "rowErrors": [],
  "message": "Lote procesado exitosamente"
}

Errores comunes
- 422: validacion fallida (rowErrors)
- 400: archivo vacio o invalido

## 2) Configuracion de modelo de scoring

### 2.1 Obtener modelo activo
GET /scoring/config/models/active

Respuesta 200
{
  "modelVersion": "v1.0",
  "description": "Modelo base de scoring prejuridico",
  "weightPaymentHistory": 0.35,
  "weightDaysPastDue": 0.30,
  "weightDefaultFrequency": 0.20,
  "weightSeniority": 0.15,
  "maxDaysPastDueRef": 360,
  "maxSeniorityDaysRef": 3650,
  "neutralBaseScore": 500,
  "isActive": true
}

### 2.2 Actualizar pesos y parametros del modelo
PUT /scoring/config/models/active/weights

Payload (ejemplo)
{
  "weightPaymentHistory": 0.35,
  "weightDaysPastDue": 0.30,
  "weightDefaultFrequency": 0.20,
  "weightSeniority": 0.15,
  "maxDaysPastDueRef": 360,
  "maxSeniorityDaysRef": 3650,
  "neutralBaseScore": 500,
  "description": "Modelo base"
}

## 3) Variables de scoring (parametrizables)

### 3.1 Obtener variables activas
GET /scoring/config/models/active/variables

Respuesta 200 (ejemplo)
[
  { "variableKey": "DAYS_PAST_DUE", "label": "Dias de mora", "weight": 0.40, "active": true },
  { "variableKey": "AMOUNT_DUE", "label": "Monto exigible", "weight": 0.20, "active": true },
  { "variableKey": "SENIORITY_MONTHS", "label": "Antiguedad", "weight": 0.10, "active": true },
  { "variableKey": "DEFAULT_FREQUENCY", "label": "Frecuencia mora", "weight": 0.10, "active": true },
  { "variableKey": "CONTACTABILITY", "label": "Ubicabilidad", "weight": 0.10, "active": true },
  { "variableKey": "BROKEN_PROMISES", "label": "Promesas incumplidas", "weight": 0.10, "active": true }
]

### 3.2 Actualizar variables
PUT /scoring/config/models/{version}/variables

Payload (ejemplo)
[
  { "variableKey": "DAYS_PAST_DUE", "label": "Dias de mora", "weight": 0.45, "active": true },
  { "variableKey": "AMOUNT_DUE", "label": "Monto exigible", "weight": 0.20, "active": true },
  { "variableKey": "SENIORITY_MONTHS", "label": "Antiguedad", "weight": 0.10, "active": true },
  { "variableKey": "DEFAULT_FREQUENCY", "label": "Frecuencia mora", "weight": 0.10, "active": true },
  { "variableKey": "CONTACTABILITY", "label": "Ubicabilidad", "weight": 0.10, "active": true },
  { "variableKey": "BROKEN_PROMISES", "label": "Promesas incumplidas", "weight": 0.05, "active": true }
]

Regla: la suma de pesos de variables activas debe ser 1.0

## 4) Rangos por variable

### 4.1 Obtener rangos
GET /scoring/config/models/{version}/variables/{key}/ranges

### 4.2 Actualizar rangos
PUT /scoring/config/models/{version}/variables/{key}/ranges

Payload (ejemplo)
[
  { "minValue": 31, "maxValue": 60, "baseScore": 400 },
  { "minValue": 61, "maxValue": 90, "baseScore": 800 },
  { "minValue": 91, "maxValue": 9999, "baseScore": 1000 }
]

## 5) Umbrales de riesgo (score -> nivel)

GET /scoring/config/models/{version}/thresholds
PUT /scoring/config/models/{version}/thresholds

Payload (ejemplo)
[
  { "riskLevel": "BAJO", "minScore": 0, "maxScore": 350 },
  { "riskLevel": "MEDIO", "minScore": 351, "maxScore": 700 },
  { "riskLevel": "ALTO", "minScore": 701, "maxScore": 1000 }
]

## 6) Politicas de intensidad

GET /scoring/config/models/{version}/intensity-policies
PUT /scoring/config/models/{version}/intensity-policies

Payload (ejemplo)
[
  {
    "riskLevel": "BAJO",
    "intensityLabel": "BAJA",
    "smsPerWeek": 1,
    "emailEveryDays": 14,
    "callsPerWeek": 0,
    "whatsappPerWeek": 0,
    "physicalNotice": false,
    "contactReferences": false,
    "notes": "1 SMS semanal, 1 email quincenal"
  }
]

## 7) Segmentacion por dias de mora (reglas de segmento)

GET /scoring/workflow-config/segment-rules
PUT /scoring/workflow-config/segment-rules/{version}

Payload (ejemplo)
[
  { "minDays": 0, "maxDays": 30, "segment": "PREVENTIVA", "casePriority": "LOW", "label": "Al dia" },
  { "minDays": 31, "maxDays": 90, "segment": "ADMINISTRATIVA", "casePriority": "MEDIUM", "label": "Mora temprana" },
  { "minDays": 91, "maxDays": 180, "segment": "PREJUDICIAL", "casePriority": "HIGH", "label": "Mora avanzada" },
  { "minDays": 181, "maxDays": null, "segment": "PREJUDICIAL", "casePriority": "URGENT", "label": "Mora crítica prejurídica" }
]

## 8) Configuracion de workflow (umbrales de decision)

GET /scoring/workflow-config
PUT /scoring/workflow-config

Payload (ejemplo)
{
  "modelVersion": "v1.0",
  "isActive": true,
  "escalateDaysPastDue": 90,
  "paymentLinkMinDpd": 1,
  "riskEscalationThreshold": 0.75,
  "riskPaymentThreshold": 0.40,
  "contactWindowStart": 8,
  "contactWindowEnd": 20,
  "maxDailyContacts": 3,
  "fallbackCreditScore": 650,
  "fallbackRiskScore": 0.5,
  "fallbackCollectionProbability": 0.6
}

## 9) Scoring y resultados

### Calcular score (por cliente)
POST /scoring/{clientId}/calculate

### Consultar score actual
GET /scoring/{clientId}

### Historial de scores
GET /scoring/{clientId}/history

### Scoring masivo por batch
POST /scoring/batch/{batchId}/calculate

## 10) Notas de fallback IA
- Si no hay datos para una variable, se usa neutralBaseScore (opcion B).
- El detalle de calculo se devuelve en calculation_detail (JSON).

