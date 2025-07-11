// Main dashboard home page

import { Suspense } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Users, CreditCard, TrendingUp, Plus } from 'lucide-react'

export const metadata = {
  title: 'Dashboard',
  description: 'Welcome to your dashboard',
}

function DashboardStats() {
  // In a real app, you'd fetch this data from your API
  const stats = [
    {
      title: 'Total Projects',
      value: 12,
      description: 'Active projects',
      trend: { value: 12, isPositive: true },
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      title: 'Team Members',
      value: 5,
      description: 'Active members',
      trend: { value: 0, isPositive: true },
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: 'Monthly Revenue',
      value: '$2,345',
      description: 'Current month',
      trend: { value: 15, isPositive: true },
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      title: 'Growth Rate',
      value: '23%',
      description: 'Year over year',
      trend: { value: 5, isPositive: true },
      icon: <TrendingUp className="h-4 w-4" />,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
}

function RecentActivity() {
  const activities = [
    {
      action: 'Created new project',
      target: 'Mobile App Redesign',
      time: '2 hours ago',
    },
    {
      action: 'Updated billing information',
      target: 'Payment method',
      time: '1 day ago',
    },
    {
      action: 'Invited team member',
      target: 'john@example.com',
      time: '2 days ago',
    },
    {
      action: 'Upgraded subscription',
      target: 'Pro Plan',
      time: '1 week ago',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {activity.action} <span className="font-normal text-muted-foreground">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActions() {
  const actions = [
    {
      title: 'Create Project',
      description: 'Start a new project',
      icon: <Plus className="h-4 w-4" />,
      href: '/dashboard/projects/new',
    },
    {
      title: 'Invite Team',
      description: 'Add team members',
      icon: <Users className="h-4 w-4" />,
      href: '/dashboard/team/invite',
    },
    {
      title: 'View Analytics',
      description: 'Check your metrics',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/dashboard/analytics',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks to get you started</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto justify-start p-4"
              asChild
            >
              <a href={action.href}>
                <div className="mr-4">{action.icon}</div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Dashboard"
      description="Welcome back! Here's what's happening with your account."
    >
      <div className="space-y-6">
        <Suspense fallback={<div>Loading stats...</div>}>
          <DashboardStats />
        </Suspense>

        <div className="grid gap-6 md:grid-cols-2">
          <RecentActivity />
          <QuickActions />
        </div>
      </div>
    </DashboardShell>
  )
}