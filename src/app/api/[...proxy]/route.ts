// API Route that acts as a proxy to the backend server
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function GET(request: NextRequest, { params }: { params: { proxy: string[] } }) {
  return proxyRequest(request, params.proxy)
}

export async function POST(request: NextRequest, { params }: { params: { proxy: string[] } }) {
  return proxyRequest(request, params.proxy)
}

export async function PUT(request: NextRequest, { params }: { params: { proxy: string[] } }) {
  return proxyRequest(request, params.proxy)
}

export async function DELETE(request: NextRequest, { params }: { params: { proxy: string[] } }) {
  return proxyRequest(request, params.proxy)
}

export async function OPTIONS(request: NextRequest, { params }: { params: { proxy: string[] } }) {
  return proxyRequest(request, params.proxy)
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  // Construct the target URL
  const path = pathSegments.join('/')
  const targetUrl = `${BACKEND_URL}/${path}`

  try {
    // Get request body if it exists
    let body: any = undefined
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const contentType = request.headers.get('content-type')
      const contentLength = request.headers.get('content-length')

      // Only try to parse body if there actually is content
      if (contentLength === '0' || !contentType) {
        body = undefined
      } else if (contentType?.includes('application/json')) {
        try {
          const requestText = await request.text()
          if (requestText.trim()) {
            body = JSON.stringify(JSON.parse(requestText))
          } else {
            body = undefined
          }
        } catch (e) {
          body = undefined
        }
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        body = await request.text()
      } else {
        body = await request.arrayBuffer()
      }
    }

    // Forward headers (excluding some that might cause issues)
    const forwardedHeaders = new Headers()
    for (const [key, value] of request.headers.entries()) {
      if (!['host', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
        forwardedHeaders.set(key, value)
      }
    }

    // Make the request to the backend
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: forwardedHeaders,
      body: body
    })

    // Get response body - handle different content types
    let responseBody: any
    const responseContentType = response.headers.get('content-type')
    const contentLength = response.headers.get('content-length')

    // Only treat as empty if explicitly empty (status 204 OR content-length is exactly 0)
    if (response.status === 204 || contentLength === '0') {
      responseBody = ''
    } else {
      // Try to get response text first
      const text = await response.text()

      if (!text || text.trim() === '') {
        responseBody = ''
      } else if (responseContentType?.includes('application/json')) {
        // Parse JSON response
        try {
          responseBody = JSON.parse(text)
        } catch (e) {
          responseBody = { error: 'Invalid JSON response', rawText: text }
        }
      } else {
        // Non-JSON response
        responseBody = text
      }
    }

    // Create response with CORS headers
    const proxyResponse = new NextResponse(
      typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
      {
        status: response.status,
        statusText: response.statusText
      }
    )

    // Copy response headers
    for (const [key, value] of response.headers.entries()) {
      if (!['content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        proxyResponse.headers.set(key, value)
      }
    }

    // Add CORS headers
    proxyResponse.headers.set('Access-Control-Allow-Origin', '*')
    proxyResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    proxyResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

    return proxyResponse
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        targetUrl,
        backendUrl: BACKEND_URL
      },
      { status: 500 }
    )
  }
}
