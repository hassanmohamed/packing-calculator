import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, MobileHeader } from './Sidebar'

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <main className="lg:ps-64">
        {/* Add top padding on mobile for the fixed header */}
        <div className="container mx-auto p-4 pt-20 lg:p-6 lg:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
