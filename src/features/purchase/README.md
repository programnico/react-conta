# 🛒 Módulo de Gestión de Compras

Sistema completo para la gestión de compras empresariales implementado con Next.js, TypeScript y Material-UI.

## 📋 Características Implementadas

### ✅ Funcionalidades Principales

- **CRUD Completo**: Crear, leer, actualizar y eliminar compras
- **Gestión de Proveedores**: Selección y visualización de proveedores
- **Detalles de Compra**: Manejo de múltiples líneas de productos por compra
- **Cálculos Automáticos**: Subtotales, impuestos y totales calculados automáticamente
- **Estados de Compra**: Pendiente, Aprobada, Recibida, Cancelada
- **Paginación**: Navegación eficiente a través de grandes volúmenes de datos
- **Filtros Avanzados**: Por estado, proveedor, tipo de documento, fechas
- **Búsqueda**: Por número de documento o nombre de proveedor

### 🔧 APIs Integradas

- **GET** `/api/purchases` - Listar compras con paginación y filtros
- **POST** `/api/purchases/save` - Crear y actualizar compras (FormData)
- **DELETE** `/api/purchases/{id}` - Eliminar compras
- **GET** `/api/suppliers-all` - Obtener listado de proveedores
- **Autenticación**: Bearer token automático en todas las peticiones

### 🏗️ Arquitectura Modular

```
src/features/purchase/
├── types/index.ts           # Definiciones TypeScript
├── services/
│   └── purchaseService.ts   # Capa de servicios API
├── hooks/
│   └── usePurchases.ts      # Hook personalizado con lógica de negocio
├── components/
│   ├── PurchaseForm.tsx     # Formulario de creación/edición
│   ├── PurchasesTable.tsx   # Tabla con acciones
│   └── PurchaseFilters.tsx  # Filtros y búsqueda avanzada
└── index.ts                 # Exportaciones limpias
```

### 📊 Componentes UI

#### 1. **PurchaseForm**

- Formulario completo con validación
- Gestión dinámica de detalles de compra
- Cálculos automáticos de totales e impuestos
- Selección de proveedores
- Tipos de documento configurables

#### 2. **PurchasesTable**

- Visualización tabular con paginación
- Estados visuales con chips de colores
- Menú de acciones por fila
- Información de proveedores y usuarios
- Formateo de fechas y monedas

#### 3. **PurchaseFilters**

- Barra de búsqueda principal
- Filtros expandibles avanzados
- Filtrado por estado, proveedor, fechas
- Limpieza rápida de filtros

### 🔄 Hook personalizado `usePurchases`

```typescript
const {
  purchases, // Lista de compras
  suppliers, // Lista de proveedores
  loading, // Estados de carga
  error, // Manejo de errores
  pagination, // Información de paginación
  stats, // Estadísticas calculadas
  // Acciones
  loadPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  // Filtros y búsqueda
  setFilters,
  searchPurchases,
  filterByStatus
} = usePurchases({ autoLoad: true })
```

### 📈 Estadísticas en Tiempo Real

- Total de compras
- Compras por estado (pendientes, aprobadas, recibidas, canceladas)
- Monto total de compras
- Cálculos automáticos basados en datos actuales

### 🛡️ Validaciones y Seguridad

- Validación de formularios en frontend
- Validación de permisos de usuario
- Manejo robusto de errores
- Protección contra datos malformados
- Sanitización de inputs

### 🔐 Sistema de Permisos

- `purchases:view` - Ver compras
- `purchases:create` - Crear compras
- `purchases:edit` - Editar compras
- `purchases:delete` - Eliminar compras
- `purchases:approve` - Aprobar compras
- `purchases:receive` - Marcar como recibidas

### 🗺️ Navegación y Rutas

- Ruta principal: `/purchase`
- Integración completa con el menú de navegación
- Iconos y permisos configurados
- Breadcrumbs automáticos

### 💾 Gestión de Estado

- Hook personalizado con estado local optimizado
- Caché inteligente de datos
- Actualizaciones reactivas
- Sincronización automática con backend

### 📱 Diseño Responsivo

- Totalmente adaptable a móviles y tablets
- Grid system de Material-UI
- Componentes optimizados para touch
- Navegación mobile-friendly

## 🚀 Uso Rápido

### 1. Importar en tu página:

```typescript
import { usePurchases } from '@/features/purchase'

const MyComponent = () => {
  const { purchases, createPurchase, loading } = usePurchases({ autoLoad: true })

  // Tu lógica aquí
}
```

### 2. Usar componentes:

```typescript
import { PurchaseForm, PurchasesTable } from '@/features/purchase'

// En tu JSX
<PurchasesTable
  purchases={purchases}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### 3. Manejar datos:

```typescript
// Crear nueva compra
const newPurchase = await createPurchase({
  supplier_id: 1,
  document_number: 'F-001-123',
  purchase_date: '2025-09-28',
  // ... más datos
  details: [
    {
      description: 'Papel A4',
      quantity: 10,
      unit_price: 5.0
      // ... más detalles
    }
  ]
})
```

## 🔧 Configuración

### Variables de Entorno

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### Tipos de Documento Soportados

- `factura` - Factura
- `recibo` - Recibo
- `nota_credito` - Nota de Crédito
- `nota_debito` - Nota de Débito

### Estados de Compra

- `pending` - Pendiente
- `approved` - Aprobada
- `received` - Recibida
- `cancelled` - Cancelada

## 🧪 Características Avanzadas

### Cálculos Automáticos

- Subtotales por línea
- Impuestos configurables por producto
- Total general con impuestos
- Validaciones de consistencia

### Paginación Inteligente

- Navegación eficiente por páginas
- Mantenimiento de filtros entre páginas
- Carga bajo demanda
- Indicadores visuales de progreso

### Manejo de Errores

- Notificaciones toast automáticas
- Mensajes de error específicos
- Recuperación graceful de fallos
- Logging para debugging

## 📚 Próximas Mejoras

- [ ] Exportación a PDF/Excel
- [ ] Historial de cambios (audit trail)
- [ ] Aprobaciones workflow
- [ ] Notificaciones push
- [ ] Dashboard analítico
- [ ] Integración con inventario
- [ ] Generación automática de números

---

_Sistema desarrollado siguiendo las mejores prácticas de React, TypeScript y arquitectura modular._
