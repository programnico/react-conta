// features/product/components/ProductForm.tsx
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
  InputAdornment,
  Box,
  Alert,
  FormHelperText
} from '@mui/material'
import { useProductsRedux } from '../hooks/useProductsRedux'
import { useProductForm } from '../hooks/useProductForm'
import type { Product, CreateProductRequest } from '../types'

interface ProductFormProps {
  open: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  onSuccess: () => void
}

const ProductFormComponent: React.FC<ProductFormProps> = ({ open, mode, onClose, onSuccess }) => {
  const { selectedProduct, loading, error, validationErrors, clearValidationErrors, createProduct, updateProduct } =
    useProductsRedux()

  // Common categories
  const categories = [
    'Celular',
    'Laptop',
    'Tablet',
    'Computadora',
    'Accesorio',
    'Papelería',
    'Oficina',
    'Hogar',
    'Electrónico',
    'Otros'
  ]

  const initialData = useMemo(() => {
    if (mode === 'edit' && selectedProduct) {
      return {
        name: selectedProduct.name,
        product_code: selectedProduct.product_code,
        category: selectedProduct.category,
        stock_quantity: parseFloat(selectedProduct.stock_quantity),
        selling_price: parseFloat(selectedProduct.selling_price),
        cost_price: parseFloat(selectedProduct.cost_price),
        description: selectedProduct.description || '',
        image_url: selectedProduct.image_url || '',
        is_active: selectedProduct.is_active
      }
    }
    return undefined
  }, [
    mode,
    selectedProduct?.name,
    selectedProduct?.product_code,
    selectedProduct?.category,
    selectedProduct?.stock_quantity,
    selectedProduct?.selling_price,
    selectedProduct?.cost_price,
    selectedProduct?.description,
    selectedProduct?.image_url,
    selectedProduct?.is_active
  ])

  // Limpiar errores de validación cuando se abre el formulario
  useEffect(() => {
    clearValidationErrors()
  }, [clearValidationErrors])

  const handleFormSubmit = async (formData: CreateProductRequest) => {
    try {
      if (mode === 'create') {
        await createProduct(formData).unwrap()
        // Limpiar el formulario después de crear exitosamente
        // Pequeño delay para mejor UX
        setTimeout(() => {
          resetForm()
        }, 100)
      } else if (selectedProduct) {
        await updateProduct({
          id: selectedProduct.id,
          data: formData
        }).unwrap()
      }

      // El ProductsTable se refrescará automáticamente
      onSuccess()
    } catch (error) {
      // El error se maneja en el slice
    }
  }

  const { formData, errors, isSubmitting, handleInputChange, handleSubmit, resetForm } = useProductForm({
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
      <DialogTitle>{mode === 'edit' ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='name'
                label='Nombre del producto'
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={isSubmitting}
                required
              />
            </Grid>

            {/* Product Code */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='product_code'
                label='Código del producto'
                value={formData.product_code}
                onChange={e => handleInputChange('product_code', e.target.value)}
                error={!!errors.product_code}
                helperText={errors.product_code}
                disabled={isSubmitting}
                required
                placeholder='PROD-001'
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.category} disabled={isSubmitting} required>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.category}
                  label='Categoría'
                  onChange={e => handleInputChange('category', e.target.value)}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Stock Quantity */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='stock_quantity'
                label='Cantidad en stock'
                type='number'
                value={formData.stock_quantity}
                onChange={e => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                error={!!errors.stock_quantity}
                helperText={errors.stock_quantity}
                disabled={isSubmitting}
                required
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>

            {/* Selling Price */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='selling_price'
                label='Precio de venta'
                type='number'
                value={formData.selling_price}
                onChange={e => handleInputChange('selling_price', parseFloat(e.target.value) || 0)}
                error={!!errors.selling_price}
                helperText={errors.selling_price}
                disabled={isSubmitting}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>
                }}
              />
            </Grid>

            {/* Cost Price */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='cost_price'
                label='Precio de costo'
                type='number'
                value={formData.cost_price}
                onChange={e => handleInputChange('cost_price', parseFloat(e.target.value) || 0)}
                error={!!errors.cost_price}
                helperText={errors.cost_price}
                disabled={isSubmitting}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>
                }}
              />
            </Grid>

            {/* Image URL */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='image_url'
                label='URL de la imagen'
                value={formData.image_url}
                onChange={e => handleInputChange('image_url', e.target.value)}
                error={!!errors.image_url}
                helperText={errors.image_url}
                disabled={isSubmitting}
                placeholder='https://ejemplo.com/imagen.jpg'
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name='description'
                label='Descripción'
                multiline
                rows={3}
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                disabled={isSubmitting}
                placeholder='Descripción detallada del producto...'
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
                label='Producto activo'
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

export default ProductFormComponent
