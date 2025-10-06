// Feature Imports
import { ForgotPasswordForm } from '@/features/auth'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const ForgotPasswordPage = () => {
  // Vars
  const mode = getServerMode()

  return <ForgotPasswordForm mode={mode} />
}

export default ForgotPasswordPage
