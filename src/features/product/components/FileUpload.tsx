// features/product/components/FileUpload.tsx
'use client'

import React, { useCallback, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Chip,
  Alert
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material'

interface FileUploadProps {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  error?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onChange,
  disabled = false,
  maxFiles = 10,
  maxSize = 10, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
  error
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const validateFiles = (fileList: FileList | File[]): { valid: File[]; errors: string[] } => {
    const filesArray = Array.from(fileList)
    const valid: File[] = []
    const errors: string[] = []

    // Validar cantidad de archivos
    if (files.length + filesArray.length > maxFiles) {
      errors.push(`Solo puedes subir un máximo de ${maxFiles} archivos`)
      return { valid, errors }
    }

    filesArray.forEach(file => {
      // Validar tamaño
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name} excede el tamaño máximo de ${maxSize}MB`)
        return
      }

      // Validar tipo (opcional, ya que acceptedTypes puede ser muy permisivo)
      // Esta validación se puede hacer más estricta según necesidades

      valid.push(file)
    })

    return { valid, errors }
  }

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      setUploadError(null)

      const { valid, errors } = validateFiles(fileList)

      if (errors.length > 0) {
        setUploadError(errors.join('. '))
        return
      }

      if (valid.length > 0) {
        const newFiles = [...files, ...valid]
        onChange(newFiles)
      }
    },
    [files, onChange, maxFiles, maxSize]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled) return

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [disabled, handleFiles]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles]
  )

  const handleRemoveFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index)
      onChange(newFiles)
      setUploadError(null)
    },
    [files, onChange]
  )

  return (
    <Box>
      {/* Drag & Drop Area */}
      <Paper
        elevation={0}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: dragActive ? '2px dashed' : '2px dashed',
          borderColor: dragActive ? 'primary.main' : error ? 'error.main' : 'divider',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: disabled ? 'divider' : 'primary.main',
            backgroundColor: disabled ? 'background.paper' : 'action.hover'
          }
        }}
      >
        <input
          type='file'
          id='file-upload-input'
          multiple
          onChange={handleChange}
          disabled={disabled}
          accept={acceptedTypes.join(',')}
          style={{ display: 'none' }}
        />
        <label htmlFor='file-upload-input' style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <CloudUploadIcon sx={{ fontSize: 48, color: dragActive ? 'primary.main' : 'action.active' }} />
            <Typography variant='body1' fontWeight={500}>
              {dragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos aquí o haz clic para seleccionar'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Máximo {maxFiles} archivos • Tamaño máximo {maxSize}MB por archivo
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
              <Chip label='Imágenes' size='small' variant='outlined' />
              <Chip label='PDF' size='small' variant='outlined' />
              <Chip label='Word' size='small' variant='outlined' />
              <Chip label='Excel' size='small' variant='outlined' />
            </Box>
          </Box>
        </label>
      </Paper>

      {/* Error Messages */}
      {(error || uploadError) && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error || uploadError}
        </Alert>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant='subtitle2' sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachFileIcon fontSize='small' />
            Archivos adjuntos ({files.length})
          </Typography>
          <List
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {files.map((file, index) => (
              <ListItem
                key={`${file.name}-${index}`}
                sx={{
                  '&:not(:last-child)': {
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }
                }}
              >
                <FileIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { maxWidth: '70%' }
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge='end'
                    aria-label='delete'
                    onClick={() => handleRemoveFile(index)}
                    disabled={disabled}
                    size='small'
                    color='error'
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  )
}

export default FileUpload
