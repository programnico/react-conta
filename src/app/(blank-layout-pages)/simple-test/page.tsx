'use client'

import { useState } from 'react'
import { AuthService } from '@/services/authService'
import { api } from '@/utils/api'

const SimpleTest = () => {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  // Test directo con fetch
  const testDirectFetch = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('identity', 'test@test.com')
      formData.append('password', 'password123')

      console.log('🧪 Testing Direct Fetch...')

      const response = await fetch('http://127.0.0.1:8000/api/auth/authentication', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      console.log('✅ Direct Fetch Response:', data)
      setResult(`🔄 DIRECT FETCH RESULT:\n${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      console.error('❌ Direct Fetch Error:', error)
      setResult(`❌ Direct Fetch Error: ${String(error)}`)
    }
    setLoading(false)
  }

  // Test con nuestro cliente API
  const testApiClient = async () => {
    setLoading(true)
    try {
      console.log('🧪 Testing API Client...')
      console.log('🔗 Using endpoint: /authentication')
      console.log('📦 Data to send:', { identity: 'test@test.com', password: 'password123' })

      const data = await api.postFormData('/authentication', {
        identity: 'test@test.com',
        password: 'password123'
      })

      console.log('✅ API Client Response:', data)
      setResult(`🔄 API CLIENT RESULT:\n${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      console.error('❌ API Client Error:', error)
      setResult(`❌ API Client Error: ${error instanceof Error ? error.message : String(error)}`)
    }
    setLoading(false)
  }

  // Test con AuthService
  const testAuthService = async () => {
    setLoading(true)
    try {
      console.log('🧪 Testing Auth Service...')

      const response = await AuthService.login({
        identity: 'test@test.com',
        password: 'password123'
      })

      console.log('✅ Auth Service Response:', response)
      setResult(`🔄 AUTH SERVICE RESULT:\n${JSON.stringify(response, null, 2)}`)
    } catch (error) {
      console.error('❌ Auth Service Error:', error)
      setResult(`❌ Auth Service Error: ${String(error)}`)
    }
    setLoading(false)
  }

  return (
    <div className='p-8'>
      <h1 className='text-2xl mb-6'>🧪 API Test - Comparación de Métodos</h1>

      <div className='mb-6'>
        <p className='mb-4 text-gray-600'>Esta página prueba la API de autenticación con tres métodos diferentes:</p>
        <ul className='list-disc pl-6 text-gray-600 mb-4'>
          <li>Fetch directo (sin procesamiento)</li>
          <li>Cliente API personalizado (con procesamiento de respuesta)</li>
          <li>Servicio de autenticación (con validaciones)</li>
        </ul>
      </div>

      <div className='flex gap-4 mb-6'>
        <button
          onClick={testDirectFetch}
          disabled={loading}
          className='bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded'
        >
          {loading ? '⏳ Probando...' : '🔗 Test Fetch Directo'}
        </button>

        <button
          onClick={testApiClient}
          disabled={loading}
          className='bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded'
        >
          {loading ? '⏳ Probando...' : '⚙️ Test API Client'}
        </button>

        <button
          onClick={testAuthService}
          disabled={loading}
          className='bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded'
        >
          {loading ? '⏳ Probando...' : '🔐 Test Auth Service'}
        </button>
      </div>

      <div className='bg-gray-100 p-4 rounded'>
        <h3 className='font-bold mb-2'>📋 Resultados:</h3>
        <pre className='overflow-auto text-sm whitespace-pre-wrap'>
          {result || 'No hay resultados aún... Haz clic en uno de los botones para probar.'}
        </pre>
      </div>

      <div className='mt-6 bg-yellow-50 p-4 rounded border-l-4 border-yellow-400'>
        <h4 className='font-bold text-yellow-800 mb-2'>💡 Consola del Navegador:</h4>
        <p className='text-yellow-700 text-sm'>
          Abre las herramientas de desarrollador (F12) y revisa la pestaña "Console" para ver más detalles del proceso.
        </p>
      </div>
    </div>
  )
}

export default SimpleTest
