// features/purchase/components/PurchaseForm.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Alert
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import type { Purchase, CreatePurchaseRequest, PurchaseDetailFormData, Supplier, DocumentType } from '../types'

interface PurchaseFormProps {
  open: boolean
  purchase?: Purchase | null
  suppliers: Supplier[]
  loading?: boolean
  onSubmit: (data: CreatePurchaseRequest) => Promise<void>
  onClose: () => void
}

const initialDetailData: PurchaseDetailFormData = {
  description: '',
  quantity: 0,
  unit_price: 0,
  line_total: 0,
  tax_rate: 13, // Default tax rate
  tax_amount: 0,
  product_id: null,
  notes: ''
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: 'factura', label: 'Factura' },
  { value: 'recibo', label: 'Recibo' },
  { value: 'nota_credito', label: 'Nota de Crédito' },
  { value: 'nota_debito', label: 'Nota de Débito' }
]

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  open,
  purchase,
  suppliers,
  loading = false,
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    supplier_id: null as number | null,
    purchase_date: new Date().toISOString().split('T')[0],
    document_number: '',
    document_type: 'factura' as DocumentType,
    payment_terms: '30 días',
    due_date: '',
    notes: '',
    details: [{ ...initialDetailData }] as PurchaseDetailFormData[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = Boolean(purchase)

  // Initialize form with purchase data when editing
  useEffect(() => {
    if (purchase) {
      const dueDate = purchase.due_date ? new Date(purchase.due_date).toISOString().split('T')[0] : ''
      const purchaseDate = purchase.purchase_date ? new Date(purchase.purchase_date).toISOString().split('T')[0] : ''

      setFormData({
        supplier_id: purchase.supplier_id,
        purchase_date: purchaseDate,
        document_number: purchase.document_number,
        document_type: purchase.document_type as DocumentType,
        payment_terms: purchase.payment_terms,
        due_date: dueDate,
        notes: purchase.notes || '',
        details: purchase.details?.map(detail => ({
          description: detail.description,
          quantity: Number(detail.quantity),
          unit_price: Number(detail.unit_price),
          line_total: Number(detail.line_total),
          tax_rate: Number(detail.tax_rate),
          tax_amount: Number(detail.tax_amount),
          product_id: detail.product_id,
          notes: detail.notes || ''
        })) || [{ ...initialDetailData }]
      })
    } else {
      // Reset form for new purchase
      setFormData({
        supplier_id: null,
        purchase_date: new Date().toISOString().split('T')[0],
        document_number: '',
        document_type: 'factura',
        payment_terms: '30 días',
        due_date: '',
        notes: '',
        details: [{ ...initialDetailData }]
      })
    }
    setErrors({})
  }, [purchase, open])

  // Calculate line total when quantity or unit_price changes
  const calculateLineTotal = useCallback((detail: PurchaseDetailFormData) => {
    const lineTotal = detail.quantity * detail.unit_price
    const taxAmount = lineTotal * (detail.tax_rate / 100)
    return { lineTotal, taxAmount }
  }, [])

  // Update detail and recalculate totals
  const updateDetail = useCallback(
    (index: number, field: keyof PurchaseDetailFormData, value: any) => {
      setFormData(prev => {
        const newDetails = [...prev.details]
        newDetails[index] = { ...newDetails[index], [field]: value }

        // Recalculate totals if quantity, unit_price, or tax_rate changed
        if (field === 'quantity' || field === 'unit_price' || field === 'tax_rate') {
          const { lineTotal, taxAmount } = calculateLineTotal(newDetails[index])
          newDetails[index].line_total = lineTotal
          newDetails[index].tax_amount = taxAmount
        }

        return { ...prev, details: newDetails }
      })
    },
    [calculateLineTotal]
  )

  // Add new detail row
  const addDetail = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { ...initialDetailData }]
    }))
  }, [])

  // Remove detail row
  const removeDetail = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index)
    }))
  }, [])

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const subtotal = formData.details.reduce((sum, detail) => sum + detail.line_total, 0)
    const taxAmount = formData.details.reduce((sum, detail) => sum + detail.tax_amount, 0)
    const totalAmount = subtotal + taxAmount

    return { subtotal, taxAmount, totalAmount }
  }, [formData.details])

  const { subtotal, taxAmount, totalAmount } = calculateTotals()

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.supplier_id) newErrors.supplier_id = 'Proveedor es requerido'
    if (!formData.document_number.trim()) newErrors.document_number = 'Número de documento es requerido'
    if (!formData.purchase_date) newErrors.purchase_date = 'Fecha de compra es requerida'
    if (!formData.due_date) newErrors.due_date = 'Fecha de vencimiento es requerida'

    // Validate details
    formData.details.forEach((detail, index) => {
      if (!detail.description.trim()) {
        newErrors[`detail_${index}_description`] = 'Descripción es requerida'
      }
      if (detail.quantity <= 0) {
        newErrors[`detail_${index}_quantity`] = 'Cantidad debe ser mayor a 0'
      }
      if (detail.unit_price <= 0) {
        newErrors[`detail_${index}_unit_price`] = 'Precio unitario debe ser mayor a 0'
      }
    })

    if (formData.details.length === 0) {
      newErrors.details = 'Debe agregar al menos un detalle'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      const submitData: CreatePurchaseRequest = {
        supplier_id: formData.supplier_id!,
        purchase_date: formData.purchase_date,
        document_number: formData.document_number,
        document_type: formData.document_type,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_terms: formData.payment_terms,
        due_date: formData.due_date,
        notes: formData.notes || undefined,
        details: formData.details.map(detail => ({
          product_id: detail.product_id || null,
          description: detail.description,
          quantity: detail.quantity,
          unit_price: detail.unit_price,
          line_total: detail.line_total,
          tax_rate: detail.tax_rate,
          tax_amount: detail.tax_amount,
          notes: detail.notes || null
        }))
      }

      await onSubmit(submitData)
    } catch (error) {
      // Error is handled by parent component
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>{isEditing ? 'Editar Compra' : 'Nueva Compra'}</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Purchase Header Information */}
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                Información General
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(errors.supplier_id)}>
                <InputLabel>Proveedor *</InputLabel>
                <Select
                  value={formData.supplier_id || ''}
                  onChange={e => setFormData(prev => ({ ...prev, supplier_id: Number(e.target.value) }))}
                  label='Proveedor *'
                >
                  {suppliers.map(supplier => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name} - {supplier.business_name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.supplier_id && (
                  <Typography variant='caption' color='error'>
                    {errors.supplier_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Número de Documento *'
                value={formData.document_number}
                onChange={e => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
                error={Boolean(errors.document_number)}
                helperText={errors.document_number}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  value={formData.document_type}
                  onChange={e => setFormData(prev => ({ ...prev, document_type: e.target.value as DocumentType }))}
                  label='Tipo de Documento'
                >
                  {documentTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Fecha de Compra *'
                type='date'
                value={formData.purchase_date}
                onChange={e => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                error={Boolean(errors.purchase_date)}
                helperText={errors.purchase_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Términos de Pago'
                value={formData.payment_terms}
                onChange={e => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Fecha de Vencimiento *'
                type='date'
                value={formData.due_date}
                onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                error={Boolean(errors.due_date)}
                helperText={errors.due_date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label='Notas'
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>

            {/* Purchase Details */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h6'>Detalles de Compra</Typography>
                <Button startIcon={<AddIcon />} onClick={addDetail} variant='outlined' size='small'>
                  Agregar Detalle
                </Button>
              </Box>

              {errors.details && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {errors.details}
                </Alert>
              )}

              <TableContainer component={Paper} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Descripción *</TableCell>
                      <TableCell>Cantidad *</TableCell>
                      <TableCell>Precio Unit. *</TableCell>
                      <TableCell>Subtotal</TableCell>
                      <TableCell>% IVA</TableCell>
                      <TableCell>IVA</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.details.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            size='small'
                            fullWidth
                            value={detail.description}
                            onChange={e => updateDetail(index, 'description', e.target.value)}
                            error={Boolean(errors[`detail_${index}_description`])}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size='small'
                            type='number'
                            value={detail.quantity}
                            onChange={e => updateDetail(index, 'quantity', Number(e.target.value))}
                            error={Boolean(errors[`detail_${index}_quantity`])}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size='small'
                            type='number'
                            value={detail.unit_price}
                            onChange={e => updateDetail(index, 'unit_price', Number(e.target.value))}
                            error={Boolean(errors[`detail_${index}_unit_price`])}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell>{detail.line_total.toFixed(2)}</TableCell>
                        <TableCell>
                          <TextField
                            size='small'
                            type='number'
                            value={detail.tax_rate}
                            onChange={e => updateDetail(index, 'tax_rate', Number(e.target.value))}
                            inputProps={{ min: 0, max: 100, step: 0.01 }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>{detail.tax_amount.toFixed(2)}</TableCell>
                        <TableCell>{(detail.line_total + detail.tax_amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Tooltip title='Eliminar'>
                            <IconButton
                              size='small'
                              onClick={() => removeDetail(index)}
                              disabled={formData.details.length === 1}
                              color='error'
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Totals */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Box sx={{ minWidth: 300 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant='body2' align='right'>
                        Subtotal:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant='body2' align='right' fontWeight='medium'>
                        ${subtotal.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant='body2' align='right'>
                        IVA:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant='body2' align='right' fontWeight='medium'>
                        ${taxAmount.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant='h6' align='right'>
                        Total:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant='h6' align='right' fontWeight='bold'>
                        ${totalAmount.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant='contained' disabled={loading || totalAmount <= 0}>
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'} Compra
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PurchaseForm
