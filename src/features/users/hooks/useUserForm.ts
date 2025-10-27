import { useState, useCallback, useEffect } from 'react'
import { UserFormData, UserFormErrors } from '../types'
import { USER_ROLES } from '../constants/roles'

interface UseUserFormProps {
  initialData?: Partial<UserFormData>
  onSubmit: (data: UserFormData) => Promise<void>
  apiValidationErrors?: Record<string, string[]> | null
}

export const useUserForm = ({ initialData, onSubmit, apiValidationErrors }: UseUserFormProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: initialData?.password || '',
    role: initialData?.role || USER_ROLES.USER
  })

  const [errors, setErrors] = useState<UserFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sincronizar errores de validación de la API
  useEffect(() => {
    if (apiValidationErrors) {
      const formErrors: UserFormErrors = {}

      // Mapear errores de la API a errores del formulario
      Object.entries(apiValidationErrors).forEach(([field, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          // Tomar el primer error para cada campo
          formErrors[field as keyof UserFormErrors] = fieldErrors[0]
        }
      })

      setErrors(formErrors)
    }
  }, [apiValidationErrors])

  const validateForm = useCallback((): boolean => {
    const newErrors: UserFormErrors = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido'
    }

    // Validar password (solo si no es edición o si se está cambiando)
    if (!initialData && !formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    // Validar rol
    if (!formData.role) {
      newErrors.role = 'El rol es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, initialData])

  const handleInputChange = useCallback(
    (name: keyof UserFormData, value: string) => {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))

      // Limpiar error del campo cuando el usuario empiece a escribir
      if (errors[name]) {
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
    setFormData({
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: initialData?.password || '',
      role: initialData?.role || USER_ROLES.USER
    })
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
