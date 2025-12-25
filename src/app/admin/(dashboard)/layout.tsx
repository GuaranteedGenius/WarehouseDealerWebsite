import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64">
        <AdminHeader admin={admin} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
