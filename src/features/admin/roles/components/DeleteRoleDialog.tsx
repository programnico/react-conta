// features/admin/roles/components/DeleteRoleDialog.tsx
'use client'

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert, Box, Chip } from '@mui/material'
import { Warning as WarningIcon, Delete as DeleteIcon, Cancel as CancelIcon } from '@mui/icons-material'
import type { Role } from '../types'

interface DeleteRoleDialogProps {
  open: boolean
  role: Role | null
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteRoleDialog({ open, role, loading = false, onConfirm, onCancel }: DeleteRoleDialogProps) {
  if (!role) return null

  const hasUsers = role.users.length > 0
  const canDelete = !hasUsers

  return (
    <Dialog open={open} onClose={onCancel} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
        <WarningIcon />
        Confirmar Eliminación
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant='body1' gutterBottom>
          ¿Está seguro de que desea eliminar el rol <strong>"{role.name}"</strong>?
        </Typography>

        {hasUsers ? (
          <Alert severity='error' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              <strong>No se puede eliminar este rol</strong> porque tiene usuarios asignados.
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {role.users.slice(0, 5).map(user => (
                <Chip key={user.id} label={user.name} size='small' color='error' variant='outlined' />
              ))}
              {role.users.length > 5 && (
                <Chip label={`+${role.users.length - 5} más`} size='small' color='error' variant='outlined' />
              )}
            </Box>
          </Alert>
        ) : (
          <>
            <Alert severity='warning' sx={{ mt: 2 }}>
              <Typography variant='body2'>Esta acción no se puede deshacer. Se eliminará permanentemente:</Typography>
              <Box component='ul' sx={{ mt: 1, mb: 0 }}>
                <li>El rol "{role.name}"</li>
                <li>Todos los permisos asociados ({role.permissions.length} permisos)</li>
                <li>Las referencias en el sistema</li>
              </Box>
            </Alert>

            {role.permissions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Permisos que se eliminarán:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {role.permissions.slice(0, 10).map(permission => (
                    <Chip key={permission.id} label={permission.name} size='small' color='warning' variant='outlined' />
                  ))}
                  {role.permissions.length > 10 && (
                    <Chip
                      label={`+${role.permissions.length - 10} más`}
                      size='small'
                      color='warning'
                      variant='outlined'
                    />
                  )}
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} disabled={loading} startIcon={<CancelIcon />}>
          Cancelar
        </Button>

        {canDelete && (
          <Button onClick={onConfirm} color='error' variant='contained' disabled={loading} startIcon={<DeleteIcon />}>
            {loading ? 'Eliminando...' : 'Eliminar Rol'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default DeleteRoleDialog
