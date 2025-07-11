// Reusable dashboard page wrapper

interface DashboardShellProps {
  title: string
  description?: string
  children: React.ReactNode
  headerAction?: React.ReactNode
}

export function DashboardShell({ 
  title, 
  description, 
  children, 
  headerAction 
}: DashboardShellProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {headerAction && (
          <div>{headerAction}</div>
        )}
      </div>
      {children}
    </div>
  )
}