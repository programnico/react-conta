import { useState, useCallback, useEffect } from 'react'
import type { CreateChartOfAccountRequest } from '../types'

interface ChartOfAccountFormErrors {
  account_code?: string
  account_name?: string
  account_type?: string
  level?: string
  description?: string
}

interface UseChartOfAccountFormProps {
  initialData?: Partial<CreateChartOfAccountRequest>
  onSubmit: (data: CreateChartOfAccountRequest) => Promise<void>
  apiValidationErrors?: Record<string, string[]> | null
}

export const useChartOfAccountForm = ({ initialData, onSubmit, apiValidationErrors }: UseChartOfAccountFormProps) => {
  const [formData, setFormData] = useState<CreateChartOfAccountRequest>({
    account_code: initialData?.account_code || '',
    account_name: initialData?.account_name || '',
    account_type: initialData?.account_type || '',
    level: initialData?.level || '1',
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    description: initialData?.description || ''
  })

  const [errors, setErrors] = useState<ChartOfAccountFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sincronizar errores de validación de la API
  useEffect(() => {
    if (apiValidationErrors) {
      const formErrors: ChartOfAccountFormErrors = {}

      // Mapear errores de la API a errores del formulario
      Object.entries(apiValidationErrors).forEach(([field, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          // Tomar el primer error para cada campo
          formErrors[field as keyof ChartOfAccountFormErrors] = fieldErrors[0]
        }
      })

      setErrors(formErrors)
    }
  }, [apiValidationErrors])

  // Sincronizar formData con initialData cuando cambie
  useEffect(() => {
    if (initialData) {
      setFormData({
        account_code: initialData.account_code || '',
        account_name: initialData.account_name || '',
        account_type: initialData.account_type || '',
        level: initialData.level || '1',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        description: initialData.description || ''
      })
    } else {
      // Reset form cuando no hay initialData (modo create)
      setFormData({
        account_code: '',
        account_name: '',
        account_type: '',
        level: '1',
        is_active: true,
        description: ''
      })
    }
  }, [
    initialData?.account_code,
    initialData?.account_name,
    initialData?.account_type,
    initialData?.level,
    initialData?.is_active,
    initialData?.description
  ])

  const validateForm = useCallback((): boolean => {
    const newErrors: ChartOfAccountFormErrors = {}

    // Validar código de cuenta
    if (!formData.account_code.trim()) {
      newErrors.account_code = 'El código de cuenta es requerido'
    } else if (formData.account_code.length < 2) {
      newErrors.account_code = 'El código debe tener al menos 2 caracteres'
    } else if (formData.account_code.length > 20) {
      newErrors.account_code = 'El código no puede exceder 20 caracteres'
    }

    // Validar nombre de cuenta
    if (!formData.account_name.trim()) {
      newErrors.account_name = 'El nombre de cuenta es requerido'
    } else if (formData.account_name.length < 2) {
      newErrors.account_name = 'El nombre debe tener al menos 2 caracteres'
    } else if (formData.account_name.length > 100) {
      newErrors.account_name = 'El nombre no puede exceder 100 caracteres'
    }

    // Validar tipo de cuenta
    if (!formData.account_type.trim()) {
      newErrors.account_type = 'El tipo de cuenta es requerido'
    }

    // Validar nivel
    if (!formData.level.trim()) {
      newErrors.level = 'El nivel es requerido'
    }

    // Validar descripción (opcional pero con límite)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleInputChange = useCallback(
    (name: keyof CreateChartOfAccountRequest, value: string | number | boolean) => {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))

      // Limpiar error del campo cuando el usuario empiece a escribir
      if (errors[name as keyof ChartOfAccountFormErrors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined
        }))
      }
    },
    [errors]
  )

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault()
      }

      if (!validateForm()) {
        return
      }

      setIsSubmitting(true)
      try {
        await onSubmit(formData)
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validateForm, onSubmit]
  )

  const resetForm = useCallback(() => {
    if (initialData) {
      // Modo edit: resetear con datos iniciales
      setFormData({
        account_code: initialData.account_code || '',
        account_name: initialData.account_name || '',
        account_type: initialData.account_type || '',
        level: initialData.level || '1',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        description: initialData.description || ''
      })
    } else {
      // Modo create: resetear con valores vacíos/por defecto
      setFormData({
        account_code: '',
        account_name: '',
        account_type: '',
        level: '1',
        is_active: true,
        description: ''
      })
    }
    setErrors({})
  }, [initialData])

  return {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    resetForm,
    setFormData
  }
}
