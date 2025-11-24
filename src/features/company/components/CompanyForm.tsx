// features/company/components/CompanyForm.tsx
'use client'

import React, { useEffect, useState } from 'react'
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
  Divider,
  MenuItem,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  Close as CloseIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'

import { useCompaniesRedux } from '../hooks/useCompaniesRedux'
import { useCompanyForm } from '../hooks/useCompanyForm'
import type { Company, CreateCompanyRequest, CompanySettings } from '../types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  if (value !== index) return null

  return <Box sx={{ py: 3 }}>{children}</Box>
}

interface CompanyFormProps {
  open: boolean
  company: Company | null
  onClose: () => void
  onSuccess: () => void
}

const CompanyForm: React.FC<CompanyFormProps> = ({ open, company, onClose, onSuccess }) => {
  const { loadingStates, error, validationErrors, createCompany, updateCompany, clearError, clearValidationErrors } =
    useCompaniesRedux()

  const [tabValue, setTabValue] = useState(0)

  // Datos iniciales basados en la empresa a editar
  const initialData = React.useMemo(() => {
    if (company) {
      return {
        name: company.name,
        legal_name: company.legal_name || '',
        tax_id: company.tax_id || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        country: company.country || '',
        postal_code: company.postal_code || '',
        website: company.website || '',
        currency: company.currency || '',
        fiscal_year_end: company.fiscal_year_end || '',
        is_active: company.is_active,
        is_default: company.is_default || false,
        has_establishments: company.has_establishments || false,
        establishment_mode: company.establishment_mode || 'none',
        settings: company.settings
      }
    }
    return undefined
  }, [company])

  // Limpiar errores cuando se abre el formulario
  useEffect(() => {
    if (open) {
      clearValidationErrors()
      clearError()
      setTabValue(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleFormSubmit = async (formData: CreateCompanyRequest) => {
    try {
      if (company?.id) {
        await updateCompany({ id: company.id, data: formData }).unwrap()
      } else {
        await createCompany(formData).unwrap()
      }
      // Success - llama a onSuccess para mostrar notificación
      onSuccess()
    } catch (error) {
      // El error se maneja en el slice
    }
  }

  const {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSettingsChange,
    handleFileChange,
    handleSubmit,
    resetForm
  } = useCompanyForm({
    initialData,
    onSubmit: handleFormSubmit,
    apiValidationErrors: validationErrors
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleClose = () => {
    resetForm()
    clearError()
    onClose()
  }

  const isLoading = loadingStates?.creating || loadingStates?.updating

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>{company ? 'Editar Empresa' : 'Nueva Empresa'}</Typography>
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

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<BusinessIcon />} label='Información Básica' />
          <Tab icon={<SettingsIcon />} label='Configuración' />
        </Tabs>

        {/* TAB 1: Información Básica */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Nombre */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label='Nombre'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                disabled={isLoading}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>

            {/* Razón Social */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Razón Social'
                value={formData.legal_name}
                onChange={e => handleInputChange('legal_name', e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* NIT */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='NIT / Tax ID'
                value={formData.tax_id}
                onChange={e => handleInputChange('tax_id', e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* Moneda */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Moneda'
                value={formData.currency}
                onChange={e => handleInputChange('currency', e.target.value)}
                disabled={isLoading}
                placeholder='USD, EUR, BOB...'
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Dirección */}
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

            {/* País */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='País'
                value={formData.country}
                onChange={e => handleInputChange('country', e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* Departamento/Estado */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Departamento/Estado'
                value={formData.state}
                onChange={e => handleInputChange('state', e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* Ciudad */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Ciudad'
                value={formData.city}
                onChange={e => handleInputChange('city', e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* Código Postal */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Código Postal'
                value={formData.postal_code}
                onChange={e => handleInputChange('postal_code', e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* Teléfono */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Teléfono'
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Email'
                type='email'
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                disabled={isLoading}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            {/* Website */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Sitio Web'
                value={formData.website}
                onChange={e => handleInputChange('website', e.target.value)}
                disabled={isLoading}
                error={!!errors.website}
                helperText={errors.website}
              />
            </Grid>

            {/* Cierre Fiscal */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Cierre de Año Fiscal'
                type='date'
                value={formData.fiscal_year_end}
                onChange={e => handleInputChange('fiscal_year_end', e.target.value)}
                disabled={isLoading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Logo */}
            <Grid item xs={12}>
              <Button variant='outlined' component='label' disabled={isLoading}>
                Subir Logo
                <input type='file' hidden accept='image/*' onChange={e => handleFileChange(e.target.files?.[0])} />
              </Button>
              {formData.logo && (
                <Typography variant='caption' sx={{ ml: 2 }}>
                  {formData.logo.name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Switches */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={e => handleInputChange('is_active', e.target.checked)}
                  />
                }
                label='Empresa Activa'
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_default}
                    onChange={e => handleInputChange('is_default', e.target.checked)}
                  />
                }
                label='Empresa por Defecto'
                disabled={isLoading}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* TAB 2: Configuración */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            {/* === INVENTARIO === */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    Inventario
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.separate_stock_by_establishment || false}
                            onChange={e => handleSettingsChange('separate_stock_by_establishment', e.target.checked)}
                          />
                        }
                        label='Inventario Separado por Establecimiento'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.allow_negative_stock || false}
                            onChange={e => handleSettingsChange('allow_negative_stock', e.target.checked)}
                          />
                        }
                        label='Permitir Stock Negativo'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label='Método de Valuación'
                        value={formData.settings?.stock_valuation_method || 'average'}
                        onChange={e => handleSettingsChange('stock_valuation_method', e.target.value)}
                        disabled={isLoading}
                      >
                        <MenuItem value='fifo'>FIFO</MenuItem>
                        <MenuItem value='lifo'>LIFO</MenuItem>
                        <MenuItem value='average'>Promedio</MenuItem>
                        <MenuItem value='standard'>Estándar</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.require_serial_numbers || false}
                            onChange={e => handleSettingsChange('require_serial_numbers', e.target.checked)}
                          />
                        }
                        label='Requerir Números de Serie'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.auto_update_cost_price || false}
                            onChange={e => handleSettingsChange('auto_update_cost_price', e.target.checked)}
                          />
                        }
                        label='Actualizar Precio de Costo Automáticamente'
                        disabled={isLoading}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* === NUMERACIÓN === */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    Numeración de Documentos
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.separate_numbering_by_establishment || false}
                            onChange={e =>
                              handleSettingsChange('separate_numbering_by_establishment', e.target.checked)
                            }
                          />
                        }
                        label='Numeración Separada por Establecimiento'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Prefijo Facturas'
                        value={formData.settings?.invoice_prefix || ''}
                        onChange={e => handleSettingsChange('invoice_prefix', e.target.value)}
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Prefijo Recibos'
                        value={formData.settings?.receipt_prefix || ''}
                        onChange={e => handleSettingsChange('receipt_prefix', e.target.value)}
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label='Prefijo Órdenes de Compra'
                        value={formData.settings?.purchase_prefix || ''}
                        onChange={e => handleSettingsChange('purchase_prefix', e.target.value)}
                        disabled={isLoading}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* === COMPARTIR DATOS === */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    Compartir Datos Entre Empresas
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.share_clients_across_establishments || false}
                            onChange={e =>
                              handleSettingsChange('share_clients_across_establishments', e.target.checked)
                            }
                          />
                        }
                        label='Compartir Clientes entre Establecimientos'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.share_suppliers_across_establishments || false}
                            onChange={e =>
                              handleSettingsChange('share_suppliers_across_establishments', e.target.checked)
                            }
                          />
                        }
                        label='Compartir Proveedores entre Establecimientos'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.share_products_across_establishments || false}
                            onChange={e =>
                              handleSettingsChange('share_products_across_establishments', e.target.checked)
                            }
                          />
                        }
                        label='Compartir Productos entre Establecimientos'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.share_pricing_across_establishments || false}
                            onChange={e =>
                              handleSettingsChange('share_pricing_across_establishments', e.target.checked)
                            }
                          />
                        }
                        label='Compartir Precios entre Establecimientos'
                        disabled={isLoading}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* === CONTABILIDAD === */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    Contabilidad
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.consolidated_accounting || false}
                            onChange={e => handleSettingsChange('consolidated_accounting', e.target.checked)}
                          />
                        }
                        label='Contabilidad Consolidada'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type='number'
                        label='Mes de Inicio del Año Fiscal'
                        value={formData.settings?.fiscal_year_start_month || 1}
                        onChange={e => handleSettingsChange('fiscal_year_start_month', parseInt(e.target.value))}
                        disabled={isLoading}
                        inputProps={{ min: 1, max: 12 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.use_cost_centers || false}
                            onChange={e => handleSettingsChange('use_cost_centers', e.target.checked)}
                          />
                        }
                        label='Centros de Costo'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.require_budget_approval || false}
                            onChange={e => handleSettingsChange('require_budget_approval', e.target.checked)}
                          />
                        }
                        label='Requerir Aprobación de Presupuesto'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.auto_post_journal_entries || false}
                            onChange={e => handleSettingsChange('auto_post_journal_entries', e.target.checked)}
                          />
                        }
                        label='Auto-publicar Asientos Contables'
                        disabled={isLoading}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* === DOCUMENTOS === */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    Términos de Documentos
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.allow_partial_payments || false}
                            onChange={e => handleSettingsChange('allow_partial_payments', e.target.checked)}
                          />
                        }
                        label='Permitir Pagos Parciales'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.allow_edit_posted_documents || false}
                            onChange={e => handleSettingsChange('allow_edit_posted_documents', e.target.checked)}
                          />
                        }
                        label='Editar Documentos Publicados'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.require_customer_tax_id || false}
                            onChange={e => handleSettingsChange('require_customer_tax_id', e.target.checked)}
                          />
                        }
                        label='Requerir NIT del Cliente'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type='number'
                        label='Días de Términos de Pago por Defecto'
                        value={formData.settings?.default_payment_terms_days || 0}
                        onChange={e => handleSettingsChange('default_payment_terms_days', parseInt(e.target.value))}
                        disabled={isLoading}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* === COMPRAS === */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    Compras
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.require_purchase_approval || false}
                            onChange={e => handleSettingsChange('require_purchase_approval', e.target.checked)}
                          />
                        }
                        label='Requerir Aprobación de Compras'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type='number'
                        label='Umbral de Aprobación de Compras'
                        value={formData.settings?.purchase_approval_threshold || 0}
                        onChange={e => handleSettingsChange('purchase_approval_threshold', parseFloat(e.target.value))}
                        disabled={isLoading}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.auto_receive_purchases || false}
                            onChange={e => handleSettingsChange('auto_receive_purchases', e.target.checked)}
                          />
                        }
                        label='Auto-recibir Compras'
                        disabled={isLoading}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* === REPORTES === */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    Reportes
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label='Formato de Reporte por Defecto'
                        value={formData.settings?.default_report_format || 'pdf'}
                        onChange={e => handleSettingsChange('default_report_format', e.target.value)}
                        disabled={isLoading}
                      >
                        <MenuItem value='pdf'>PDF</MenuItem>
                        <MenuItem value='excel'>Excel</MenuItem>
                        <MenuItem value='html'>HTML</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.include_company_logo || false}
                            onChange={e => handleSettingsChange('include_company_logo', e.target.checked)}
                          />
                        }
                        label='Incluir Logo de Empresa'
                        disabled={isLoading}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* === IMPUESTOS === */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    Impuestos
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type='number'
                        label='Tasa de Impuesto por Defecto (%)'
                        value={formData.settings?.default_tax_rate || 0}
                        onChange={e => handleSettingsChange('default_tax_rate', parseFloat(e.target.value))}
                        disabled={isLoading}
                        inputProps={{ min: 0, max: 100, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.settings?.calculate_tax_inclusive || false}
                            onChange={e => handleSettingsChange('calculate_tax_inclusive', e.target.checked)}
                          />
                        }
                        label='Calcular Impuesto Inclusivo'
                        disabled={isLoading}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* === ESTABLECIMIENTOS === */}
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    Establecimientos
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.has_establishments || false}
                            onChange={e => handleInputChange('has_establishments', e.target.checked)}
                          />
                        }
                        label='Tiene Establecimientos'
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label='Modo de Establecimientos'
                        value={formData.establishment_mode || 'none'}
                        onChange={e => handleInputChange('establishment_mode', e.target.value)}
                        disabled={isLoading}
                      >
                        <MenuItem value='none'>No usar establecimientos</MenuItem>
                        <MenuItem value='statistical'>Estadístico (solo reportes)</MenuItem>
                        <MenuItem value='operational'>Operacional (contabilidad separada)</MenuItem>
                      </TextField>
                    </Grid>
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
          onClick={handleSubmit}
          variant='contained'
          startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={isLoading || !formData.name}
        >
          {company ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CompanyForm
