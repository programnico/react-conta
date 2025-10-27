import { Metadata } from 'next'
import { UsersList } from '@/features/users/components/UsersList'

export const metadata: Metadata = {
  title: 'Gestión de Usuarios',
  description: 'Administrar usuarios del sistema'
}

export default function UsersPage() {
  return <UsersList />
}
