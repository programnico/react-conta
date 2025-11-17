'use client'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ChildrenType } from '@core/types'

// Util Imports
import { blankLayoutClasses } from './utils/layoutClasses'

const BlankLayout = ({ children }: ChildrenType) => {
  return (
    <div
      className={classnames(blankLayoutClasses.root, 'flex items-center justify-center')}
      style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}
    >
      {children}
    </div>
  )
}

export default BlankLayout
