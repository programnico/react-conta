// features/establishment/components/EstablishmentForm.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Tabs,
  Tab,
  Typography,
  Alert,
  Autocomplete,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  Close as CloseIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Store as StoreIcon,
  Settings as SettingsIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material'

import { useEstablishmentsRedux } from '../hooks/useEstablishmentsRedux'
import { companyService } from '@/features/company/services/companyService'
import type { Establishment, CreateEstablishmentRequest } from '../types'
import type { Company } from '@/features/company/types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  if (value !== index) return null

  return <Box sx={{ py: 3 }}>{children}</Box>
}

interface EstablishmentFormProps {
  open: boolean
  establishment: Establishment | null
  onClose: () => void
  onSuccess: () => void
}

const WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const EstablishmentForm: React.FC<EstablishmentFormProps> = ({ open, establishment, onClose, onSuccess }) => {
  const {
    loadingStates,
    error,
    validationErrors,
    createEstablishment,
    updateEstablishment,
    clearError,
    clearValidationErrors
  } = useEstablishmentsRedux()

  const [tabValue, setTabValue] = useState(0)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  // Form state
  const [formData, setFormData] = useState<CreateEstablishmentRequest>({
    company_id: 0,
    code: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    manager_name: '',
    latitude: '',
    longitude: '',
    is_main: false,
    is_active: true,
    // Inventory settings
    allow_negative_stock: false,
    require_serial_numbers: false,
    stock_valuation_method: 'fifo',
    // Numbering settings
    invoice_prefix: '',
    invoice_current_number: 1,
    receipt_prefix: '',
    receipt_current_number: 1,
    purchase_prefix: '',
    purchase_current_number: 1,
    // Pricing settings
    use_custom_pricing: false,
    price_markup_percentage: '',
    // Document settings
    allow_partial_payments: false,
    require_customer_tax_id: false,
    default_payment_terms_days: 0,
    // Purchase settings
    require_purchase_approval: false,
    purchase_approval_threshold: '',
    // Report settings
    default_report_format: 'pdf',
    include_company_logo: true,
    custom_footer_text: '',
    // Schedule settings
    opening_time: '',
    closing_time: '',
    working_days: ''
  })

  const [selectedWorkingDays, setSelectedWorkingDays] = useState<string[]>([])
  const [inheritedSettings, setInheritedSettings] = useState(false)

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      setLoadingCompanies(true)
      try {
        const companiesList = await companyService.getAllForSelect()
        setCompanies(companiesList)
      } catch (error) {
        console.error('Error loading companies:', error)
      } finally {
        setLoadingCompanies(false)
      }
    }
    if (open) {
      loadCompanies()
    }
  }, [open])

  // Initialize form data when establishment changes
  useEffect(() => {
    if (open && establishment) {
      const workingDaysArray = establishment.settings?.working_days?.split(',') || []

      setFormData({
        company_id: establishment.company_id,
        code: establishment.code,
        name: establishment.name,
        address: establishment.address || '',
        phone: establishment.phone || '',
        email: establishment.email || '',
        manager_name: establishment.manager_name || '',
        latitude: establishment.latitude || '',
        longitude: establishment.longitude || '',
        is_main: establishment.is_main,
        is_active: establishment.is_active,
        // Inventory settings
        allow_negative_stock: establishment.settings?.allow_negative_stock || false,
        require_serial_numbers: establishment.settings?.require_serial_numbers || false,
        stock_valuation_method: establishment.settings?.stock_valuation_method || 'fifo',
        // Numbering settings
        invoice_prefix: establishment.settings?.invoice_prefix || '',
        invoice_current_number: establishment.settings?.invoice_current_number || 1,
        receipt_prefix: establishment.settings?.receipt_prefix || '',
        receipt_current_number: establishment.settings?.receipt_current_number || 1,
        purchase_prefix: establishment.settings?.purchase_prefix || '',
        purchase_current_number: establishment.settings?.purchase_current_number || 1,
        // Pricing settings
        use_custom_pricing: establishment.settings?.use_custom_pricing || false,
        price_markup_percentage: establishment.settings?.price_markup_percentage?.toString() || '',
        // Document settings
        allow_partial_payments: establishment.settings?.allow_partial_payments || false,
        require_customer_tax_id: establishment.settings?.require_customer_tax_id || false,
        default_payment_terms_days: establishment.settings?.default_payment_terms_days || 0,
        // Purchase settings
        require_purchase_approval: establishment.settings?.require_purchase_approval || false,
        purchase_approval_threshold: establishment.settings?.purchase_approval_threshold?.toString() || '',
        // Report settings
        default_report_format: establishment.settings?.default_report_format || 'pdf',
        include_company_logo: establishment.settings?.include_company_logo || true,
        custom_footer_text: establishment.settings?.custom_footer_text || '',
        // Schedule settings
        opening_time: establishment.settings?.opening_time || '',
        closing_time: establishment.settings?.closing_time || '',
        working_days: establishment.settings?.working_days || ''
      })
      setSelectedWorkingDays(workingDaysArray)
    } else if (open && !establishment) {
      // Reset form for new establishment
      setFormData({
        company_id: 0,
        code: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        manager_name: '',
        latitude: '',
        longitude: '',
        is_main: false,
        is_active: true,
        allow_negative_stock: false,
        require_serial_numbers: false,
        stock_valuation_method: 'fifo',
        invoice_prefix: '',
        invoice_current_number: 1,
        receipt_prefix: '',
        receipt_current_number: 1,
        purchase_prefix: '',
        purchase_current_number: 1,
        use_custom_pricing: false,
        price_markup_percentage: '',
        allow_partial_payments: false,
        require_customer_tax_id: false,
        default_payment_terms_days: 0,
        require_purchase_approval: false,
        purchase_approval_threshold: '',
        default_report_format: 'pdf',
        include_company_logo: true,
        custom_footer_text: '',
        opening_time: '',
        closing_time: '',
        working_days: ''
      })
      setSelectedWorkingDays([])
    }

    // Resetear flag de configuraciones heredadas
    setInheritedSettings(false)
  }, [open, establishment])

  // Clear errors when opening
  useEffect(() => {
    if (open) {
      clearValidationErrors()
      clearError()
      setTabValue(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleInputChange = (field: keyof CreateEstablishmentRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleWorkingDaysChange = (event: any, newValue: string[]) => {
    setSelectedWorkingDays(newValue)
    setFormData(prev => ({ ...prev, working_days: newValue.join(',') }))
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleClose = () => {
    clearError()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.company_id || formData.company_id === 0) {
      return
    }

    try {
      if (establishment?.id) {
        await updateEstablishment({ id: establishment.id, data: formData }).unwrap()
      } else {
        await createEstablishment(formData).unwrap()
      }
      onSuccess()
      handleClose()
    } catch (error) {
      // Error handled by Redux
    }
  }

  const isLoading = loadingStates?.creating || loadingStates?.updating

  const getFieldError = (field: string) => {
    if (validationErrors && validationErrors[field]) {
      return validationErrors[field][0]
    }
    return null
  }

  const selectedCompany = useMemo(() => {
    return companies.find(c => c.id === formData.company_id) || null
  }, [companies, formData.company_id])

  // Heredar configuraciones de la empresa cuando se está creando un nuevo establecimiento
  useEffect(() => {
    // Solo aplicar cuando:
    // 1. No estamos editando un establecimiento existente
    // 2. Se ha seleccionado una empresa
    // 3. La empresa tiene configuraciones
    if (!establishment && selectedCompany && selectedCompany.settings) {
      const settings = selectedCompany.settings

      setFormData(prev => ({
        ...prev,
        // Heredar settings de inventario
        allow_negative_stock: settings.allow_negative_stock ?? prev.allow_negative_stock,
        require_serial_numbers: settings.require_serial_numbers ?? prev.require_serial_numbers,
        stock_valuation_method: settings.stock_valuation_method ?? prev.stock_valuation_method,
        // Heredar settings de numeración
        invoice_prefix: settings.invoice_prefix ?? prev.invoice_prefix,
        receipt_prefix: settings.receipt_prefix ?? prev.receipt_prefix,
        purchase_prefix: settings.purchase_prefix ?? prev.purchase_prefix,
        // Heredar settings de documentos
        allow_partial_payments: settings.allow_partial_payments ?? prev.allow_partial_payments,
        require_customer_tax_id: settings.require_customer_tax_id ?? prev.require_customer_tax_id,
        default_payment_terms_days: settings.default_payment_terms_days ?? prev.default_payment_terms_days,
        // Heredar settings de compras
        require_purchase_approval: settings.require_purchase_approval ?? prev.require_purchase_approval,
        purchase_approval_threshold:
          settings.purchase_approval_threshold?.toString() ?? prev.purchase_approval_threshold,
        // Heredar settings de reportes
        default_report_format: settings.default_report_format ?? prev.default_report_format,
        include_company_logo: settings.include_company_logo ?? prev.include_company_logo
      }))

      setInheritedSettings(true)
    }
  }, [selectedCompany, establishment])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth scroll='paper'>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Typography variant='h6'>{establishment ? 'Editar Establecimiento' : 'Nuevo Establecimiento'}</Typography>
            <Button onClick={handleClose} size='small'>
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {error && (
            <Alert severity='error' onClose={clearError} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {inheritedSettings && !establishment && (
            <Alert severity='info' onClose={() => setInheritedSettings(false)} sx={{ mb: 2 }}>
              Se han heredado las configuraciones de la empresa seleccionada. Puedes modificar estos valores según las
              necesidades de este establecimiento.
            </Alert>
          )}

          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab icon={<StoreIcon />} label='Información Básica' />
            <Tab icon={<SettingsIcon />} label='Configuración' />
            <Tab icon={<MoneyIcon />} label='Precios y Compras' />
          </Tabs>

          {/* TAB 1: Información Básica */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Company */}
              <Grid item xs={12}>
                <Autocomplete
                  options={companies}
                  getOptionLabel={option => option.name}
                  value={selectedCompany}
                  onChange={(event, newValue) => {
                    handleInputChange('company_id', newValue ? newValue.id : 0)
                  }}
                  loading={loadingCompanies}
                  disabled={isLoading || !!establishment}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label='Empresa *'
                      required
                      error={!!getFieldError('company_id')}
                      helperText={
                        getFieldError('company_id') ||
                        (establishment
                          ? 'No se puede cambiar la empresa de un establecimiento existente'
                          : 'Selecciona una empresa para heredar sus configuraciones')
                      }
                    />
                  )}
                />
              </Grid>

              {/* Code */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label='Código'
                  value={formData.code}
                  onChange={e => handleInputChange('code', e.target.value)}
                  disabled={isLoading}
                  error={!!getFieldError('code')}
                  helperText={getFieldError('code')}
                />
              </Grid>

              {/* Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label='Nombre'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  disabled={isLoading}
                  error={!!getFieldError('name')}
                  helperText={getFieldError('name')}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Dirección'
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  disabled={isLoading}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Teléfono'
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  disabled={isLoading}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Email'
                  type='email'
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  disabled={isLoading}
                />
              </Grid>

              {/* Manager Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Encargado'
                  value={formData.manager_name}
                  onChange={e => handleInputChange('manager_name', e.target.value)}
                  disabled={isLoading}
                />
              </Grid>

              {/* Location */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label='Latitud'
                  type='number'
                  value={formData.latitude}
                  onChange={e => handleInputChange('latitude', e.target.value)}
                  disabled={isLoading}
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label='Longitud'
                  type='number'
                  value={formData.longitude}
                  onChange={e => handleInputChange('longitude', e.target.value)}
                  disabled={isLoading}
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              {/* Switches */}
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_main}
                      onChange={e => handleInputChange('is_main', e.target.checked)}
                      disabled={isLoading}
                    />
                  }
                  label='Establecimiento Principal'
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={e => handleInputChange('is_active', e.target.checked)}
                      disabled={isLoading}
                    />
                  }
                  label='Activo'
                />
              </Grid>

              {/* Schedule */}
              <Grid item xs={12}>
                <Typography variant='subtitle2' gutterBottom>
                  Horarios
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Hora de Apertura'
                  type='time'
                  value={formData.opening_time}
                  onChange={e => handleInputChange('opening_time', e.target.value)}
                  disabled={isLoading}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Hora de Cierre'
                  type='time'
                  value={formData.closing_time}
                  onChange={e => handleInputChange('closing_time', e.target.value)}
                  disabled={isLoading}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={WORKING_DAYS}
                  value={selectedWorkingDays}
                  onChange={handleWorkingDaysChange}
                  disabled={isLoading}
                  renderInput={params => <TextField {...params} label='Días Laborales' />}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 2: Configuración */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {/* Inventory */}
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Inventario</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.allow_negative_stock}
                              onChange={e => handleInputChange('allow_negative_stock', e.target.checked)}
                              disabled={isLoading}
                            />
                          }
                          label='Permitir Stock Negativo'
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.require_serial_numbers}
                              onChange={e => handleInputChange('require_serial_numbers', e.target.checked)}
                              disabled={isLoading}
                            />
                          }
                          label='Requiere Números de Serie'
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Método de Valuación</InputLabel>
                          <Select
                            value={formData.stock_valuation_method}
                            onChange={e => handleInputChange('stock_valuation_method', e.target.value)}
                            disabled={isLoading}
                            label='Método de Valuación'
                          >
                            <MenuItem value='fifo'>FIFO (Primero en Entrar, Primero en Salir)</MenuItem>
                            <MenuItem value='lifo'>LIFO (Último en Entrar, Primero en Salir)</MenuItem>
                            <MenuItem value='average'>Promedio Ponderado</MenuItem>
                            <MenuItem value='standard'>Costo Estándar</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Numbering */}
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Numeración</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label='Prefijo Facturas'
                          value={formData.invoice_prefix}
                          onChange={e => handleInputChange('invoice_prefix', e.target.value)}
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label='Número Actual Facturas'
                          type='number'
                          value={formData.invoice_current_number}
                          onChange={e => handleInputChange('invoice_current_number', parseInt(e.target.value) || 1)}
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label='Prefijo Recibos'
                          value={formData.receipt_prefix}
                          onChange={e => handleInputChange('receipt_prefix', e.target.value)}
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label='Número Actual Recibos'
                          type='number'
                          value={formData.receipt_current_number}
                          onChange={e => handleInputChange('receipt_current_number', parseInt(e.target.value) || 1)}
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label='Prefijo Compras'
                          value={formData.purchase_prefix}
                          onChange={e => handleInputChange('purchase_prefix', e.target.value)}
                          disabled={isLoading}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label='Número Actual Compras'
                          type='number'
                          value={formData.purchase_current_number}
                          onChange={e => handleInputChange('purchase_current_number', parseInt(e.target.value) || 1)}
                          disabled={isLoading}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Documents */}
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Documentos</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.allow_partial_payments}
                              onChange={e => handleInputChange('allow_partial_payments', e.target.checked)}
                              disabled={isLoading}
                            />
                          }
                          label='Permitir Pagos Parciales'
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.require_customer_tax_id}
                              onChange={e => handleInputChange('require_customer_tax_id', e.target.checked)}
                              disabled={isLoading}
                            />
                          }
                          label='Requiere NIT del Cliente'
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Días de Crédito por Defecto'
                          type='number'
                          value={formData.default_payment_terms_days}
                          onChange={e => handleInputChange('default_payment_terms_days', parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Reports */}
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Reportes</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Formato de Reporte</InputLabel>
                          <Select
                            value={formData.default_report_format}
                            onChange={e => handleInputChange('default_report_format', e.target.value)}
                            disabled={isLoading}
                            label='Formato de Reporte'
                          >
                            <MenuItem value='pdf'>PDF</MenuItem>
                            <MenuItem value='excel'>Excel</MenuItem>
                            <MenuItem value='html'>HTML</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.include_company_logo}
                              onChange={e => handleInputChange('include_company_logo', e.target.checked)}
                              disabled={isLoading}
                            />
                          }
                          label='Incluir Logo de Empresa'
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Texto de Pie de Página'
                          value={formData.custom_footer_text}
                          onChange={e => handleInputChange('custom_footer_text', e.target.value)}
                          disabled={isLoading}
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 3: Precios y Compras */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              {/* Pricing */}
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Precios</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.use_custom_pricing}
                              onChange={e => handleInputChange('use_custom_pricing', e.target.checked)}
                              disabled={isLoading}
                            />
                          }
                          label='Usar Precios Personalizados'
                        />
                      </Grid>
                      {formData.use_custom_pricing && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label='Porcentaje de Margen (%)'
                            type='number'
                            value={formData.price_markup_percentage}
                            onChange={e => handleInputChange('price_markup_percentage', e.target.value)}
                            disabled={isLoading}
                            inputProps={{ step: '0.01' }}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Purchases */}
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Compras</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.require_purchase_approval}
                              onChange={e => handleInputChange('require_purchase_approval', e.target.checked)}
                              disabled={isLoading}
                            />
                          }
                          label='Requiere Aprobación de Compras'
                        />
                      </Grid>
                      {formData.require_purchase_approval && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label='Monto de Aprobación'
                            type='number'
                            value={formData.purchase_approval_threshold}
                            onChange={e => handleInputChange('purchase_approval_threshold', e.target.value)}
                            disabled={isLoading}
                            inputProps={{ step: '0.01' }}
                          />
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='contained'
            startIcon={<SaveIcon />}
            disabled={isLoading || !formData.company_id}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EstablishmentForm
