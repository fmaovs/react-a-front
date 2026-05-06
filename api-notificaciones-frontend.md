# API de Notificaciones - Guía para Frontend

Documentación completa para consumir el endpoint de envío de notificaciones multi-canal de BankVision.

---

## 📋 Resumen Ejecutivo

| Propiedad | Valor |
|-----------|-------|
| **Endpoint** | `POST /strategy/notifications/send/{channel}` |
| **Autenticación** | Bearer Token (JWT) |
| **Canales soportados** | SMS, WHATSAPP, EMAIL, PHONE |
| **Roles requeridos** | ADMIN, SUPERVISOR, AGENT |
| **Validación externa** | Ley 2300 (restricción de comunicaciones) |

---

## 🔗 Endpoint

### URL
```
POST /strategy/notifications/send/{channel}
```

### Parámetro de Ruta

| Parámetro | Tipo | Obligatorio | Valores válidos | Descripción |
|-----------|------|-------------|-----------------|-------------|
| `channel` | String | Sí | `SMS`, `WHATSAPP`, `EMAIL`, `PHONE` | Canal de envío de la notificación |

---

## 🔐 Autenticación

### Headers Requeridos

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Ejemplo
```bash
curl -X POST "http://localhost:8080/strategy/notifications/send/SMS" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 📤 Request Body

### Estructura (SendNotificationCommand)

```json
{
  "recipient": "string",
  "message": "string",
  "clientId": "number (opcional)",
  "reason": "string (opcional)"
}
```

### Campos

| Campo | Tipo | Obligatorio | Validación | Descripción |
|-------|------|-------------|-----------|-------------|
| `recipient` | String | **Sí** | Formato según canal | Destino del mensaje |
| `message` | String | **Sí** | Max 160 caracteres | Contenido del mensaje |
| `clientId` | Long | No | Número positivo | ID del cliente (para trazabilidad) |
| `reason` | String | No | Sin límite | Motivo del envío (ej: "Recordatorio de pago") |

### Validaciones por Campo

#### recipient
- **Patrón aceptado**: 
  - Números de teléfono: `\+?\\d{7,15}` (7-15 dígitos, con o sin +)
  - Emails: `^[\\w._%+\\-]+@[\\w.\\-]+\\.[a-zA-Z]{2,}$`
  
- **Ejemplos válidos por canal**:
  - SMS/WHATSAPP: `3001234567` o `+573001234567`
  - EMAIL: `cliente@banco.com`
  - PHONE: `+573001234567`

- **Error si**: 
  - Está vacío
  - No cumple el patrón
  - Menos de 7 dígitos (teléfono)

#### message
- **Máximo**: 160 caracteres
- **Obligatorio**: Sí, no puede estar vacío
- **Error si**: Está vacío o supera 160 caracteres

---

## 📥 Response

### Estructura de Éxito (HTTP 200)

```json
{
  "channel": "SMS",
  "externalId": "msg_abc123xyz",
  "status": "SENT",
  "statusDescription": "Mensaje enviado exitosamente",
  "accepted": true,
  "skippedByLey2300": false,
  "channelNotSupported": false,
  "contactAttemptId": 12345
}
```

### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `channel` | String | Canal utilizado (SMS, WHATSAPP, EMAIL, PHONE) |
| `externalId` | String | ID de seguimiento en el proveedor externo |
| `status` | String | Estado: `SENT`, `PENDING`, `FAILED`, etc. |
| `statusDescription` | String | Descripción legible del estado |
| `accepted` | Boolean | `true` si el mensaje fue aceptado para envío |
| `skippedByLey2300` | Boolean | `true` si se bloqueó por Ley 2300 (horarios/restricciones) |
| `channelNotSupported` | Boolean | `true` si el canal no tiene adaptador registrado |
| `contactAttemptId` | Long | ID del registro de intento en base de datos (para auditoría) |

---

## ⚠️ Códigos de Estado HTTP

| Código | Nombre | Descripción |
|--------|--------|-------------|
| **200** | OK | Notificación procesada (puede ser enviada, bloqueada, etc.) |
| **400** | Bad Request | Datos inválidos (recipient, message, channel) |
| **401** | Unauthorized | Sin autenticación o token inválido |
| **403** | Forbidden | Usuario sin permisos (role no autorizado) |
| **404** | Not Found | Canal no existe o cliente no encontrado |
| **500** | Internal Server Error | Error interno del servidor |

---

## 📨 Ejemplos de Uso

### 1. Envío por SMS

**Request:**
```bash
POST /strategy/notifications/send/SMS
Content-Type: application/json
Authorization: Bearer <token>

