# Integración Frontend — Scoring y Detalle de Riesgo

Este documento explica cómo conectar el frontend (ruta local: `/home/fvillanueva/Escritorio/cobranzas`) con el backend para mostrar los puntajes de scoring, riesgo y el detalle de cálculo (inputs y resultado) para un cliente.

Resumen rápido:
- Endpoint para puntaje más reciente: GET /scoring/{clientId}
- Endpoint para detalle de cálculo: GET /scoring/{clientId}/detail
- Endpoint para disparar cálculo: POST /scoring/calculate/{clientId}

Checklist de cambios realizados en el backend:
- Se añadieron impresiones de trazabilidad (logs) en `ScoringService.calculateClientScore`: inputs, resultado crudo, resumen normalizado y `calculation_detail`.
- Se añadió el método `getLatestCalculationDetail(Long clientId)` que devuelve el JSON parseado del campo `calculationDetail`.
- Se añadió endpoint GET `/scoring/{clientId}/detail` en `ScoringController` para que el frontend pueda obtener directamente el detalle como JSON.

Configuración de logs recomendada (para ver impresiones en consola)

Si quieres ver las impresiones detalladas en consola (inputs y calculation_detail), habilita DEBUG para la clase `com.bankvision.scoring.application.service.ScoringService`. En `application.yml` o `logback` añade:

```yaml
logging:
  level:
    com.bankvision.scoring.application.service.ScoringService: DEBUG
    com.bankvision.scoring: INFO
```

Endpoints y payloads
---------------------

1) Obtener último score del cliente

- Método: GET
- Ruta: /scoring/{clientId}
- Roles: ADMIN, SUPERVISOR, AGENT, AUDITOR
- Respuesta: objeto `ClientScore` (JSON) con campos relevantes:
  - id
  - creditScore (Integer)
  - riskScore (BigDecimal)
  - collectionProbability (BigDecimal)
  - recommendedSegment (enum)
  - modelVersion (String)
  - calculationDetail (String JSON)
  - calculatedAt

Ejemplo (fetch):

```javascript
async function fetchLatestScore(clientId, token) {
  const res = await fetch(`/scoring/${clientId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
```

2) Obtener detalle parseado del cálculo (inputs + resultado)

- Método: GET
- Ruta: /scoring/{clientId}/detail
- Roles: ADMIN, SUPERVISOR, AGENT, AUDITOR
- Respuesta: JSON con estructura similar a:

```json
{
  "model_version": "v1.0",
  "inputs": { "client_id": 123, "days_past_due": 12, "current_balance": 45000.0, ... },
  "result": { "recommended_segment": "SEG1", "risk_level": "ALTO", "credit_score": 420, "risk_score": 0.82, "collection_probability": 0.18, ... }
}
```

Ejemplo (fetch):

```javascript
async function fetchScoreDetail(clientId, token) {
  const res = await fetch(`/scoring/${clientId}/detail`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
```

Cómo mostrar en el componente `settings` (pasos concretos)
---------------------------------------------------------

1) Identificar en el frontend el punto donde ya se consulta información del cliente dentro del feature `settings`.
   - Se asumirá que tienes `clientId` disponible.

2) Llamadas necesarias (al cargar el componente o al pulsar botón "Actualizar scoring"):
   - Llamar `GET /scoring/{clientId}` para obtener valores principales (creditScore, riskScore, recommendedSegment).
   - Llamar `GET /scoring/{clientId}/detail` para obtener inputs y explainability del resultado.

3) Mapeo de campos para UI:
   - creditScore → mostrar como número y como barra/termómetro (range 300-850, adaptar según negocio).
   - riskScore → mostrar como porcentaje (riskScore * 100).
   - collectionProbability → mostrar como probabilidad (%) y usar como indicador de seguimiento.
   - recommended_segment → etiqueta/Badge (e.g., Recuperación, Gestión, Administrativo).

4) Ejemplo de componente React (simplificado)

```jsx
import {useEffect, useState} from 'react';

function ClientScoringPanel({ clientId, token }){
  const [score, setScore] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    Promise.all([
      fetch(`/scoring/${clientId}`, { headers: { Authorization: `Bearer ${token}` }}).then(r=>r.json()),
      fetch(`/scoring/${clientId}/detail`, { headers: { Authorization: `Bearer ${token}` }}).then(r=>r.json())
    ]).then(([s,d]) => { setScore(s); setDetail(d); setLoading(false); })
      .catch(e=>{ console.error(e); setLoading(false); });
  }, [clientId]);

  if (loading) return <div>Loading scoring...</div>;
  if (!score) return <div>No score found</div>;

  return (
    <div>
      <h3>Scoring</h3>
      <div>Credit Score: {score.creditScore}</div>
      <div>Risk Score: {Number(score.riskScore).toFixed(2)}</div>
      <div>Collection Probability: {Number(score.collectionProbability).toFixed(2)}</div>
      <div>Segment: {score.recommendedSegment}</div>

      <h4>Detail</h4>
      <pre style={{whiteSpace:'pre-wrap'}}> {JSON.stringify(detail, null, 2)} </pre>
    </div>
  );
}

export default ClientScoringPanel;
```

Visualización de rangos y mapas de riesgo
-----------------------------------------

- Definir rangos del credit score en frontend (ejemplo):
  - 0-499: Malo (Rojo)
  - 500-649: Regular (Naranja)
  - 650-749: Bueno (Amarillo)
  - 750+: Excelente (Verde)

- Para `riskScore` y `collectionProbability` normaliza a 0-100% multiplicando por 100.

Validación y seguridad
----------------------

- No exponer `userId` ni otros PII en logs públicos. Los logs añadidos están en DEBUG; ajusta nivel en producción.
- El endpoint requiere Authorization Bearer token; el frontend debe pasar encabezado `Authorization`.

Pruebas y verificación
----------------------

1) En backend, activar DEBUG para `ScoringService` y ejecutar un cálculo manual via POST `/scoring/calculate/{clientId}`.
2) Observar consola: verás impresiones de inputs, raw result y calculation_detail.
3) Llamar al frontend y confirmar que los valores mostrados coinciden con los logs.

Notas finales
------------

Si quieres que el endpoint `/scoring/{clientId}/detail` devuelva sólo un subconjunto (por ejemplo: inputs + resultado limpio sin PII), puedo ajustar la estructura en una siguiente iteración.

---
Documento generado automáticamente: integración de scoring para frontend.

