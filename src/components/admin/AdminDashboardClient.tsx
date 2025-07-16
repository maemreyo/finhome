// src/components/admin/AdminDashboardClient.tsx
// Client-side admin dashboard with real-time updates

'use client'

import React from 'react'
import { 
  Users,
  Building2,
  Trophy,
  Bell,
  TrendingUp,
  DollarSign,
  FileText,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAdminStats, useAdminActivity } from '@/lib/hooks/useRealtimeData'

interface AdminStats {
  users: { total: number; active: number; premium: number; inactive: number }
  banks: { total: number; active: number }
  rates: { total: number; active: number }
  achievements: { total: number; active: number }
}

interface AdminDashboardClientProps {
  initialStats: AdminStats
  locale: string
}

export function AdminDashboardClient({ initialStats, locale }: AdminDashboardClientProps) {
  const { stats, isLoading } = useAdminStats()
  const { activities } = useAdminActivity()

  const currentStats = isLoading ? initialStats : stats

  const dashboardStats = [
    {
      title: 'Total Users',
      value: currentStats.users.total.toLocaleString(),
      change: `${currentStats.users.active} active`,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Banks',
      value: currentStats.banks.active.toString(),
      change: `${currentStats.banks.total} total`,
      icon: Building2,
      color: 'green'
    },
    {
      title: 'Achievements',
      value: currentStats.achievements.active.toString(),
      change: `${currentStats.achievements.total} total`,
      icon: Trophy,
      color: 'purple'
    },
    {
      title: 'Interest Rates',
      value: currentStats.rates.active.toString(),
      change: `${currentStats.rates.total} total`,
      icon: DollarSign,
      color: 'orange'
    }
  ]

  const quickActions = [
    {
      title: 'Update Bank Rates',
      description: 'Manage interest rates for Vietnamese banks',
      href: '/admin/rates',
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    {
      title: 'Create Achievement',
      description: 'Add new achievement to the system',
      href: '/admin/achievements',
      icon: Trophy,
      color: 'bg-purple-500'
    },
    {
      title: 'Send Notification',
      description: 'Send notification to users',
      href: '/admin/notifications',
      icon: Bell,
      color: 'bg-orange-500'
    },
    {
      title: 'View Analytics',
      description: 'Check system analytics and reports',
      href: '/admin/analytics',
      icon: TrendingUp,
      color: 'bg-green-500'
    }
  ]

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your FinHome application from this central hub
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          System Online
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Admin Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-blue-500" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">
                        {activity.event_data?.action?.replace('_', ' ') || 'Admin Action'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {activity.event_data?.target_table && `Table: ${activity.event_data.target_table}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatActivityTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    asChild
                  >
                    <a href={action.href}>
                      <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.description}</div>
                      </div>
                    </a>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <div className="text-sm font-medium">Database</div>
              <div className="text-xs text-gray-600">Online</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <div className="text-sm font-medium">API</div>
              <div className="text-xs text-gray-600">Healthy</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <div className="text-sm font-medium">Real-time</div>
              <div className="text-xs text-gray-600">Connected</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <div className="text-sm font-medium">Storage</div>
              <div className="text-xs text-gray-600">85% Free</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}