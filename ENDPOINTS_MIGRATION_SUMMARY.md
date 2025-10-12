# Centralización de Endpoints API - Resumen de Cambios

## ✅ Cambios Realizados

### 1. Configuración Centralizada (`src/shared/services/apiClient.ts`)

- ✅ Creado `API_CONFIG` con todos los endpoints organizados por módulos
- ✅ Mejorado el método `buildURL()` para manejar URLs relativas y absolutas
- ✅ Configuración dinámica basada en `NODE_ENV` y `NEXT_PUBLIC_API_BASE_URL`

### 2. Servicios Actualizados

#### ✅ AuthService (`src/shared/services/authService.ts`)

- ✅ Login, logout, profile, verify
- ✅ Change password
- ✅ Password reset request
- ✅ User validation (me endpoint)

#### ✅ RolesService (`src/features/admin/roles/services/rolesService.ts`)

- ✅ Get roles
- ✅ Get permissions
- ✅ Create/update role
- ✅ Delete role

#### ✅ PurchaseService (`src/features/purchase/services/purchaseService.ts`)

- ✅ List purchases with filters
- ✅ Get purchase by ID
- ✅ Create/update purchase
- ✅ Delete purchase
- ✅ Get suppliers

#### ✅ SupplierService (`src/features/supplier/services/supplierService.ts`)

- ✅ List suppliers with filters
- ✅ Create/update supplier
- ✅ Delete supplier
- ✅ Get supplier by ID

#### ✅ ProductService (`src/features/product/services/productService.ts`)

- ✅ List products with filters
- ✅ Create/update product
- ✅ Delete product
- ✅ Get product by ID

### 3. Configuración de Endpoints

```typescript
API_CONFIG = {
  BASE_URL: isDevelopment ? '/api' : process.env.NEXT_PUBLIC_API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      VERIFY: '/api/auth/verify-2fa',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      PROFILE: '/api/auth/profile',
      CHANGE_PASSWORD: '/api/auth/change-password',
      PASSWORD_RESET_REQUEST: '/api/auth/password-reset-request',
      ME: '/api/auth/me'
    },
    ADMIN: {
      ROLES: '/api/roles',
      ROLES_SAVE: '/api/roles/save',
      PERMISSIONS: '/api/permissions'
    },
    PURCHASE: {
      LIST: '/api/purchases',
      SAVE: '/api/purchases/save',
      DELETE: '/api/purchases',
      SUPPLIERS: '/api/suppliers-all'
    },
    SUPPLIERS: {
      LIST: '/api/suppliers',
      SAVE: '/api/suppliers/save',
      UPDATE: '/api/suppliers',
      DELETE: '/api/suppliers',
      DETAIL: '/api/suppliers'
    },
    PRODUCTS: {
      LIST: '/api/products',
      SAVE: '/api/products/save',
      DELETE: '/api/products',
      DETAIL: '/api/products'
    }
  }
}
```

## 🎯 Beneficios Logrados

### ✅ Flexibilidad de Despliegue

- **Desarrollo**: URLs relativas (`/api/*`) para proxy local
- **Producción**: URLs absolutas configurables via `.env.local`

### ✅ Configuración Unificada

- Un solo archivo `.env.local` controla todas las URLs
- Cambio fácil entre entornos sin tocar código
- Configuración centralizada y mantenible

### ✅ Compatibilidad

- ✅ Desarrollo: `http://localhost:3000/api/auth/login`
- ✅ Producción: `http://72.14.190.40/api/auth/login`

## 📝 Configuración de Entorno

### Para Desarrollo

```bash
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Para Producción

```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=http://72.14.190.40/api
```

## 🚀 Próximos Pasos

1. ✅ Todos los endpoints centralizados
2. ✅ Configuración de entorno lista
3. ✅ URLs funcionando en dev y producción
4. ✅ Apache2 proxy configurado

## ⚠️ Notas Importantes

- Todos los servicios ahora usan `API_CONFIG.ENDPOINTS.*`
- No más endpoints hardcodeados en el código
- BuildURL maneja automáticamente dev vs prod
- Apache2 proxy mapea ambos frontend y API correctamente

¡La centralización está completa y el proyecto funciona en ambos entornos! 🎉
