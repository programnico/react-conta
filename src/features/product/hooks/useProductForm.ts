import { useState, useCallback, useEffect } from 'react'
import type { CreateProductRequest } from '../types'

interface ProductFormErrors {
  name?: string
  product_code?: string
  category?: string
  stock_quantity?: string
  selling_price?: string
  cost_price?: string
  description?: string
  image_url?: string
}

interface UseProductFormProps {
  initialData?: Partial<CreateProductRequest>
  onSubmit: (data: CreateProductRequest) => Promise<void>
  apiValidationErrors?: Record<string, string[]> | null
}

export const useProductForm = ({ initialData, onSubmit, apiValidationErrors }: UseProductFormProps) => {
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: initialData?.name || '',
    product_code: initialData?.product_code || '',
    category: initialData?.category || '',
    stock_quantity: initialData?.stock_quantity || 0,
    selling_price: initialData?.selling_price || 0,
    cost_price: initialData?.cost_price || 0,
    description: initialData?.description || '',
    image_url: initialData?.image_url || '',
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true
  })

  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sincronizar errores de validación de la API
  useEffect(() => {
    if (apiValidationErrors) {
      const formErrors: ProductFormErrors = {}

      // Mapear errores de la API a errores del formulario
      Object.entries(apiValidationErrors).forEach(([field, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          // Tomar el primer error para cada campo
          formErrors[field as keyof ProductFormErrors] = fieldErrors[0]
        }
      })

      setErrors(formErrors)
    }
  }, [apiValidationErrors])

  // Sincronizar formData con initialData cuando cambie
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        product_code: initialData.product_code || '',
        category: initialData.category || '',
        stock_quantity: initialData.stock_quantity || 0,
        selling_price: initialData.selling_price || 0,
        cost_price: initialData.cost_price || 0,
        description: initialData.description || '',
        image_url: initialData.image_url || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      })
    } else {
      // Reset form cuando no hay initialData (modo create)
      setFormData({
        name: '',
        product_code: '',
        category: '',
        stock_quantity: 0,
        selling_price: 0,
        cost_price: 0,
        description: '',
        image_url: '',
        is_active: true
      })
    }
  }, [
    initialData?.name,
    initialData?.product_code,
    initialData?.category,
    initialData?.stock_quantity,
    initialData?.selling_price,
    initialData?.cost_price,
    initialData?.description,
    initialData?.image_url,
    initialData?.is_active
  ])

  const validateForm = useCallback((): boolean => {
    const newErrors: ProductFormErrors = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    } else if (formData.name.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres'
    }

    // Validar código de producto
    if (!formData.product_code.trim()) {
      newErrors.product_code = 'El código del producto es requerido'
    } else if (formData.product_code.length < 2) {
      newErrors.product_code = 'El código debe tener al menos 2 caracteres'
    } else if (formData.product_code.length > 50) {
      newErrors.product_code = 'El código no puede exceder 50 caracteres'
    }

    // Validar categoría
    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida'
    }

    // Validar cantidad en stock
    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'La cantidad no puede ser negativa'
    }

    // Validar precio de venta
    if (formData.selling_price <= 0) {
      newErrors.selling_price = 'El precio de venta debe ser mayor a 0'
    }

    // Validar precio de costo
    if (formData.cost_price <= 0) {
      newErrors.cost_price = 'El precio de costo debe ser mayor a 0'
    }

    // Validar descripción (opcional pero con límite)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres'
    }

    // Validar URL de imagen (opcional pero debe ser válida si se proporciona)
    if (formData.image_url && formData.image_url.trim()) {
      try {
        new URL(formData.image_url)
      } catch {
        newErrors.image_url = 'Debe ser una URL válida'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleInputChange = useCallback(
    (name: keyof CreateProductRequest, value: string | number | boolean) => {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))

      // Limpiar error del campo cuando el usuario empiece a escribir
      if (errors[name as keyof ProductFormErrors]) {
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
        name: initialData.name || '',
        product_code: initialData.product_code || '',
        category: initialData.category || '',
        stock_quantity: initialData.stock_quantity || 0,
        selling_price: initialData.selling_price || 0,
        cost_price: initialData.cost_price || 0,
        description: initialData.description || '',
        image_url: initialData.image_url || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      })
    } else {
      // Modo create: resetear con valores vacíos/por defecto
      setFormData({
        name: '',
        product_code: '',
        category: '',
        stock_quantity: 0,
        selling_price: 0,
        cost_price: 0,
        description: '',
        image_url: '',
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
