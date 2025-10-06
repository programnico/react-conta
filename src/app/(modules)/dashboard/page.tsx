'use client'

// Components Imports
import AuthGuard from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/features/dashboard'

const DashboardPage = () => {
  return (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  )
}

export default DashboardPage
