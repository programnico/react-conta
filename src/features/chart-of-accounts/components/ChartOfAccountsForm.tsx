// features/chart-of-accounts/components/ChartOfAccountsForm.tsx
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
  FormHelperText,
  CircularProgress
} from '@mui/material'
import { useChartOfAccountsRedux } from '../hooks/useChartOfAccountsRedux'
import { useChartOfAccountForm } from '../hooks/useChartOfAccountForm'
import type { ChartOfAccount, CreateChartOfAccountRequest } from '../types'
import { ACCOUNT_TYPES } from '../constants/accountTypes'

interface ChartOfAccountsFormProps {
  open: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSuccess: () => void
}

const ChartOfAccountsForm: React.FC<ChartOfAccountsFormProps> = ({ open, mode, onClose, onSuccess }) => {
  const { selectedAccount, loading, error, validationErrors, clearValidationErrors, createAccount, updateAccount } =
    useChartOfAccountsRedux()

  // Account levels
  const accountLevels = ['1', '2', '3', '4', '5']

  // Datos iniciales para el formulario
  const initialData = useMemo(() => {
    if (mode === 'edit' && selectedAccount) {
      return {
        account_code: selectedAccount.account_code,
        account_name: selectedAccount.account_name,
        account_type: selectedAccount.account_type,
        level: selectedAccount.level.toString(),
        is_active: selectedAccount.is_active,
        description: selectedAccount.description || ''
      }
    }
    return {}
  }, [mode, selectedAccount])

  // Función para manejar el envío del formulario
  const handleFormSubmit = async (data: CreateChartOfAccountRequest) => {
    try {
      if (mode === 'create') {
        await createAccount(data).unwrap()
      } else if (mode === 'edit' && selectedAccount) {
        await updateAccount({ id: selectedAccount.id, data }).unwrap()
      }
      onSuccess()
      onClose()
    } catch (error) {
      // Los errores se manejan automáticamente en Redux
      console.error('Error submitting form:', error)
    }
  }

  // Hook del formulario
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit, resetForm } = useChartOfAccountForm({
    initialData,
    onSubmit: handleFormSubmit,
    apiValidationErrors: validationErrors
  })

  // Limpiar errores cuando se abre el modal
  useEffect(() => {
    if (open) {
      clearValidationErrors()
    }
  }, [open, clearValidationErrors])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleInputFieldChange =
    (field: keyof CreateChartOfAccountRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(field, event.target.value)
    }

  const handleSelectFieldChange = (field: keyof CreateChartOfAccountRequest) => (event: any) => {
    handleInputChange(field, event.target.value)
  }

  const handleSwitchFieldChange =
    (field: keyof CreateChartOfAccountRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(field, event.target.checked)
    }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>{mode === 'create' ? 'Crear Nueva Cuenta' : 'Editar Cuenta'}</DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Account Code */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Código de Cuenta'
                placeholder='Ej: 1001'
                value={formData.account_code}
                onChange={handleInputFieldChange('account_code')}
                error={!!errors.account_code}
                helperText={errors.account_code}
                required
              />
            </Grid>

            {/* Account Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Nombre de Cuenta'
                placeholder='Ej: Caja General'
                value={formData.account_name}
                onChange={handleInputFieldChange('account_name')}
                error={!!errors.account_name}
                helperText={errors.account_name}
                required
              />
            </Grid>

            {/* Account Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.account_type}>
                <InputLabel required>Tipo de Cuenta</InputLabel>
                <Select
                  value={formData.account_type}
                  onChange={handleSelectFieldChange('account_type')}
                  label='Tipo de Cuenta'
                >
                  {ACCOUNT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.account_type && <FormHelperText>{errors.account_type}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Level */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.level}>
                <InputLabel required>Nivel</InputLabel>
                <Select value={formData.level} onChange={handleSelectFieldChange('level')} label='Nivel'>
                  {accountLevels.map(level => (
                    <MenuItem key={level} value={level}>
                      Nivel {level}
                    </MenuItem>
                  ))}
                </Select>
                {errors.level && <FormHelperText>{errors.level}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Descripción'
                placeholder='Descripción opcional de la cuenta'
                value={formData.description}
                onChange={handleInputFieldChange('description')}
                error={!!errors.description}
                helperText={errors.description}
                multiline
                rows={3}
              />
            </Grid>

            {/* Active Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={formData.is_active} onChange={handleSwitchFieldChange('is_active')} />}
                label='Cuenta Activa'
              />
            </Grid>
          </Grid>

          {/* Error Display */}
          {error && (
            <Box mt={2}>
              <Alert severity='error'>{error}</Alert>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading || isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading || isSubmitting}
          startIcon={loading || isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {mode === 'create' ? 'Crear Cuenta' : 'Actualizar Cuenta'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChartOfAccountsForm
export { ChartOfAccountsForm }
