export const ACCOUNT_TYPES = [
  { value: 'A', label: 'A - Activo' },
  { value: 'CR', label: 'CR - Depreciación' },
  { value: 'P', label: 'P - Pasivo' },
  { value: 'C', label: 'C - Capital' },
  { value: 'G', label: 'G - Gastos' },
  { value: 'I', label: 'I - Ingresos' }
] as const

export type AccountTypeValue = (typeof ACCOUNT_TYPES)[number]['value']

export const getAccountTypeLabel = (value: string): string => {
  const accountType = ACCOUNT_TYPES.find(type => type.value === value)
  return accountType?.label || value
}

export const getAccountTypeValue = (label: string): string | undefined => {
  const accountType = ACCOUNT_TYPES.find(type => type.label === label)
  return accountType?.value
}

export const isValidAccountType = (value: string): value is AccountTypeValue => {
  return ACCOUNT_TYPES.some(type => type.value === value)
}
