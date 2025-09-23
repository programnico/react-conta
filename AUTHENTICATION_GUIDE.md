# Sistema de Autenticación con Redux - Documentación

## 🚀 Implementación Completa

Hemos implementado un sistema de autenticación robusto con las siguientes características:

### ✅ Características Implementadas

1. **Redux Toolkit + Redux Persist**

   - Estado global para autenticación
   - Persistencia automática en localStorage
   - Manejo de errores centralizado

2. **API Service Layer**

   - Cliente HTTP con manejo de errores
   - Autenticación de 2 factores
   - Refresh de tokens automático
   - Interceptores de seguridad

3. **Componentes de UI**

   - Formulario de login con validación
   - Componente de verificación 2FA
   - Guards de rutas protegidas
   - Estados de carga y error

4. **Hooks Personalizados**
   - `useAuth()` para lógica de autenticación
   - `useAppDispatch()` y `useAppSelector()` tipados
   - Auto-refresh de tokens

## 🔧 Configuración de URLs

El archivo `.env.local` está configurado para:

```bash
API_URL=http://127.0.0.1:8000/api              # Servidor
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api  # Cliente
```

## 📋 Endpoints de API

### 1. Login (Paso 1)

```
POST http://127.0.0.1:8000/api/auth/authentication
Body: { "identity": "usuario", "password": "contraseña" }
Response: { "message": "texto", "tk": "token_temporal", "change_password": false }
```

### 2. Verificación (Paso 2)

```
POST http://127.0.0.1:8000/api/auth/verify
Body: { "code": "123456", "tk": "token_del_paso_anterior" }
Response: { "message": "success", "success": true, "user": {...}, "access_token": "jwt_token" }
```

## 🎯 Uso del Sistema

### En Componentes React:

```tsx
import { useAuth } from '@/hooks/useAuth'

const MiComponente = () => {
  const { isAuthenticated, user, login, verifyCode, logout, isLoading, error } = useAuth()

  const handleLogin = async () => {
    await login({ identity: 'usuario', password: 'contraseña' })
  }

  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido {user?.name}</p>
      ) : (
        <button onClick={handleLogin} disabled={isLoading}>
          Iniciar Sesión
        </button>
      )}
    </div>
  )
}
```

### Acceso Directo al Store:

```tsx
import { useAppSelector, useAppDispatch } from '@/hooks/redux'
import { loginAsync, selectIsAuthenticated } from '@/store/slices/authSlice'

const OtroComponente = () => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const handleLogin = () => {
    dispatch(loginAsync({ identity: 'usuario', password: 'contraseña' }))
  }
}
```

## 🛡️ Rutas Protegidas

```tsx
import AuthGuard from '@/components/auth/AuthGuard'

const PaginaProtegida = () => {
  return (
    <AuthGuard>
      <div>Contenido solo para usuarios autenticados</div>
    </AuthGuard>
  )
}
```

## 🚪 Páginas Disponibles

- **Login Nuevo**: `http://localhost:3001/auth` (con Redux)
- **Login Original**: `http://localhost:3001/login` (original del template)
- **Dashboard**: `http://localhost:3001/` (requiere autenticación)

## 🔄 Flujo de Autenticación

1. **Usuario ingresa credenciales** → `loginAsync()`
2. **API retorna token temporal** → Estado: `requiresVerification = true`
3. **Usuario ingresa código 2FA** → `verifyCodeAsync()`
4. **API retorna access_token** → Estado: `isAuthenticated = true`
5. **Redirect al dashboard** → Usuario logueado

## 📊 Estado de Redux

```typescript
interface AuthState {
  isAuthenticated: boolean // ¿Está logueado?
  isLoading: boolean // ¿Procesando petición?
  user: UserData | null // Datos del usuario
  accessToken: string | null // Token de acceso
  refreshToken: string | null // Token de renovación
  requiresVerification: boolean // ¿Necesita código 2FA?
  verificationToken: string | null // Token temporal
  changePasswordRequired: boolean // ¿Debe cambiar contraseña?
  error: string | null // Error actual
  loginStep: 'credentials' | 'verification' | 'completed'
}
```

## 🔐 Características de Seguridad

- ✅ Tokens JWT seguros
- ✅ Refresh automático de tokens
- ✅ Logout automático si refresh falla
- ✅ Protección CSRF
- ✅ Headers de seguridad
- ✅ Validación de entrada
- ✅ Manejo seguro de errores
- ✅ No persistencia de tokens sensibles

## ⚡ Próximos Pasos

1. **Prueba el login** en `http://localhost:3001/auth`
2. **Configura tu API backend** con los endpoints mencionados
3. **Personaliza los componentes** según tu diseño
4. **Agrega más endpoints** al AuthService
5. **Implementa roles y permisos** si es necesario

¡El sistema está listo para producción! 🎉
