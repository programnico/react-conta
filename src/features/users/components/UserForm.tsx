'use client'

import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  FormHelperText,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { RootState, AppDispatch } from '@/store'
import { createUser, updateUser, fetchUsers, clearValidationErrors } from '@/store/slices/usersSlice'
import { useUserForm } from '../hooks/useUserForm'
import { ROLE_OPTIONS } from '../constants/roles'
import { UserFormData } from '../types'

interface UserFormProps {
  mode: 'create' | 'edit'
  onSuccess: () => void
  currentPage?: number
  rowsPerPage?: number
}

export const UserForm: React.FC<UserFormProps> = ({ mode, onSuccess, currentPage = 1, rowsPerPage = 15 }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedUser, loading, error, validationErrors } = useSelector((state: RootState) => state.users)
  const [showPassword, setShowPassword] = React.useState(false)

  const initialData =
    mode === 'edit' && selectedUser
      ? {
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.roles[0]?.name || 'user',
          password: ''
        }
      : undefined

  // Limpiar errores de validación cuando se abre el formulario
  React.useEffect(() => {
    dispatch(clearValidationErrors())
  }, [dispatch])

  const handleFormSubmit = async (formData: UserFormData) => {
    try {
      if (mode === 'create') {
        await dispatch(createUser(formData)).unwrap()
      } else if (selectedUser) {
        await dispatch(
          updateUser({
            id: selectedUser.id,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            ...(formData.password && { password: formData.password })
          })
        ).unwrap()
      }

      // Refrescar la lista manteniendo la página actual
      dispatch(fetchUsers({ page: currentPage, per_page: rowsPerPage }))
      onSuccess()
    } catch (error) {
      // El error se maneja en el slice
    }
  }

  const { formData, errors, isSubmitting, handleInputChange, handleSubmit, resetForm } = useUserForm({
    initialData,
    onSubmit: handleFormSubmit,
    apiValidationErrors: validationErrors
  })

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Nombre completo'
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isSubmitting}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
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

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={mode === 'edit' ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={e => handleInputChange('password', e.target.value)}
            error={!!errors.password}
            helperText={errors.password || (mode === 'edit' ? 'Deja vacío para mantener la contraseña actual' : '')}
            disabled={isSubmitting}
            required={mode === 'create'}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={togglePasswordVisibility} edge='end' tabIndex={-1}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.role} disabled={isSubmitting}>
            <InputLabel>Rol</InputLabel>
            <Select
              value={formData.role}
              label='Rol'
              onChange={e => handleInputChange('role', e.target.value)}
              required
            >
              {ROLE_OPTIONS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box display='flex' gap={2} justifyContent='flex-end'>
            <Button type='button' variant='outlined' onClick={resetForm} disabled={isSubmitting}>
              Limpiar
            </Button>
            <Button type='submit' variant='contained' disabled={isSubmitting} sx={{ minWidth: 120 }}>
              {isSubmitting ? 'Procesando...' : mode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