{
  "recipient": "3001234567",
  "message": "Su saldo disponible es de $5.000.000",
  "clientId": 42,
  "reason": "Notificación de saldo"
}
```

**Response (Éxito):**
```json
{
  "channel": "SMS",
  "externalId": "twilio_msg_123",
  "status": "SENT",
  "statusDescription": "SMS enviado exitosamente",
  "accepted": true,
  "skippedByLey2300": false,
  "channelNotSupported": false,
  "contactAttemptId": 5678
}
```

---

### 2. Envío por Email

**Request:**
```bash
POST /strategy/notifications/send/EMAIL
Content-Type: application/json
Authorization: Bearer <token>

{
  "recipient": "cliente@ejemplo.com",
  "message": "Le recordamos que el plazo de pago vence en 5 días",
  "clientId": 42,
  "reason": "Recordatorio de vencimiento"
}
```

**Response (Éxito):**
```json
{
  "channel": "EMAIL",
  "externalId": "sendgrid_msg_456",
  "status": "QUEUED",
  "statusDescription": "Email encolado para envío",
  "accepted": true,
  "skippedByLey2300": false,
  "channelNotSupported": false,
  "contactAttemptId": 5679
}
```

---

### 3. Envío Bloqueado por Ley 2300

**Request:**
```bash
POST /strategy/notifications/send/SMS
Content-Type: application/json
Authorization: Bearer <token>

{
  "recipient": "+573001234567",
  "message": "Recordatorio de pago",
  "clientId": 42,
  "reason": "Cobro"
}
```

**Response (Bloqueado):**
```json
{
  "channel": "SMS",
  "externalId": null,
  "status": "BLOCKED",
  "statusDescription": "Bloqueado por Ley 2300 - fuera de horario permitido",
  "accepted": false,
  "skippedByLey2300": true,
  "channelNotSupported": false,
  "contactAttemptId": 5680
}
```

---

### 4. Error de Validación

**Request:**
```bash
POST /strategy/notifications/send/SMS
Content-Type: application/json
Authorization: Bearer <token>

{
  "recipient": "123",
  "message": "Mensaje válido",
  "clientId": 42
}
```

**Response (Error 400):**
```json
{
  "timestamp": "2026-05-06T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Formato de destinatario inválido",
  "path": "/strategy/notifications/send/SMS",
  "violations": [
    {
      "field": "recipient",
      "message": "Formato de destinatario inválido"
    }
  ]
}
```

---

## 💻 Ejemplos de Implementación

### JavaScript/TypeScript (Fetch API)

```typescript
async function sendNotification(
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'PHONE',
  recipient: string,
  message: string,
  clientId?: number,
  reason?: string,
  token?: string
) {
  const url = `/strategy/notifications/send/${channel}`;
  
  const payload = {
    recipient,
    message,
    ...(clientId && { clientId }),
    ...(reason && { reason })
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error enviando notificación:', error);
    throw error;
  }
}

// Uso
const result = await sendNotification(
  'SMS',
  '3001234567',
  'Su saldo es $5.000.000',
  42,
  'Notificación de saldo',
  localStorage.getItem('jwt_token')
);

console.log('Enviado:', result.accepted);
console.log('ID de seguimiento:', result.externalId);
```

---

### React Hook

```typescript
import { useState } from 'react';

export function useNotificationApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = async (
    channel: string,
    recipient: string,
    message: string,
    clientId?: number,
    reason?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/strategy/notifications/send/${channel}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ recipient, message, clientId, reason })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendNotification, loading, error };
}

