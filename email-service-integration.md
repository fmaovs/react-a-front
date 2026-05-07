# Integración de Servicio de Email - BankVision

Este documento describe la implementación y el funcionamiento del servicio de envío de correos electrónicos en el backend de BankVision, conectando con la API corporativa.

## Configuración

El servicio requiere las siguientes variables de entorno:

- `EMAIL_SERVICE_TOKEN`: Token de autenticación Bearer para la API de email.

En `application.yml` se encuentra la configuración base:

```yaml
email:
  base-url: https://pruebas.bankvision.com/email-service/email/sendEmailWithTemplateHtml
  token: ${EMAIL_SERVICE_TOKEN}
```

## Funcionamiento del Adaptador

La clase `EmailNotificationAdapter` implementa la interfaz `NotificationChannel`, lo que permite que sea registrada automáticamente por el orquestador `NotificationDispatchService`.

### Selección de Plantilla

El adaptador selecciona automáticamente la plantilla basada en el nivel de riesgo del cliente:

- **Riesgo ALTO**: Se utiliza la plantilla `COBRANZA_PREVENTIVA_ALTA_BVS`.
- **Riesgo MEDIO (y otros)**: Se utiliza la plantilla `COBRANZA_PREVENTIVA_BVS`.

### Mapeo de Datos

El adaptador extrae información del cliente y de la obligación para poblar el objeto `data` requerido por la API externa:

- `nombre_cliente`: Nombre completo del cliente.
- `numero_obligacion`: Número de la obligación.
- `valor_obligacion`: Saldo total formateado (ej: $1.250.000).
- `fecha_vencimiento`: Fecha de vencimiento original formateada (ej: 15 de mayo de 2026).
- `dias_mora`: Días de mora actuales.
- `link_pago`: Enlace de pago generado (se recibe a través de los metadatos de la notificación).
- `empresa`: "BankVision S.A."
- `anio`: Año actual.

## Implementación en Otros Servicios

Para utilizar el envío de email desde un nuevo servicio en el backend:

1. Inyectar `NotificationDispatchService`.
2. Llamar al método `dispatch` con el canal `EMAIL`.

```java
notificationDispatchService.dispatch(
    ContactAttempt.ContactMethod.EMAIL,
    SendNotificationCommand.builder()
        .recipient("correo@cliente.com")
        .message("Mensaje de texto opcional")
        .clientId(clienteId)
        .obligationId(obligacionId)
        .reason("MOTIVO_ENVIO")
        .metadata(Map.of("link_pago", "https://enlace-pago.com"))
        .userId(usuarioId)
        .build()
);
```

## Integración con Frontend

Para disparar envíos desde el frontend, se debe utilizar el endpoint de cobranza preventiva o cualquier otro endpoint que haga uso del orquestador de notificaciones, asegurándose de enviar el canal `EMAIL`.

**Ejemplo de cURL para prueba manual:**

```bash
curl --request POST \
 --url https://pruebas.bankvision.com/email-service/email/sendEmailWithTemplateHtml \
 --header 'authorization: Bearer {token}' \
 --header 'content-type: application/json' \
 --data '{
 "message": "Envío de notificación de pago",
 "asunto": "Notificación de obligación pendiente - BankVision",
 "email": "mquintero@bankvision.com.co",
 "template": "COBRANZA_PREVENTIVA_BVS",
 "data": {
 "nombre_cliente": "Carolina Martha",
 "numero_obligacion": "987654321",
 "valor_obligacion": "$1.250.000",
 "fecha_vencimiento": "15 de mayo de 2026",
 "dias_mora": "12",
 "link_pago": "https://www.google.com/",
 "empresa": "BankVision S.A.",
 "anio": "2026"
 }
 }'
```
