# API Configuration Guide

This document explains how to configure the API client for different environments and use cases.

## Overview

The API configuration has been modularized into separate files for better maintainability:

- `src/shared/config/apiConfig.ts` - Centralized API configuration
- `src/shared/services/apiClient.ts` - HTTP client implementation
- `.env.example` - Environment variables template

## File Structure

```
src/shared/
├── config/
│   └── apiConfig.ts          # Main configuration file
├── services/
│   └── apiClient.ts          # HTTP client implementation
└── README-API-Config.md      # This documentation
```

## Configuration Files

### 1. API Configuration (`apiConfig.ts`)

Contains all API-related configuration:

```typescript
# Environment-specific base URLs (INCLUDE /api)
export const API_BASE_URLS = {
  DEVELOPMENT: '',                        # Uses Next.js proxy
  PRODUCTION: 'http://127.0.0.1:8000/api', # Direct backend URL + /api
  STAGING: 'https://api.staging.com/api',   # Staging environment + /api
  TESTING: 'https://api.test.com/api'       # Testing environment + /api
}

// All API endpoints organized by feature
export const API_ENDPOINTS = {
  AUTH: { LOGIN: '/auth/login', ... },
  CHART_OF_ACCOUNTS: { LIST: '/chart-of-accounts', ... },
  // ... other endpoints
}
```

### 2. Environment Variables

Configure these in your `.env.local` file:

```bash
# Main API URL (production)
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# Alternative environments
NEXT_PUBLIC_API_BASE_URL_STAGING=https://staging-api.react-conta.com
NEXT_PUBLIC_API_BASE_URL_TEST=https://test-api.react-conta.com

# Current environment
NEXT_PUBLIC_ENVIRONMENT=development

# Debug mode
NEXT_PUBLIC_API_DEBUG=true
```

## Environment-Specific Setup

### Development Environment

```bash
# .env.local
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_API_DEBUG=true
```

**Behavior:**

- Uses Next.js proxy (`/api/*` → `http://127.0.0.1:8000/api/*`)
- No CORS issues
- Full request/response logging
- Automatic error handling

**Important**: In development, the Next.js proxy automatically forwards requests to your Laravel backend, so no `/api` prefix is needed in the base URL.

### Staging Environment

```bash
# .env.local
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_API_BASE_URL_STAGING=https://api.staging.com/api
NEXT_PUBLIC_API_DEBUG=false
```

**Important**: Staging URLs should include the `/api` path for direct backend communication.

### Production Environment

```bash
# .env.local
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_API_BASE_URL=https://api.tudominio.com/api
NEXT_PUBLIC_API_DEBUG=false
```

**Important**: Production URLs should include the `/api` path as this is the standard practice for REST APIs.

## Usage Examples

### Basic Usage

```typescript
import { apiClient, API_CONFIG } from '@/shared/services/apiClient'

// Using the client directly
const data = await apiClient.get('/chart-of-accounts')

// Using endpoints from config
const response = await apiClient.request({
  endpoint: API_CONFIG.ENDPOINTS.CHART_OF_ACCOUNTS.LIST,
  method: 'GET'
})
```

### Custom Configuration

```typescript
import { API_CONFIG, getEndpointByPath } from '@/shared/config/apiConfig'

// Get endpoint dynamically
const loginEndpoint = getEndpointByPath('AUTH.LOGIN')

// Get full URL
const fullUrl = getEndpointUrl('/chart-of-accounts')
```

## Adding New Endpoints

To add new API endpoints:

1. **Add to configuration:**

```typescript
// In apiConfig.ts
export const API_ENDPOINTS = {
  // ... existing endpoints

  NEW_FEATURE: {
    LIST: '/new-feature',
    CREATE: '/new-feature/create',
    UPDATE: '/new-feature/update',
    DELETE: '/new-feature'
  }
}
```

2. **Use in services:**

```typescript
// In your service file
import { API_CONFIG, apiClient } from '@/shared/services/apiClient'

export const newFeatureService = {
  async getAll() {
    return apiClient.get(API_CONFIG.ENDPOINTS.NEW_FEATURE.LIST)
  },

  async create(data: any) {
    return apiClient.post(API_CONFIG.ENDPOINTS.NEW_FEATURE.CREATE, data)
  }
}
```

## Configuration Options

### Client Configuration

```typescript
export const API_CLIENT_CONFIG = {
  TIMEOUT: 30000, // Request timeout (ms)

  DEFAULT_HEADERS: {
    // Headers for all requests
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },

  RETRY: {
    // Retry configuration
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000
  },

  AUTH: {
    // Authentication settings
    TOKEN_HEADER: 'Authorization',
    TOKEN_PREFIX: 'Bearer ',
    STORAGE_KEYS: {
      ACCESS_TOKEN: 'accessToken',
      REFRESH_TOKEN: 'refreshToken',
      USER_DATA: 'userData'
    }
  }
}
```

### Debug Configuration

```typescript
export const API_DEBUG = {
  LOG_REQUESTS: process.env.NEXT_PUBLIC_API_DEBUG === 'true',
  LOG_RESPONSES: process.env.NEXT_PUBLIC_API_DEBUG === 'true',
  LOG_ERRORS: true
}
```

## Benefits of This Structure

### **Maintainability**

- Centralized configuration
- Easy to update endpoints
- Clear separation of concerns

### **Flexibility**

- Environment-specific configurations
- Easy to add new environments
- Configurable debug options

### **Developer Experience**

- TypeScript autocomplete for endpoints
- Clear documentation
- Consistent API usage

### **Production Ready**

- Environment-based URL switching
- Configurable timeouts and retries
- Proper error handling

## Migration from Old Configuration

If you're updating from the old inline configuration:

### Before:

```typescript
// Hard-coded in apiClient.ts
const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000',
  ENDPOINTS: { ... }
}
```

### After:

```typescript
// Import from centralized config
import { API_CONFIG } from '../config/apiConfig'
```

The API client automatically uses the new configuration, so no changes are needed in your service files.

## Troubleshooting

### Common Issues:

1. **CORS Errors in Production:**
   - Ensure your backend accepts requests from your frontend domain
   - Check `NEXT_PUBLIC_API_BASE_URL` is correct

2. **Endpoints Not Found:**
   - Verify endpoint exists in `API_ENDPOINTS`
   - Check spelling and case sensitivity

3. **Environment Variables Not Working:**
   - Ensure variables start with `NEXT_PUBLIC_`
   - Restart development server after changes
   - Check `.env.local` is in project root

4. **Debug Logs Not Showing:**
   - Set `NEXT_PUBLIC_API_DEBUG=true`
   - Ensure `NEXT_PUBLIC_ENVIRONMENT=development`

For more help, check the console for detailed error messages when `API_DEBUG.LOG_ERRORS` is enabled.