// Uso en componente
export function NotificationForm() {
  const { sendNotification, loading, error } = useNotificationApi();
  const [result, setResult] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await sendNotification(
      'SMS',
      '3001234567',
      'Mensaje de prueba',
      42,
      'Test'
    );
    setResult(result);
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar SMS'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div>
          <p>✓ Enviado: {result.accepted ? 'Sí' : 'No'}</p>
          <p>Estado: {result.statusDescription}</p>
          <p>ID de seguimiento: {result.externalId}</p>
        </div>
      )}
    </div>
  );
}
```

---

### Angular (HttpClient)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SendNotificationRequest {
  recipient: string;
  message: string;
  clientId?: number;
  reason?: string;
}

export interface NotificationDispatchResult {
  channel: string;
  externalId: string;
  status: string;
  statusDescription: string;
  accepted: boolean;
  skippedByLey2300: boolean;
  channelNotSupported: boolean;
  contactAttemptId: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = '/strategy/notifications';

  constructor(private http: HttpClient) {}

  sendNotification(
    channel: string,
    request: SendNotificationRequest
  ): Observable<NotificationDispatchResult> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<NotificationDispatchResult>(
      `${this.baseUrl}/send/${channel}`,
      request,
      { headers }
    );
  }

  // Métodos de conveniencia
  sendSMS(recipient: string, message: string, clientId?: number) {
    return this.sendNotification('SMS', { recipient, message, clientId });
  }

  sendEmail(recipient: string, message: string, clientId?: number) {
    return this.sendNotification('EMAIL', { recipient, message, clientId });
  }

  sendWhatsApp(recipient: string, message: string, clientId?: number) {
    return this.sendNotification('WHATSAPP', { recipient, message, clientId });
  }
}

// Uso en componente
@Component({...})
export class NotificationComponent {
  constructor(private notificationService: NotificationService) {}

  sendSms() {
    this.notificationService.sendSMS('3001234567', 'Hola desde Angular')
      .subscribe(
        (result) => console.log('Enviado:', result),
        (error) => console.error('Error:', error)
      );
  }
}
```

---

### Python (requests)

```python
import requests
import json

def send_notification(channel, recipient, message, client_id=None, reason=None, token=None):
    """Envía una notificación a través de BankVision"""
    
    url = f"http://localhost:8080/strategy/notifications/send/{channel}"
    
    headers = {
        "Content-Type": "application/json",
    }
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    payload = {
        "recipient": recipient,
        "message": message,
    }
    
    if client_id:
        payload["clientId"] = client_id
    
    if reason:
        payload["reason"] = reason
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()  # Lanza excepción para códigos 4xx/5xx
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        raise

# Uso
result = send_notification(
    channel="SMS",
    recipient="3001234567",
    message="Su saldo es $5.000.000",
    client_id=42,
    reason="Notificación de saldo",
    token="eyJhbGciOiJIUzI1NiI..."
)

print(f"Aceptado: {result['accepted']}")
print(f"ID externo: {result['externalId']}")
print(f"Estado: {result['statusDescription']}")
```

---

## 🔍 Guía de Resolución de Problemas

### Error: "Formato de destinatario inválido"

**Causas**:
- Número de teléfono con menos de 7 dígitos
- Email sin dominio válido
- Caracteres especiales no permitidos

**Solución**:
```javascript
// ✗ MAL
{ "recipient": "123" }
{ "recipient": "email@" }

// ✓ BIEN
{ "recipient": "3001234567" }
{ "recipient": "+573001234567" }
{ "recipient": "cliente@banco.com" }
```

---

### Error: "El mensaje no puede superar 160 caracteres"

**Causa**: Mensaje demasiado largo

**Solución**:
```javascript
const message = "Su saldo disponible es..."; // Max 160 caracteres
console.log(message.length); // Verificar antes de enviar

if (message.length > 160) {
  console.warn("Mensaje será truncado");
}
```

---

### Error 401: "Unauthorized"

**Causas**:
- Token expirado
- Token no incluido en headers
- Token inválido

**Solución**:
```javascript
// Verificar que el token esté presente
const token = localStorage.getItem('token');
if (!token) {
  // Redirigir a login
  window.location.href = '/login';
}

// Incluir en headers
headers['Authorization'] = `Bearer ${token}`;
```

---

### Error 403: "Forbidden"

**Causa**: Usuario sin rol ADMIN, SUPERVISOR o AGENT

**Solución**: Contactar administrador para asignar permisos

---

### Respuesta bloqueada por Ley 2300

**Interpretación**:
- `skippedByLey2300: true` significa que el envío fue bloqueado
- `accepted: false` el mensaje NO fue enviado
- Puede ser por horarios restringidos o restricciones normativas

**Acción**: Informar al usuario que debe reintentar en horario permitido

---

## 📊 Estados Posibles

| Estado | Descripción | Aceptado | Seguimiento |
|--------|-------------|----------|------------|
| `SENT` | Enviado exitosamente | Sí | Usar `externalId` |
| `PENDING` | En espera de envío | Sí | Usar `externalId` |
| `QUEUED` | Encolado para envío | Sí | Usar `externalId` |
| `FAILED` | Envío fallido | No | No hay seguimiento (puede reintentar) |
| `BLOCKED` | Bloqueado por restricción | No | Ver `skippedByLey2300` |
| `INVALID_CHANNEL` | Canal no soportado | No | Usar otro canal |

