'use client'

import { useState, useEffect } from 'react'
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
  Grid,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@mui/material'
import { useChartOfAccounts } from '../hooks/useChartOfAccounts'
import type { ChartOfAccount, CreateChartOfAccountRequest } from '../types'
import { ACCOUNT_TYPES } from '../constants/accountTypes'

interface ChartOfAccountsFormProps {
  open: boolean
  onClose: () => void
  account?: ChartOfAccount | null
  mode: 'create' | 'edit'
}

const ACCOUNT_LEVELS = ['1', '2', '3', '4', '5']

const initialFormData: CreateChartOfAccountRequest = {
  account_code: '',
  account_name: '',
  account_type: '',
  level: '1',
  is_active: true,
  description: ''
}

export const ChartOfAccountsForm = ({ open, onClose, account, mode }: ChartOfAccountsFormProps) => {
  const [formData, setFormData] = useState<CreateChartOfAccountRequest>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { createAccount, updateAccount, loading, error, validationErrors, clearError } = useChartOfAccounts()

  // Initialize form data when account changes
  useEffect(() => {
    if (mode === 'edit' && account) {
      setFormData({
        account_code: account.account_code,
        account_name: account.account_name,
        account_type: account.account_type,
        level: account.level.toString(),
        is_active: account.is_active,
        description: account.description || '',
        id: account.id
      })
    } else {
      setFormData(initialFormData)
    }
    setErrors({})
    clearError()
  }, [account, mode, open, clearError])

  const handleInputChange =
    (field: keyof CreateChartOfAccountRequest) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setFormData(prev => ({ ...prev, [field]: value }))

      // Clear error for this field
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    }

  const handleSelectChange = (field: keyof CreateChartOfAccountRequest) => (event: any) => {
    const value = event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSwitchChange =
    (field: keyof CreateChartOfAccountRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.checked
      setFormData(prev => ({ ...prev, [field]: value }))
    }

  // Función para obtener el error de un campo (local o del backend)
  const getFieldError = (field: keyof CreateChartOfAccountRequest): string => {
    // Priorizar errores locales de validación del frontend
    if (errors[field]) {
      return errors[field]
    }

    // Si no hay errores locales, mostrar errores del backend
    if (validationErrors && validationErrors[field]) {
      return validationErrors[field][0] // Mostrar el primer error del array
    }

    return ''
  }

  // Función para verificar si un campo tiene error
  const hasFieldError = (field: keyof CreateChartOfAccountRequest): boolean => {
    return !!(errors[field] || (validationErrors && validationErrors[field]))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.account_code.trim()) {
      newErrors.account_code = 'El código de cuenta es requerido'
    }

    if (!formData.account_name.trim()) {
      newErrors.account_name = 'El nombre de cuenta es requerido'
    }

    if (!formData.account_type) {
      newErrors.account_type = 'El tipo de cuenta es requerido'
    }

    if (!formData.level) {
      newErrors.level = 'El nivel es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      if (mode === 'create') {
        await createAccount(formData)
      } else if (mode === 'edit' && account) {
        await updateAccount(account.id, formData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving account:', error)
    }
  }

  const handleClose = () => {
    setFormData(initialFormData)
    setErrors({})
    clearError()
    onClose()
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
                onChange={handleInputChange('account_code')}
                error={hasFieldError('account_code')}
                helperText={getFieldError('account_code')}
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
                onChange={handleInputChange('account_name')}
                error={hasFieldError('account_name')}
                helperText={getFieldError('account_name')}
                required
              />
            </Grid>

            {/* Account Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={hasFieldError('account_type')}>
                <InputLabel required>Tipo de Cuenta</InputLabel>
                <Select
                  value={formData.account_type}
                  onChange={handleSelectChange('account_type')}
                  label='Tipo de Cuenta'
                >
                  {ACCOUNT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {hasFieldError('account_type') && (
                  <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.5 }}>
                    {getFieldError('account_type')}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Level */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={hasFieldError('level')}>
                <InputLabel required>Nivel</InputLabel>
                <Select value={formData.level} onChange={handleSelectChange('level')} label='Nivel'>
                  {ACCOUNT_LEVELS.map(level => (
                    <MenuItem key={level} value={level}>
                      Nivel {level}
                    </MenuItem>
                  ))}
                </Select>
                {hasFieldError('level') && (
                  <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.5 }}>
                    {getFieldError('level')}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Descripción'
                placeholder='Descripción opcional de la cuenta'
                value={formData.description}
                onChange={handleInputChange('description')}
                multiline
                rows={3}
              />
            </Grid>

            {/* Active Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={formData.is_active} onChange={handleSwitchChange('is_active')} />}
                label='Cuenta Activa'
              />
            </Grid>
          </Grid>

          {/* Error Display */}
          {error && (
            <Box mt={2}>
              <Typography color='error' variant='body2'>
                {error}
              </Typography>
            </Box>
          )}

          {/* Validation Errors Display - Errores generales no asociados a campos específicos */}
          {validationErrors &&
            Object.keys(validationErrors).some(
              key => !['account_code', 'account_name', 'account_type', 'level'].includes(key)
            ) && (
              <Box mt={2}>
                <Typography color='error' variant='body2' gutterBottom>
                  Errores de validación:
                </Typography>
                {Object.entries(validationErrors).map(([field, fieldErrors]) => {
                  // Solo mostrar errores que no sean de campos específicos ya manejados
                  if (['account_code', 'account_name', 'account_type', 'level'].includes(field)) {
                    return null
                  }
                  return (
                    <Typography key={field} color='error' variant='caption' display='block'>
                      • {fieldErrors.join(', ')}
                    </Typography>
                  )
                })}
              </Box>
            )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading.creating || loading.updating}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={loading.creating || loading.updating}
          startIcon={loading.creating || loading.updating ? <CircularProgress size={20} /> : null}
        >
          {mode === 'create' ? 'Crear Cuenta' : 'Actualizar Cuenta'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
