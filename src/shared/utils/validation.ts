// shared/utils/validation.ts
import { VALIDATION } from '@/shared/constants'

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export class ValidationUtils {
  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    if (!email?.trim()) {
      return { isValid: false, message: 'El email es requerido' }
    }

    if (!VALIDATION.EMAIL_REGEX.test(email.trim())) {
      return { isValid: false, message: 'Formato de email inválido' }
    }

    return { isValid: true }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationResult {
    if (!password) {
      return { isValid: false, message: 'La contraseña es requerida' }
    }

    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      return {
        isValid: false,
        message: `La contraseña debe tener al menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`
      }
    }

    // Check for at least one number and one letter
    const hasNumber = /\d/.test(password)
    const hasLetter = /[a-zA-Z]/.test(password)

    if (!hasNumber || !hasLetter) {
      return {
        isValid: false,
        message: 'La contraseña debe contener al menos una letra y un número'
      }
    }

    return { isValid: true }
  }

  /**
   * Validate required field
   */
  static validateRequired(value: any, fieldName: string): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, message: `${fieldName} es requerido` }
    }

    if (typeof value === 'string' && !value.trim()) {
      return { isValid: false, message: `${fieldName} es requerido` }
    }

    return { isValid: true }
  }

  /**
   * Validate file upload
   */
  static validateFile(file: File): ValidationResult {
    if (!file) {
      return { isValid: false, message: 'Debe seleccionar un archivo' }
    }

    if (file.size > VALIDATION.MAX_FILE_SIZE) {
      return {
        isValid: false,
        message: 'El archivo es demasiado grande. Máximo 5MB'
      }
    }

    if ((VALIDATION.SUPPORTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return { isValid: true }
    }

    return {
      isValid: false,
      message: 'Tipo de archivo no soportado. Use JPG, PNG o WebP'
    }
  }

  /**
   * Validate multiple fields at once
   */
  static validateFields(validations: { [key: string]: () => ValidationResult }): {
    isValid: boolean
    errors: { [key: string]: string }
  } {
    const errors: { [key: string]: string } = {}
    let isValid = true

    Object.entries(validations).forEach(([field, validator]) => {
      const result = validator()
      if (!result.isValid && result.message) {
        errors[field] = result.message
        isValid = false
      }
    })

    return { isValid, errors }
  }
}

export default ValidationUtils
