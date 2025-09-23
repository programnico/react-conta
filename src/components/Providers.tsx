// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Component Imports
import ClientProviders from '@components/ClientProviders'

// Util Imports
import { getMode, getSettingsFromCookie } from '@core/utils/serverHelpers'

type Props = ChildrenType & {
  direction: Direction
}

const Providers = (props: Props) => {
  // Props
  const { children, direction } = props

  // Vars
  const mode = getMode()
  const settingsCookie = getSettingsFromCookie()

  return (
    <ClientProviders direction={direction} mode={mode} settingsCookie={settingsCookie}>
      {children}
    </ClientProviders>
  )
}

export default Providers
