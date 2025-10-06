// Feature Imports
// import { RegisterForm } from '@/features/auth'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const RegisterPage = () => {
  // Vars
  const mode = getServerMode()

  return <RegisterForm mode={mode} />
}

export default RegisterPage
