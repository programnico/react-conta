// features/admin/roles/components/RoleForm.tsx
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
  Chip,
  Box,
  Typography,
  Alert,
  Grid,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material'
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material'
import { ValidationUtils } from '@/shared/utils/validation'
import type { Role, Permission, RoleFormData } from '../types'

interface RoleFormProps {
  open: boolean
  role?: Role | null
  permissions: Permission[]
  loading?: boolean
  onSubmit: (data: RoleFormData) => void
  onClose: () => void
}

export function RoleForm({ open, role, permissions, loading = false, onSubmit, onClose }: RoleFormProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    guard_name: 'api',
    permissions: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        id: role.id,
        name: role.name,
        guard_name: role.guard_name,
        permissions: role.permissions.map(p => p.name)
      })
    } else {
      setFormData({
        name: '',
        guard_name: 'api',
        permissions: []
      })
    }
    setErrors({})
  }, [role, open])

  const handleInputChange = (field: keyof RoleFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const validationResult = ValidationUtils.validateFields({
      name: () => ValidationUtils.validateRequired(formData.name, 'Nombre del rol'),
      guard_name: () => ValidationUtils.validateRequired(formData.guard_name, 'Guard name'),
      permissions: () => {
        if (formData.permissions.length === 0) {
          return { isValid: false, message: 'Debe seleccionar al menos un permiso' }
        }
        return { isValid: true }
      }
    })

    setErrors(validationResult.errors)
    return validationResult.isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      guard_name: 'api',
      permissions: []
    })
    setErrors({})
    onClose()
  }

  const isEditing = Boolean(role)
  const selectedPermissions = formData.permissions

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
      <DialogTitle>{isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Nombre del Rol'
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
              disabled={loading}
              placeholder='Ej: Administrator, Editor, Viewer'
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(errors.guard_name)}>
              <InputLabel>Guard Name</InputLabel>
              <Select
                value={formData.guard_name}
                onChange={e => handleInputChange('guard_name', e.target.value)}
                label='Guard Name'
                disabled={loading}
              >
                <MenuItem value='api'>API</MenuItem>
                <MenuItem value='web'>Web</MenuItem>
              </Select>
              {errors.guard_name && (
                <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.guard_name}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={Boolean(errors.permissions)}>
              <InputLabel>Permisos</InputLabel>
              <Select
                multiple
                value={selectedPermissions}
                onChange={e => {
                  const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                  handleInputChange('permissions', value)
                }}
                input={<OutlinedInput label='Permisos' />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => (
                      <Chip key={value} label={value} size='small' color='primary' variant='outlined' />
                    ))}
                  </Box>
                )}
                disabled={loading}
              >
                {permissions.map(permission => (
                  <MenuItem key={permission.id} value={permission.name}>
                    <Checkbox checked={selectedPermissions.indexOf(permission.name) > -1} />
                    <ListItemText primary={permission.name} secondary={`ID: ${permission.id}`} />
                  </MenuItem>
                ))}
              </Select>
              {errors.permissions && (
                <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.permissions}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {selectedPermissions.length > 0 && (
            <Grid item xs={12}>
              <Alert severity='info'>
                <Typography variant='body2'>
                  <strong>Permisos seleccionados:</strong> {selectedPermissions.length} de {permissions.length}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedPermissions.map(permission => (
                    <Chip key={permission} label={permission} size='small' color='info' variant='filled' />
                  ))}
                </Box>
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading} startIcon={<CancelIcon />}>
          Cancelar
        </Button>

        <Button type='submit' variant='contained' disabled={loading} startIcon={<SaveIcon />}>
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RoleForm
