// components/pagination/SmartPagination.tsx
'use client'

import React from 'react'
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  Typography,
  Stack,
  IconButton,
  useTheme,
  alpha
} from '@mui/material'
import { FirstPage, LastPage, ChevronLeft, ChevronRight, MoreHoriz } from '@mui/icons-material'

interface SmartPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  perPageOptions?: number[]
  disabled?: boolean
  showPageInfo?: boolean
  pageWindow?: number // Número de páginas a mostrar alrededor de la actual
}

export const SmartPagination: React.FC<SmartPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 15, 25, 50, 100],
  disabled = false,
  showPageInfo = true,
  pageWindow = 3
}) => {
  const theme = useTheme()

  // Calcular información de elementos mostrados
  const startItem = Math.min((currentPage - 1) * perPage + 1, totalItems)
  const endItem = Math.min(currentPage * perPage, totalItems)

  // Función para generar los números de página a mostrar
  const generatePageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= 7) {
      // Si hay 7 o menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para páginas con ellipsis
      const start = Math.max(1, currentPage - pageWindow)
      const end = Math.min(totalPages, currentPage + pageWindow)

      // Siempre mostrar la primera página
      if (start > 1) {
        pages.push(1)
        if (start > 2) {
          pages.push('ellipsis')
        }
      }

      // Páginas alrededor de la actual
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Siempre mostrar la última página
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('ellipsis')
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !disabled) {
      onPageChange(page)
    }
  }

  const handlePerPageChange = (event: any) => {
    if (!disabled) {
      onPerPageChange(Number(event.target.value))
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: theme.palette.background.paper
      }}
    >
      {/* Información de elementos (izquierda) */}
      {showPageInfo && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          <Typography variant='body2' color='text.secondary' noWrap>
            {totalItems > 0 ? `${startItem}-${endItem} de ${totalItems} elementos` : 'No hay elementos'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='body2' color='text.secondary' whiteSpace='nowrap'>
              Por página:
            </Typography>
            <FormControl size='small' sx={{ minWidth: 80 }}>
              <Select value={perPage} onChange={handlePerPageChange} disabled={disabled} sx={{ fontSize: '0.875rem' }}>
                {perPageOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      {/* Navegación de páginas (centro/derecha) */}
      {totalPages > 1 && (
        <Stack direction='row' spacing={0.5} alignItems='center'>
          {/* Primera página */}
          <IconButton
            onClick={() => handlePageClick(1)}
            disabled={disabled || currentPage === 1}
            size='small'
            sx={{ minWidth: 40 }}
          >
            <FirstPage fontSize='small' />
          </IconButton>

          {/* Página anterior */}
          <IconButton
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            size='small'
            sx={{ minWidth: 40 }}
          >
            <ChevronLeft fontSize='small' />
          </IconButton>

          {/* Números de página */}
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <IconButton key={`ellipsis-${index}`} disabled size='small' sx={{ minWidth: 40 }}>
                  <MoreHoriz fontSize='small' />
                </IconButton>
              )
            }

            const isActive = page === currentPage

            return (
              <Button
                key={page}
                onClick={() => handlePageClick(page)}
                disabled={disabled}
                size='small'
                variant={isActive ? 'contained' : 'text'}
                sx={{
                  minWidth: 40,
                  height: 40,
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
                  color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: isActive ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.08)
                  },
                  '&.Mui-disabled': {
                    color: theme.palette.text.disabled
                  }
                }}
              >
                {page}
              </Button>
            )
          })}

          {/* Página siguiente */}
          <IconButton
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            size='small'
            sx={{ minWidth: 40 }}
          >
            <ChevronRight fontSize='small' />
          </IconButton>

          {/* Última página */}
          <IconButton
            onClick={() => handlePageClick(totalPages)}
            disabled={disabled || currentPage === totalPages}
            size='small'
            sx={{ minWidth: 40 }}
          >
            <LastPage fontSize='small' />
          </IconButton>
        </Stack>
      )}
    </Box>
  )
}

export default SmartPagination
