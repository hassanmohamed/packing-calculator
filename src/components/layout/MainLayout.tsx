import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, MobileHeader } from './Sidebar'
import { BottomNav } from './BottomNav'

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
        {/* Add padding: top for mobile header, bottom for mobile bottom nav */}
        <div className="container mx-auto p-4 pt-20 pb-24 lg:p-6 lg:pt-6 lg:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom navigation for mobile */}
      <BottomNav />
    </div>
  )
}
