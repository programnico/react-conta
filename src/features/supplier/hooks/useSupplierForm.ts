import { useState, useCallback, useEffect } from 'react'
import type { CreateSupplierRequest } from '../types'

interface SupplierFormErrors {
  business_name?: string
  name?: string
  type?: string
  classification?: string
  tax_id?: string
  email?: string
  phone?: string
  address?: string
  registration_number?: string
  business_activity?: string
}

interface UseSupplierFormProps {
  initialData?: Partial<CreateSupplierRequest>
  onSubmit: (data: CreateSupplierRequest) => Promise<void>
  apiValidationErrors?: Record<string, string[]> | null
}

export const useSupplierForm = ({ initialData, onSubmit, apiValidationErrors }: UseSupplierFormProps) => {
  const [formData, setFormData] = useState<CreateSupplierRequest>({
    business_name: initialData?.business_name || '',
    name: initialData?.name || '',
    type: initialData?.type || 'local',
    classification: initialData?.classification || 'none',
    tax_id: initialData?.tax_id || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    registration_number: initialData?.registration_number || '',
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true
  })

  const [errors, setErrors] = useState<SupplierFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sincronizar errores de validación de la API
  useEffect(() => {
    if (apiValidationErrors) {
      const formErrors: SupplierFormErrors = {}

      // Mapear errores de la API a errores del formulario
      Object.entries(apiValidationErrors).forEach(([field, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          // Tomar el primer error para cada campo
          formErrors[field as keyof SupplierFormErrors] = fieldErrors[0]
        }
      })

      setErrors(formErrors)
    }
  }, [apiValidationErrors])

  // Sincronizar formData con initialData cuando cambie
  useEffect(() => {
    if (initialData) {
      setFormData({
        business_name: initialData.business_name || '',
        name: initialData.name || '',
        type: initialData.type || 'local',
        classification: initialData.classification || 'none',
        tax_id: initialData.tax_id || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        registration_number: initialData.registration_number || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      })
    } else {
      // Reset form cuando no hay initialData (modo create)
      setFormData({
        business_name: '',
        name: '',
        type: 'local',
        classification: 'none',
        tax_id: '',
        email: '',
        phone: '',
        address: '',
        registration_number: '',
        is_active: true
      })
    }
  }, [
    initialData?.business_name,
    initialData?.name,
    initialData?.type,
    initialData?.classification,
    initialData?.tax_id,
    initialData?.email,
    initialData?.phone,
    initialData?.address,
    initialData?.registration_number,
    initialData?.is_active
  ])

  const validateForm = useCallback((): boolean => {
    const newErrors: SupplierFormErrors = {}

    // Validar razón social
    if (!formData.business_name.trim()) {
      newErrors.business_name = 'La razón social es requerida'
    } else if (formData.business_name.length < 2) {
      newErrors.business_name = 'La razón social debe tener al menos 2 caracteres'
    } else if (formData.business_name.length > 255) {
      newErrors.business_name = 'La razón social no puede exceder 255 caracteres'
    }

    // Validar tipo
    if (!['local', 'foreign'].includes(formData.type)) {
      newErrors.type = 'Tipo inválido'
    }

    // Validar clasificación
    if (!['none', 'small', 'medium', 'large', 'other'].includes(formData.classification)) {
      newErrors.classification = 'Clasificación inválida'
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email inválido'
      }
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    } else if (formData.phone.length > 20) {
      newErrors.phone = 'El teléfono no puede exceder 20 caracteres'
    }

    // Validar dirección
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida'
    } else if (formData.address.length > 500) {
      newErrors.address = 'La dirección no puede exceder 500 caracteres'
    }

    // Validar tax_id (opcional pero con límite)
    if (formData.tax_id && formData.tax_id.length > 50) {
      newErrors.tax_id = 'El identificador fiscal no puede exceder 50 caracteres'
    }

    // Validar nombre (opcional pero con límites)
    if (formData.name && formData.name.length > 255) {
      newErrors.name = 'El nombre no puede exceder 255 caracteres'
    }

    // Validar número de registro (opcional pero con límite)
    if (formData.registration_number && formData.registration_number.length > 100) {
      newErrors.registration_number = 'El número de registro no puede exceder 100 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleInputChange = useCallback(
    (name: keyof CreateSupplierRequest, value: string | boolean) => {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))

      // Limpiar error del campo cuando el usuario empiece a escribir
      if (errors[name as keyof SupplierFormErrors]) {
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
        business_name: initialData.business_name || '',
        name: initialData.name || '',
        type: initialData.type || 'local',
        classification: initialData.classification || 'none',
        tax_id: initialData.tax_id || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        registration_number: initialData.registration_number || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      })
    } else {
      // Modo create: resetear con valores vacíos/por defecto
      setFormData({
        business_name: '',
        name: '',
        type: 'local',
        classification: 'none',
        tax_id: '',
        email: '',
        phone: '',
        address: '',
        registration_number: '',
        is_active: true
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