---

## 🔐 Consideraciones de Seguridad

### 1. Protección Ley 2300
- El sistema valida automáticamente horarios permitidos
- Se registran todos los intentos (exitosos y bloqueados)
- No es necesario validar en frontend (backend lo hace)

### 2. Auditoría
- Cada envío registra:
  - Usuario que lo dispara (`userId`)
  - Cliente destino (`clientId`)
  - Razón del envío (`reason`)
  - Resultado en base de datos (`contactAttemptId`)

### 3. PII (Información Personalmente Identificable)
- Números de teléfono se guardan en `ContactAttempt`
- Emails se guardan en `ContactAttempt`
- Implementar validación en frontend para consentimiento del usuario

---

## 📱 Canales Soportados

### SMS
- **Proveedor**: Twilio (configurable)
- **Formato receptor**: `3001234567` o `+573001234567`
- **Límite**: 160 caracteres
- **Costo**: Según contrato con proveedor

### WHATSAPP
- **Proveedor**: Twilio Business API
- **Formato receptor**: `+573001234567`
- **Límite**: 160 caracteres (recomendado)
- **Nota**: Requiere número registrado en WhatsApp Business

### EMAIL
- **Proveedor**: SendGrid (configurable)
- **Formato receptor**: `usuario@dominio.com`
- **Límite**: 160 caracteres en `message` (usar plantillas para contenido complejo)
- **Nota**: Para emails complejos, usar templates en lugar de message

### PHONE
- **Tipo**: Llamada telefónica
- **Formato receptor**: `+573001234567`
- **Nota**: Requiere configuración específica de IVR

---

## ⚙️ Configuración Recomendada en Frontend

```typescript
// Constantes
export const NOTIFICATION_CHANNELS = {
  SMS: 'SMS',
  WHATSAPP: 'WHATSAPP',
  EMAIL: 'EMAIL',
  PHONE: 'PHONE'
} as const;

export const MAX_MESSAGE_LENGTH = 160;

export const PHONE_REGEX = /^\+?\d{7,15}$/;
export const EMAIL_REGEX = /^[\w._%+\-]+@[\w.\-]+\.[a-zA-Z]{2,}$/;

// Validadores
export function validateRecipient(recipient: string, channel: string): boolean {
  if (channel === 'EMAIL') {
    return EMAIL_REGEX.test(recipient);
  }
  return PHONE_REGEX.test(recipient);
}

export function validateMessage(message: string): boolean {
  return message.length > 0 && message.length <= MAX_MESSAGE_LENGTH;
}

// Tipos
export interface NotificationPayload {
  recipient: string;
  message: string;
  clientId?: number;
  reason?: string;
}

export interface NotificationResponse {
  channel: string;
  externalId: string | null;
  status: 'SENT' | 'PENDING' | 'QUEUED' | 'FAILED' | 'BLOCKED' | 'INVALID_CHANNEL';
  statusDescription: string;
  accepted: boolean;
  skippedByLey2300: boolean;
  channelNotSupported: boolean;
  contactAttemptId: number;
}
```

---

## 📝 Checklist de Implementación

- [ ] Crear servicio API para notificaciones
- [ ] Implementar validación de `recipient` según canal
- [ ] Implementar validación de longitud de `message` (max 160)
- [ ] Agregar componente de selector de canal
- [ ] Manejar errores 400, 401, 403, 404, 500
- [ ] Mostrar `statusDescription` en UI
- [ ] Guardar/mostrar `contactAttemptId` para seguimiento
- [ ] Implementar retry para `FAILED`
- [ ] Informar al usuario si está `BLOCKED` (Ley 2300)
- [ ] Agregar indicador de carga mientras se envía
- [ ] Registrar auditoría local con `reason` y `clientId`
- [ ] Pruebas unitarias de validación
- [ ] Pruebas de integración con API

---

## 📞 Soporte y Contacto

Para problemas o dudas:
1. Revisar logs del backend: `/logs/bankvision.log`
2. Verificar configuración de proveedores (Twilio, SendGrid)
3. Contactar al equipo backend si el error es HTTP 500

---

**Última actualización**: 2026-05-06  
**Versión API**: 1.0  
**Estado**: ✅ Producción

