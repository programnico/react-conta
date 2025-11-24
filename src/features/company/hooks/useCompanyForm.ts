import { useState, useCallback, useEffect } from 'react'
import type { CreateCompanyRequest, CompanySettings } from '../types'

interface CompanyFormErrors {
  name?: string
  legal_name?: string
  tax_id?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  website?: string
  currency?: string
  timezone?: string
  locale?: string
  fiscal_year_end?: string
  logo?: string
  settings?: string
}

interface UseCompanyFormProps {
  initialData?: Partial<CreateCompanyRequest>
  onSubmit: (data: CreateCompanyRequest) => Promise<void>
  apiValidationErrors?: Record<string, string[]> | null
}

export const useCompanyForm = ({ initialData, onSubmit, apiValidationErrors }: UseCompanyFormProps) => {
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: initialData?.name || '',
    legal_name: initialData?.legal_name || '',
    tax_id: initialData?.tax_id || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || '',
    postal_code: initialData?.postal_code || '',
    website: initialData?.website || '',
    currency: initialData?.currency || 'USD',
    timezone: initialData?.timezone || 'America/El_Salvador',
    locale: initialData?.locale || 'es',
    fiscal_year_end: initialData?.fiscal_year_end || '',
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    is_default: initialData?.is_default || false,
    logo: undefined,
    settings: initialData?.settings || {
      // === INVENTARIO ===
      separate_stock_by_establishment: false,
      allow_negative_stock: false,
      require_serial_numbers: false,
      auto_update_cost_price: true,
      stock_valuation_method: 'average',

      // === NUMERACIÓN ===
      separate_numbering_by_establishment: false,
      invoice_prefix: 'FAC',
      receipt_prefix: 'REC',
      purchase_prefix: 'COM',

      // === COMPARTIR DATOS ===
      share_clients_across_establishments: true,
      share_suppliers_across_establishments: true,
      share_products_across_establishments: false,
      share_pricing_across_establishments: true,

      // === CONTABLE ===
      consolidated_accounting: true,
      fiscal_year_start_month: 1,
      use_cost_centers: false,
      require_budget_approval: false,
      auto_post_journal_entries: false,

      // === DOCUMENTOS ===
      allow_partial_payments: true,
      allow_edit_posted_documents: false,
      require_customer_tax_id: false,
      default_payment_terms_days: 30,

      // === COMPRAS ===
      require_purchase_approval: false,
      purchase_approval_threshold: '1000.00',
      auto_receive_purchases: false,

      // === REPORTES ===
      default_report_format: 'pdf',
      include_company_logo: true,

      // === IMPUESTOS ===
      default_tax_rate: '13.00',
      calculate_tax_inclusive: false
    }
  })

  const [errors, setErrors] = useState<CompanyFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sincronizar errores de validación de la API
  useEffect(() => {
    if (apiValidationErrors) {
      const formErrors: CompanyFormErrors = {}

      Object.entries(apiValidationErrors).forEach(([field, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          formErrors[field as keyof CompanyFormErrors] = fieldErrors[0]
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
        legal_name: initialData.legal_name || '',
        tax_id: initialData.tax_id || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || '',
        postal_code: initialData.postal_code || '',
        website: initialData.website || '',
        currency: initialData.currency || 'USD',
        timezone: initialData.timezone || 'America/El_Salvador',
        locale: initialData.locale || 'es',
        fiscal_year_end: initialData.fiscal_year_end || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        is_default: initialData.is_default || false,
        logo: undefined,
        settings: initialData.settings || formData.settings
      })
    }
  }, [initialData])

  const validateForm = useCallback((): boolean => {
    const newErrors: CompanyFormErrors = {}

    // Validar nombre (requerido)
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    } else if (formData.name.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres'
    }

    // Validar email (opcional pero debe ser válido si se proporciona)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Debe ser un email válido'
      }
    }

    // Validar website (opcional pero debe ser válida si se proporciona)
    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website)
      } catch {
        newErrors.website = 'Debe ser una URL válida'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleInputChange = useCallback(
    (name: keyof CreateCompanyRequest, value: string | number | boolean) => {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))

      // Limpiar error del campo
      if (errors[name as keyof CompanyFormErrors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined
        }))
      }
    },
    [errors]
  )

  const handleSettingsChange = useCallback((name: keyof CompanySettings, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: value
      } as CompanySettings
    }))
  }, [])

  const handleFileChange = useCallback(
    (file: File | undefined) => {
      setFormData(prev => ({
        ...prev,
        logo: file
      }))

      // Limpiar error de logo
      if (errors.logo) {
        setErrors(prev => ({
          ...prev,
          logo: undefined
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
      name: '',
      legal_name: '',
      tax_id: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      website: '',
      currency: 'USD',
      timezone: 'America/El_Salvador',
      locale: 'es',
      fiscal_year_end: '',
      is_active: true,
      is_default: false,
      logo: undefined,
      settings: {
        separate_stock_by_establishment: false,
        allow_negative_stock: false,
        require_serial_numbers: false,
        auto_update_cost_price: true,
        stock_valuation_method: 'average',
        separate_numbering_by_establishment: false,
        invoice_prefix: 'FAC',
        receipt_prefix: 'REC',
        purchase_prefix: 'COM',
        share_clients_across_establishments: true,
        share_suppliers_across_establishments: true,
        share_products_across_establishments: false,
        share_pricing_across_establishments: true,
        consolidated_accounting: true,
        fiscal_year_start_month: 1,
        use_cost_centers: false,
        require_budget_approval: false,
        auto_post_journal_entries: false,
        allow_partial_payments: true,
        allow_edit_posted_documents: false,
        require_customer_tax_id: false,
        default_payment_terms_days: 30,
        require_purchase_approval: false,
        purchase_approval_threshold: '1000.00',
        auto_receive_purchases: false,
        default_report_format: 'pdf',
        include_company_logo: true,
        default_tax_rate: '13.00',
        calculate_tax_inclusive: false
      }
    })
    setErrors({})
  }, [])

  return {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSettingsChange,
    handleFileChange,
    handleSubmit,
    resetForm,
    setFormData
  }
}
