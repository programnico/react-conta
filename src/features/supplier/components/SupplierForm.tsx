// features/supplier/components/SupplierForm.tsx
'use client'

import React, { useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  FormHelperText
} from '@mui/material'
import { useSuppliersRedux } from '../hooks/useSuppliersRedux'
import { useSupplierForm } from '../hooks/useSupplierForm'
import type { Supplier, CreateSupplierRequest } from '../types'

interface SupplierFormProps {
  open: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSuccess: () => void
}

const SupplierFormComponent: React.FC<SupplierFormProps> = ({ open, mode, onClose, onSuccess }) => {
  const { selectedSupplier, loading, error, validationErrors, clearValidationErrors, createSupplier, updateSupplier } =
    useSuppliersRedux()

  // Supplier types and classifications
  const typeOptions = [
    { value: 'local', label: 'Local' },
    { value: 'foreign', label: 'Extranjero' }
  ]

  const classificationOptions = [
    { value: 'none', label: 'Ninguna' },
    { value: 'small', label: 'Pequeña' },
    { value: 'medium', label: 'Mediana' },
    { value: 'large', label: 'Grande' },
    { value: 'other', label: 'Otra' }
  ]

  const initialData = useMemo(() => {
    if (mode === 'edit' && selectedSupplier) {
      return {
        business_name: selectedSupplier.business_name,
        name: selectedSupplier.name || '',
        type: selectedSupplier.type,
        classification: selectedSupplier.classification,
        tax_id: selectedSupplier.tax_id || '',
        email: selectedSupplier.email,
        phone: selectedSupplier.phone,
        address: selectedSupplier.address,
        registration_number: selectedSupplier.registration_number || '',
        is_active: selectedSupplier.is_active
      }
    }
    return undefined
  }, [
    mode,
    selectedSupplier?.business_name,
    selectedSupplier?.name,
    selectedSupplier?.type,
    selectedSupplier?.classification,
    selectedSupplier?.tax_id,
    selectedSupplier?.email,
    selectedSupplier?.phone,
    selectedSupplier?.address,
    selectedSupplier?.registration_number,
    selectedSupplier?.is_active
  ])

  // Limpiar errores de validación cuando se abre el formulario
  useEffect(() => {
    clearValidationErrors()
  }, [clearValidationErrors])

  const handleFormSubmit = async (formData: CreateSupplierRequest) => {
    try {
      if (mode === 'create') {
        await createSupplier(formData).unwrap()
        // Limpiar el formulario después de crear exitosamente
        // Pequeño delay para mejor UX
        setTimeout(() => {
          resetForm()
        }, 100)
      } else if (selectedSupplier) {
        await updateSupplier({
          id: selectedSupplier.id,
          data: formData
        }).unwrap()
      }

      // El SuppliersTable se refrescará automáticamente
      onSuccess()
    } catch (error) {
      // El error se maneja en el slice
    }
  }

  const { formData, errors, isSubmitting, handleInputChange, handleSubmit, resetForm } = useSupplierForm({
    initialData,
    onSubmit: handleFormSubmit,
    apiValidationErrors: validationErrors
  })

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
    >
      <DialogTitle>{mode === 'edit' ? 'Editar Proveedor' : 'Crear Nuevo Proveedor'}</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* Business Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='business_name'
                label='Razón Social'
                value={formData.business_name}
                onChange={e => handleInputChange('business_name', e.target.value)}
                error={!!errors.business_name}
                helperText={errors.business_name}
                disabled={isSubmitting}
                required
              />
            </Grid>

            {/* Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='name'
                label='Nombre'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={isSubmitting}
              />
            </Grid>

            {/* Tax ID */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='tax_id'
                label='NIT/Tax ID'
                value={formData.tax_id}
                onChange={e => handleInputChange('tax_id', e.target.value)}
                error={!!errors.tax_id}
                helperText={errors.tax_id}
                disabled={isSubmitting}
              />
            </Grid>

            {/* Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.type} disabled={isSubmitting} required>
                <InputLabel>Tipo</InputLabel>
                <Select value={formData.type} label='Tipo' onChange={e => handleInputChange('type', e.target.value)}>
                  {typeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Classification */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.classification} disabled={isSubmitting}>
                <InputLabel>Clasificación</InputLabel>
                <Select
                  value={formData.classification}
                  label='Clasificación'
                  onChange={e => handleInputChange('classification', e.target.value)}
                >
                  {classificationOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.classification && <FormHelperText>{errors.classification}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='email'
                label='Email'
                type='email'
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isSubmitting}
                required
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='phone'
                label='Teléfono'
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                disabled={isSubmitting}
                required
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='address'
                label='Dirección'
                multiline
                rows={2}
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address}
                disabled={isSubmitting}
                required
              />
            </Grid>

            {/* Registration Number */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='registration_number'
                label='Número de Registro'
                value={formData.registration_number}
                onChange={e => handleInputChange('registration_number', e.target.value)}
                error={!!errors.registration_number}
                helperText={errors.registration_number}
                disabled={isSubmitting}
              />
            </Grid>

            {/* Is Active */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={e => handleInputChange('is_active', e.target.checked)}
                    disabled={isSubmitting}
                  />
                }
                label='Proveedor activo'
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type='submit' variant='contained' disabled={isSubmitting} sx={{ minWidth: 120 }}>
          {isSubmitting ? 'Guardando...' : mode === 'edit' ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SupplierFormComponent
