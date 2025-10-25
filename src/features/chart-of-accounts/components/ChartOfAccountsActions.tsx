'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Card,
  CardContent,
  Grid
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useChartOfAccounts } from '../hooks/useChartOfAccounts'
import { ChartOfAccountsForm } from './ChartOfAccountsForm'
import type { ChartOfAccount } from '../types'

interface ChartOfAccountsActionsProps {
  selectedAccount?: ChartOfAccount | null
  onAccountUpdated?: () => void
}

export const ChartOfAccountsActions = ({ selectedAccount, onAccountUpdated }: ChartOfAccountsActionsProps) => {
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<ChartOfAccount | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<ChartOfAccount | null>(null)

  const { deleteAccount, loading } = useChartOfAccounts()

  const handleCreateNew = () => {
    setAccountToEdit(null)
    setFormMode('create')
    setFormOpen(true)
  }

  const handleEdit = (account: ChartOfAccount) => {
    setAccountToEdit(account)
    setFormMode('edit')
    setFormOpen(true)
  }

  const handleDelete = (account: ChartOfAccount) => {
    setAccountToDelete(account)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id)
        setDeleteDialogOpen(false)
        setAccountToDelete(null)
        onAccountUpdated?.()
      } catch (error) {
        // Error handled by global error handling
      }
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setAccountToEdit(null)
    onAccountUpdated?.()
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Typography variant='h6'>Acciones</Typography>

            <Box display='flex' gap={2}>
              <Button variant='contained' startIcon={<AddIcon />} onClick={handleCreateNew}>
                Nueva Cuenta
              </Button>
            </Box>
          </Box>

          {selectedAccount && (
            <Box mt={3}>
              <Typography variant='subtitle1' gutterBottom>
                Cuenta Seleccionada: {selectedAccount.account_name}
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button variant='outlined' onClick={() => handleEdit(selectedAccount)}>
                    Editar
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant='outlined'
                    color='error'
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(selectedAccount)}
                    disabled={selectedAccount.child_accounts && selectedAccount.child_accounts.length > 0}
                  >
                    Eliminar
                  </Button>
                </Grid>
              </Grid>

              {selectedAccount.child_accounts && selectedAccount.child_accounts.length > 0 && (
                <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                  Esta cuenta tiene subcuentas y no puede ser eliminada
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <ChartOfAccountsForm open={formOpen} onClose={handleFormClose} account={accountToEdit} mode={formMode} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro que deseas eliminar la cuenta "{accountToDelete?.account_name}"?</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color='error' variant='contained' disabled={loading.deleting}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
