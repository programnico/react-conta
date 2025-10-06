// Feature Imports
import { UnderMaintenancePage as UnderMaintenanceComponent } from '@/features/pages'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const UnderMaintenancePage = () => {
  // Vars
  const mode = getServerMode()

  return <UnderMaintenanceComponent mode={mode} />
}

export default UnderMaintenancePage
