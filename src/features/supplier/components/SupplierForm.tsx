// features/supplier/components/SupplierForm.tsx
'use client'

import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Switch,
  FormControlLabel,
  Typography,
  Divider,
  CircularProgress
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import type { Supplier, CreateSupplierRequest, SupplierType, SupplierClassification } from '../types'

interface SupplierFormProps {
  open: boolean
  supplier?: Supplier | null
  loading?: boolean
  onSubmit: (data: CreateSupplierRequest) => Promise<void>
  onClose: () => void
}

const validationSchema = Yup.object({
  business_name: Yup.string().required('Razón social es requerida'),
  name: Yup.string(),
  type: Yup.string().oneOf(['local', 'foreign'], 'Tipo inválido').required('Tipo es requerido'),
  classification: Yup.string()
    .oneOf(['none', 'small', 'medium', 'large', 'other'], 'Clasificación inválida')
    .required('Clasificación es requerida'),
  email: Yup.string().email('Email inválido').required('Email es requerido'),
  phone: Yup.string().required('Teléfono es requerido'),
  address: Yup.string().required('Dirección es requerida'),
  tax_id: Yup.string(),
  registration_number: Yup.string(),
  is_active: Yup.boolean()
})

export const SupplierForm: React.FC<SupplierFormProps> = ({ open, supplier, loading = false, onSubmit, onClose }) => {
  const isEditing = Boolean(supplier)

  const formik = useFormik<CreateSupplierRequest>({
    initialValues: {
      name: supplier?.name || '',
      business_name: supplier?.business_name || '',
      type: supplier?.type || 'local',
      classification: supplier?.classification || 'none',
      registration_number: supplier?.registration_number || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
      address: supplier?.address || '',
      is_active: supplier?.is_active ?? true,
      tax_id: supplier?.tax_id || ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        await onSubmit(values)
        formik.resetForm()
      } catch (error) {
        // Error handling is done at the parent level
      }
    }
  })

  const handleClose = () => {
    formik.resetForm()
    onClose()
  }

  const typeOptions: { value: SupplierType; label: string }[] = [
    { value: 'local', label: 'Local' },
    { value: 'foreign', label: 'Extranjero' }
  ]

  const classificationOptions: { value: SupplierClassification; label: string }[] = [
    { value: 'none', label: 'Ninguna' },
    { value: 'small', label: 'Pequeña' },
    { value: 'medium', label: 'Mediana' },
    { value: 'large', label: 'Grande' },
    { value: 'other', label: 'Otra' }
  ]

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          <Typography variant='h6' component='div'>
            {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ py: 2 }}>
            <Grid container spacing={3}>
              {/* Información Básica */}
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom color='primary' fontWeight='medium'>
                  Información Básica
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name='business_name'
                  label='Razón Social *'
                  value={formik.values.business_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.business_name && Boolean(formik.errors.business_name)}
                  helperText={formik.touched.business_name && formik.errors.business_name}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name='name'
                  label='Nombre Comercial'
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo *</InputLabel>
                  <Select
                    name='type'
                    value={formik.values.type}
                    label='Tipo *'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                    disabled={loading}
                  >
                    {typeOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Clasificación *</InputLabel>
                  <Select
                    name='classification'
                    value={formik.values.classification}
                    label='Clasificación *'
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.classification && Boolean(formik.errors.classification)}
                    disabled={loading}
                  >
                    {classificationOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Información Legal */}
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom color='primary' fontWeight='medium' sx={{ mt: 2 }}>
                  Información Legal
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name='tax_id'
                  label='NIT / Tax ID'
                  value={formik.values.tax_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.tax_id && Boolean(formik.errors.tax_id)}
                  helperText={formik.touched.tax_id && formik.errors.tax_id}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name='registration_number'
                  label='Número de Registro'
                  value={formik.values.registration_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.registration_number && Boolean(formik.errors.registration_number)}
                  helperText={formik.touched.registration_number && formik.errors.registration_number}
                  disabled={loading}
                />
              </Grid>

              {/* Información de Contacto */}
              <Grid item xs={12}>
                <Typography variant='subtitle1' gutterBottom color='primary' fontWeight='medium' sx={{ mt: 2 }}>
                  Información de Contacto
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name='email'
                  label='Email *'
                  type='email'
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name='phone'
                  label='Teléfono *'
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name='address'
                  label='Dirección *'
                  multiline
                  rows={3}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  disabled={loading}
                />
              </Grid>

              {/* Estado */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name='is_active'
                      checked={formik.values.is_active}
                      onChange={formik.handleChange}
                      disabled={loading}
                      color='primary'
                    />
                  }
                  label={
                    <Typography variant='body2'>
                      {formik.values.is_active ? 'Proveedor Activo' : 'Proveedor Inactivo'}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={loading || !formik.isValid || !formik.dirty}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'} Proveedor
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default SupplierForm
