'use client'

// Component Imports
import AuthExample from '@/components/auth/AuthExample'

const AuthTestPage = () => {
  return (
    <div className='min-h-screen bg-gray-100 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='text-3xl font-bold text-center mb-8'>Sistema de Autenticación - Pruebas</h1>
        <AuthExample />
      </div>
    </div>
  )
}

export default AuthTestPage
