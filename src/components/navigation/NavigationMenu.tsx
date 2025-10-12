// components/navigation/NavigationMenu.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Box,
  Divider
} from '@mui/material'

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import ArticleIcon from '@mui/icons-material/Article'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// Config and hooks
import { MENU_CONFIG, filterMenuByPermissions } from '@/config/menu'
import { usePermissions } from '@/providers/PermissionsProvider'

const iconMap: Record<string, React.ReactNode> = {
  'ri-dashboard-line': <DashboardIcon />,
  'ri-user-line': <PeopleIcon />,
  'ri-settings-line': <SettingsIcon />,
  'ri-file-text-line': <ArticleIcon />,
  'ri-layout-card-line': <ViewModuleIcon />,
  'ri-merge-cells-horizontal': <ViewModuleIcon />
}

const NavigationMenu = () => {
  const pathname = usePathname()
  const { permissions } = usePermissions()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  // Filter menu items based on user permissions
  const visibleMenuItems = filterMenuByPermissions(MENU_CONFIG, permissions)

  const handleToggle = (itemId: string) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const isActive = (path: string) => pathname === path
  const isChildActive = (children: any[]) => children?.some(child => pathname === child.path)

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Typography variant='h6' sx={{ p: 2, fontWeight: 'bold', color: 'primary.main' }}>
        📱 Navegación
      </Typography>
      <Divider />

      <List component='nav'>
        {visibleMenuItems.map(item => (
          <Box key={item.id}>
            {/* Main Menu Item */}
            <ListItem disablePadding>
              {item.children && item.children.length > 0 ? (
                // Item with children - expandable
                <ListItemButton onClick={() => handleToggle(item.id)} selected={isChildActive(item.children)}>
                  <ListItemIcon>{iconMap[item.icon || ''] || <ViewModuleIcon />}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {openItems[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
              ) : (
                // Single item - direct link
                <Link href={item.path} style={{ textDecoration: 'none', width: '100%' }}>
                  <ListItemButton selected={isActive(item.path)}>
                    <ListItemIcon>{iconMap[item.icon || ''] || <ViewModuleIcon />}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </Link>
              )}
            </ListItem>

            {/* Children Items */}
            {item.children && item.children.length > 0 && (
              <Collapse in={openItems[item.id]} timeout='auto' unmountOnExit>
                <List component='div' disablePadding>
                  {item.children.map(child => (
                    <Link key={child.id} href={child.path} style={{ textDecoration: 'none' }}>
                      <ListItemButton sx={{ pl: 4 }} selected={isActive(child.path)}>
                        <ListItemText primary={child.label} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItemButton>
                    </Link>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
    </Box>
  )
}

export default NavigationMenu
