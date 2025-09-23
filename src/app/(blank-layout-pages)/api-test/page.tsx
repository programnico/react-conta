'use client'

import { useState } from 'react'
import { api, getApiUrl } from '@/utils/api'

const ApiTestPage = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const testDirectApiClient = async () => {
    setLoading(true)
    setResult('Iniciando prueba...')

    try {
      console.clear() // Limpiar consola para mejor visualización
      console.log('🧪 === PRUEBA API CLIENT ===')

      const apiBaseUrl = getApiUrl()
      console.log('🌍 API Base URL:', apiBaseUrl)

      const endpoint = '/authentication'
      console.log('🔗 Endpoint:', endpoint)
      console.log('🎯 URL final esperada:', `${apiBaseUrl}${endpoint}`)

      const testData = {
        identity: 'test@test.com',
        password: 'password123'
      }
      console.log('📦 Data to send:', testData)

      console.log('⏳ Calling api.postFormData...')

      const response = await api.postFormData('/authentication', testData)

      console.log('✅ Respuesta recibida:', response)
      setResult(`✅ ÉXITO:\n${JSON.stringify(response, null, 2)}`)
    } catch (error) {
      console.error('❌ Error capturado:', error)
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')

      const errorMessage = error instanceof Error ? error.message : String(error)
      setResult(`❌ ERROR:\n${errorMessage}\n\nRevisa la consola para más detalles.`)
    }

    setLoading(false)
  }

  return (
    <div className='p-8'>
      <h1 className='text-2xl mb-6'>🧪 API Client Test Isolado</h1>

      <div className='mb-6 bg-blue-50 p-4 rounded'>
        <h3 className='font-bold mb-2'>📋 Esta prueba:</h3>
        <ul className='list-disc pl-6 text-sm'>
          <li>
            Llama directamente a <code>api.postFormData('/authentication', data)</code>
          </li>
          <li>Muestra logs detallados en la consola</li>
          <li>No tiene otras interferencias</li>
        </ul>
      </div>

      <div className='mb-6'>
        <button
          onClick={testDirectApiClient}
          disabled={loading}
          className='bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded font-medium'
        >
          {loading ? '⏳ Probando API Client...' : '🚀 Probar API Client'}
        </button>
      </div>

      <div className='bg-gray-100 p-4 rounded'>
        <h3 className='font-bold mb-2'>📋 Resultado:</h3>
        <pre className='whitespace-pre-wrap text-sm overflow-auto max-h-96'>{result || 'No hay resultados aún...'}</pre>
      </div>

      <div className='mt-6 bg-yellow-50 p-4 rounded border-l-4 border-yellow-400'>
        <h4 className='font-bold text-yellow-800 mb-2'>💡 Instrucciones:</h4>
        <ol className='text-yellow-700 text-sm list-decimal pl-6'>
          <li>Abre las herramientas de desarrollador (F12)</li>
          <li>Ve a la pestaña "Console"</li>
          <li>Haz clic en el botón "Probar API Client"</li>
          <li>Observa los logs detallados en la consola</li>
        </ol>
      </div>
    </div>
  )
}

export default ApiTestPage
