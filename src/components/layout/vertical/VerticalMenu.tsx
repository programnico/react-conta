// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import DynamicVerticalMenu from './DynamicVerticalMenu'

const VerticalMenu = ({ scrollMenu }: { scrollMenu: (container: any, isPerfectScrollbar: boolean) => void }) => {
  return <DynamicVerticalMenu scrollMenu={scrollMenu} />
}

export default VerticalMenu
