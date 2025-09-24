# 🏗️ Arquitectura Escalable - Estructura Modular

## 📁 Nueva Estructura del Proyecto

```
src/
├── features/                    # 🎯 Módulos de negocio independientes
│   └── general/                # Módulo General (catálogos, configuraciones)
│       └── unit-merge/        # Feature: Unit Merge CRUD
│           ├── components/    # Componentes específicos del feature
│           ├── hooks/        # Hooks personalizados del feature
│           ├── services/     # Servicios API del feature
│           ├── store/        # Estado Redux específico (futuro)
│           └── types/        # Tipos TypeScript del feature
│
├── shared/                     # 🔧 Código compartido entre módulos
│   ├── components/           # Componentes reutilizables
│   ├── hooks/               # Hooks genéricos (useCrud, useApi, etc.)
│   ├── services/            # Servicios base (apiClient, authService)
│   ├── store/              # Estado global (auth, ui, notifications)
│   ├── types/              # Tipos compartidos
│   └── config/             # Configuraciones globales
│
└── app/                       # 🛣️ Next.js App Router
    └── (modules)/           # Rutas modulares
        └── general/
            └── catalogs/
                └── unit-merge/page.tsx
```

## 🔄 Patrones Implementados

### 1. **Generic CRUD Service Pattern**

```typescript
// shared/services/BaseCrudService.ts
export abstract class BaseCrudService<T, CreateT, UpdateT> {
  protected abstract endpoint: string

  async getAll(filters?: any): Promise<T[]>
  async getById(id: string | number): Promise<T>
  async create(data: CreateT): Promise<T>
  async update(id: string | number, data: UpdateT): Promise<T>
  async delete(id: string | number): Promise<void>
}
```

### 2. **Generic CRUD Hook Pattern**

```typescript
// shared/hooks/useCrud.ts
export function useCrud<T, CreateT, UpdateT>(
  service: BaseCrudService<T, CreateT, UpdateT>
): CrudHookResult<T, CreateT, UpdateT>
```

### 3. **Centralized API Client**

```typescript
// shared/services/apiClient.ts
export const apiClient = new ApiClient({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000
})
```

## 📋 Ejemplo de Implementación: Unit Merge

### Service Layer

```typescript
// features/general/unit-merge/services/unitMergeService.ts
class UnitMergeService extends BaseCrudService<UnitMerge, CreateUnitMergeRequest, UpdateUnitMergeRequest> {
  protected endpoint = '/pei/unit-merge'

  constructor() {
    super({ useFormData: true })
  }
}
```

### Hook Layer

```typescript
// features/general/unit-merge/hooks/useUnitMerge.ts
export const useUnitMerge = (options?) => {
  const crud = useCrud(unitMergeService, options)

  return {
    ...crud,
    // Domain-specific helpers
    activeItems: crud.data.filter(item => item.status === 'active'),
    searchByName: query => unitMergeService.searchByName(query)
  }
}
```

### Page Component

```typescript
// app/(modules)/general/catalogs/unit-merge/page.tsx
const UnitMergePage = () => {
  const { items, isLoading, createItem, updateItem, deleteItem } = useUnitMerge({ autoLoad: true })

  // Component logic...
}
```

## 🚀 Beneficios de la Nueva Arquitectura

### ✅ **Escalabilidad**

- Cada módulo es independiente
- Fácil agregar nuevos CRUDs
- Code splitting automático por módulo

### ✅ **Mantenibilidad**

- Código organizado por dominio de negocio
- Separación clara de responsabilidades
- Fácil localizar y modificar funcionalidades

### ✅ **Reutilización**

- Servicios genéricos CRUD
- Hooks compartidos
- Componentes reutilizables

### ✅ **Type Safety**

- TypeScript end-to-end
- Tipos específicos por feature
- Validación en tiempo de compilación

### ✅ **Performance**

- Lazy loading de módulos
- Chunks separados por feature
- Cache inteligente de datos

## 🛠️ Cómo Agregar un Nuevo CRUD

### 1. Crear la estructura del feature

```bash
src/features/[module]/[feature]/
  ├── types/index.ts
  ├── services/[feature]Service.ts
  ├── hooks/use[Feature].ts
  └── components/ (opcional)
```

### 2. Implementar el service

```typescript
class NewFeatureService extends BaseCrudService<Entity, CreateEntity, UpdateEntity> {
  protected endpoint = '/api/new-feature'
}
```

### 3. Crear el hook

```typescript
export const useNewFeature = () => {
  return useCrud(newFeatureService, { autoLoad: true })
}
```

### 4. Crear la página

```typescript
const NewFeaturePage = () => {
  const { items, createItem, updateItem, deleteItem } = useNewFeature()
  // UI implementation...
}
```

## 🎯 Próximos Pasos

1. **Migrar UnitMerge Redux** → Hook-based (completado)
2. **Agregar módulos Purchase, Accounting, Administration**
3. **Implementar cache strategies**
4. **Agregar validaciones con Zod**
5. **Implementar testing utilities**
6. **Documentar APIs con OpenAPI**

## 📚 Recursos

- [Next.js App Router](https://nextjs.org/docs/app)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Material-UI](https://mui.com/)
- [TypeScript](https://www.typescriptlang.org/)
