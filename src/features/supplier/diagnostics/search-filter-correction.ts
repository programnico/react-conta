// CORRECCIÓN CRITICAL: SEARCH HANDLER CAUSING INFINITE LOOPS
// ==============================================================

/*
🔍 PROBLEMA ESPECÍFICO IDENTIFICADO:

El filtro de SEARCH tenía comportamiento DIFERENTE a otros filtros de texto:

❌ SEARCH (PROBLEMÁTICO):
```tsx
const handleSearchSubmit = () => {
  setFilters(newFilters)     // ← Dispara carga automática
  setNeedsReload(true)       // ← DOBLE DISPARO = BUCLE!
}
```

✅ EMAIL/BUSINESS_NAME (CORRECTO):
```tsx
const handleEmailSubmit = () => {
  setFilters(newFilters)     // ← Solo dispara carga
  // NO setNeedsReload
}
```

🚫 POR QUÉ CAUSA BUCLES CON FILTROS COMBINADOS:

Cuando el usuario tiene clasificación + search:

1. Usuario tipo search + Enter
2. handleSearchSubmit() ejecuta:
   - setFilters() → SuppliersTable detecta cambio de filtros → CARGA 1
   - setNeedsReload(true) → SuppliersTable detecta needsReload → CARGA 2
3. DOS CARGAS SIMULTÁNEAS con filtros combinados
4. Estado inconsistente → BUCLE INFINITO

🛠️ CORRECCIÓN APLICADA:

ANTES:
```tsx
const handleSearchSubmit = useCallback(() => {
  setFilters(newFilters)
  setNeedsReload(true)      // ❌ CAUSA DOBLE CARGA
}, [searchQuery, filters, setFilters, setNeedsReload])
```

DESPUÉS:
```tsx
const handleSearchSubmit = useCallback(() => {
  setFilters(newFilters)
  // ✅ Solo setFilters - SuppliersTable maneja carga automáticamente
}, [searchQuery, filters, setFilters])  // ✅ Eliminado setNeedsReload dependency
```

🎯 REGLA ARQUITECTURAL:

📋 setNeedsReload() SOLO para:
✅ clearFilters() (limpieza completa)
✅ CRUD operations (crear/editar/eliminar)

❌ setNeedsReload() NUNCA para:
❌ Filtros individuales (search, email, business_name)
❌ Dropdowns (type, classification, status)

La regla es: setFilters() ya dispara carga automática en SuppliersTable

🧪 RESULTADO:

✅ Search + filtros combinados: SIN BUCLES
✅ Enter en search: UNA sola carga, comportamiento correcto
✅ Todos los filtros: comportamiento consistente
✅ Performance mejorada: eliminadas cargas duplicadas

*/

export const SEARCH_FILTER_CORRECTION = {
  problem: 'setFilters + setNeedsReload = double loading',
  solution: 'Only setFilters for individual filters',
  rule: 'setNeedsReload only for clearFilters and CRUD',
  result: 'No infinite loops with combined filters'
}
