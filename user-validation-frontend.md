# Validación de Usuarios - Frontend

Este documento detalla las reglas de validación implementadas en el backend para el módulo de administración de usuarios. Se recomienda implementar estas mismas validaciones en el frontend para mejorar la experiencia del usuario.

## Endpoints Afectados
- `POST /api/admin/users`: Creación de usuario.
- `PUT /api/admin/users/{id}`: Actualización de usuario.

## Reglas de Validación

### 1. Nombre de Usuario (`username`)
- **Obligatorio:** Sí
- **Longitud Máxima:** 100 caracteres
- **Formato:** Texto libre (se recomienda alfanumérico).

### 2. Email (`email`)
- **Obligatorio:** Sí
- **Longitud Máxima:** 100 caracteres
- **Formato:** Debe ser un email válido (ej. `usuario@ejemplo.com`).

### 3. Contraseña (`password`)
- **Obligatorio:** Sí (solo en creación)
- **Longitud Mínima:** 12 caracteres
- **Longitud Máxima:** 255 caracteres (límite técnico)
- **Requisitos de Complejidad:**
    - Al menos una letra **mayúscula** (`A-Z`).
    - Al menos una letra **minúscula** (`a-z`).
    - Al menos un **número** (`0-9`).
    - Al menos un **carácter especial** de los siguientes: `@$!%*?&#`.
- **Expresión Regular (Regex):**
  ```regex
  ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{12,}$
  ```

### 4. Nombre Completo (`fullName`)
- **Obligatorio:** Sí
- **Longitud Máxima:** 255 caracteres
- **Restricciones:** No se permiten números ni caracteres especiales. Solo letras y espacios.
- **Expresión Regular (Regex):**
  ```regex
  ^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$
  ```

### 5. Rol (`roleId`)
- **Obligatorio:** Sí
- **Tipo:** Numérico (ID del rol obtenido desde `/api/admin/users/roles`).

### 6. Estado (`status`)
- **Obligatorio:** Sí (solo en actualización)
- **Valores Permitidos:** `ACTIVE`, `INACTIVE`, `SUSPENDED`.

---

## Manejo de Errores
Cuando una validación falla, el backend retornará un error `400 Bad Request` con el siguiente formato:

```json
{
  "timestamp": "2024-05-20T10:00:00.000",
  "status": 400,
  "error": "Validation Failed",
  "message": "Error de validación en los campos",
  "details": {
    "password": "La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial",
    "fullName": "El nombre no puede incluir números ni caracteres especiales"
  },
  "path": "/admin/users"
}
```

El objeto `details` contiene un mapa donde la clave es el nombre del campo que falló y el valor es el mensaje descriptivo del error.
