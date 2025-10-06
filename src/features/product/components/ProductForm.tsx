// features/product/components/ProductForm.tsx
'use client'

import React, { useEffect } from 'react'
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
  CircularProgress
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import type { Product, CreateProductRequest } from '../types'

interface ProductFormProps {
  open: boolean
  product?: Product | null
  onClose: () => void
  onSubmit: (data: CreateProductRequest) => Promise<void>
  loading?: boolean
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  product_code: Yup.string()
    .required('El código del producto es requerido')
    .min(2, 'El código debe tener al menos 2 caracteres')
    .max(50, 'El código no puede exceder 50 caracteres'),
  category: Yup.string().required('La categoría es requerida'),
  stock_quantity: Yup.number()
    .required('La cantidad en stock es requerida')
    .min(0, 'La cantidad no puede ser negativa'),
  selling_price: Yup.number().required('El precio de venta es requerido').min(0.01, 'El precio debe ser mayor a 0'),
  cost_price: Yup.number().required('El precio de costo es requerido').min(0.01, 'El precio debe ser mayor a 0'),
  description: Yup.string().max(500, 'La descripción no puede exceder 500 caracteres'),
  image_url: Yup.string().url('Debe ser una URL válida').nullable()
})

const ProductFormComponent: React.FC<ProductFormProps> = ({ open, product, onClose, onSubmit, loading = false }) => {
  const isEditing = Boolean(product)

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

  const formik = useFormik<CreateProductRequest>({
    initialValues: {
      name: '',
      product_code: '',
      category: '',
      stock_quantity: 0,
      selling_price: 0,
      cost_price: 0,
      description: '',
      image_url: '',
      is_active: true
    },
    validationSchema,
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

  // Set form values when product prop changes
  useEffect(() => {
    if (product) {
      formik.setValues({
        id: product.id,
        name: product.name,
        product_code: product.product_code,
        category: product.category,
        stock_quantity: parseFloat(product.stock_quantity),
        selling_price: parseFloat(product.selling_price),
        cost_price: parseFloat(product.cost_price),
        description: product.description || '',
        image_url: product.image_url || '',
        is_active: product.is_active
      })
    } else {
      formik.resetForm()
    }
  }, [product])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: formik.handleSubmit
      }}
    >
      <DialogTitle>{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* Name */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='name'
                label='Nombre del producto'
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                required
              />
            </Grid>

            {/* Product Code */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='product_code'
                label='Código del producto'
                value={formik.values.product_code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.product_code && Boolean(formik.errors.product_code)}
                helperText={formik.touched.product_code && formik.errors.product_code}
                required
                placeholder='PROD-001'
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)} required>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name='category'
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label='Categoría'
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category && formik.errors.category && (
                  <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.5 }}>
                    {formik.errors.category}
                  </Box>
                )}
              </FormControl>
            </Grid>

            {/* Stock Quantity */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name='stock_quantity'
                label='Cantidad en stock'
                type='number'
                value={formik.values.stock_quantity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.stock_quantity && Boolean(formik.errors.stock_quantity)}
                helperText={formik.touched.stock_quantity && formik.errors.stock_quantity}
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
                value={formik.values.selling_price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.selling_price && Boolean(formik.errors.selling_price)}
                helperText={formik.touched.selling_price && formik.errors.selling_price}
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
                value={formik.values.cost_price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cost_price && Boolean(formik.errors.cost_price)}
                helperText={formik.touched.cost_price && formik.errors.cost_price}
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
                value={formik.values.image_url}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.image_url && Boolean(formik.errors.image_url)}
                helperText={formik.touched.image_url && formik.errors.image_url}
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
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                placeholder='Descripción detallada del producto...'
              />
            </Grid>

            {/* Is Active */}
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch name='is_active' checked={formik.values.is_active} onChange={formik.handleChange} />}
                label='Producto activo'
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type='submit'
          variant='contained'
          disabled={loading || !formik.isValid}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductFormComponent
