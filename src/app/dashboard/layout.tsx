import { Sidebar } from "@/components/dashboard/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto bg-background/50 p-6 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}
