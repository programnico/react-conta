// API Route that acts as a proxy to the backend server
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

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
    console.log(`🔄 Proxying ${request.method} request from ${request.url} to ${targetUrl}`)
    console.log(`📋 Backend URL: ${BACKEND_URL}`)
    console.log(`📋 Path segments: ${JSON.stringify(pathSegments)}`) // Get request body if it exists
    let body: any = undefined
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const contentType = request.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        body = JSON.stringify(await request.json())
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

    // Get response body
    let responseBody: any
    const responseContentType = response.headers.get('content-type')

    if (responseContentType?.includes('application/json')) {
      responseBody = await response.json()
    } else {
      responseBody = await response.text()
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

    console.log(`✅ Proxy successful: ${response.status}`)
    return proxyResponse
  } catch (error) {
    console.error('❌ Proxy error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      targetUrl,
      method: request.method
    })
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
