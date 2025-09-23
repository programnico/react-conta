'use client'

import { getApiUrl } from '@/utils/api'

const DebugEnv = () => {
  const apiUrl = getApiUrl()

  return (
    <div className='p-8'>
      <h1 className='text-2xl mb-6'>🔍 Debug Environment Variables</h1>

      <div className='bg-gray-100 p-4 rounded mb-4'>
        <h3 className='font-bold mb-2'>🌍 Environment Variables:</h3>
        <pre className='text-sm'>
          {`NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL || 'undefined'}
API_URL: ${process.env.API_URL || 'undefined'}
NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`}
        </pre>
      </div>

      <div className='bg-blue-100 p-4 rounded mb-4'>
        <h3 className='font-bold mb-2'>⚙️ Function Results:</h3>
        <pre className='text-sm'>{`getApiUrl(): ${apiUrl}`}</pre>
      </div>

      <div className='bg-green-100 p-4 rounded mb-4'>
        <h3 className='font-bold mb-2'>🔗 Expected URLs:</h3>
        <pre className='text-sm'>
          {`Login URL: ${apiUrl}/authentication
Verify URL: ${apiUrl}/verify`}
        </pre>
      </div>

      <div className='bg-yellow-100 p-4 rounded border-l-4 border-yellow-400'>
        <h4 className='font-bold text-yellow-800 mb-2'>💡 Note:</h4>
        <p className='text-yellow-700 text-sm'>
          If NEXT_PUBLIC_API_URL is undefined, the fallback URL will be used: http://127.0.0.1:8000/api/auth
        </p>
      </div>
    </div>
  )
}

export default DebugEnv
