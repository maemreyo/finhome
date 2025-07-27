// src/components/admin/NotificationManagementTable.tsx
// Notification management table using TanStack Table

'use client'

import React, { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MoreHorizontal,
  ArrowUpDown,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Trophy,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from '@/src/types/supabase'

// Mock data based on your database schema - representing notification templates/campaigns
const mockNotifications: (Notification & { recipient_count?: number; sent_count?: number; open_rate?: number })[] = [
  {
    id: '1',
    user_id: 'system',
    type: 'achievement',
    title: 'Achievement Unlocked Template',
    message: 'Congratulations! You have unlocked the achievement: {achievement_name}',
    action_url: '/achievements',
    icon: 'trophy',
    image_url: null,
    is_read: false,
    is_archived: false,
    is_sent: true,
    sent_at: '2024-01-20T10:00:00Z',
    delivery_channels: ['in_app', 'email'],
    priority: 1,
    created_at: '2024-01-15T10:00:00Z',
    read_at: null,
    expires_at: null,
    metadata: {
      template_type: 'achievement',
      auto_send: true
    },
    recipient_count: 1234,
    sent_count: 1200,
    open_rate: 78.5
  },
  {
    id: '2',
    user_id: 'system',
    type: 'info',
    title: 'Bank Rate Update',
    message: 'Interest rates have been updated for {bank_name}. New rate: {new_rate}%',
    action_url: '/banks',
    icon: 'trending-up',
    image_url: null,
    is_read: false,
    is_archived: false,
    is_sent: true,
    sent_at: '2024-01-19T14:30:00Z',
    delivery_channels: ['in_app', 'email', 'push'],
    priority: 2,
    created_at: '2024-01-18T09:00:00Z',
    read_at: null,
    expires_at: null,
    metadata: {
      template_type: 'rate_update',
      auto_send: true
    },
    recipient_count: 980,
    sent_count: 975,
    open_rate: 65.2
  },
  {
    id: '3',
    user_id: 'system',
    type: 'warning',
    title: 'Payment Reminder',
    message: 'Your loan payment for {property_name} is due in 3 days',
    action_url: '/plans',
    icon: 'alert-circle',
    image_url: null,
    is_read: false,
    is_archived: false,
    is_sent: false,
    sent_at: null,
    delivery_channels: ['email', 'push'],
    priority: 1,
    created_at: '2024-01-20T16:45:00Z',
    read_at: null,
    expires_at: '2024-02-20T16:45:00Z',
    metadata: {
      template_type: 'payment_reminder',
      auto_send: true,
      send_days_before: 3
    },
    recipient_count: 456,
    sent_count: 0,
    open_rate: 0
  },
  {
    id: '4',
    user_id: 'system',
    type: 'success',
    title: 'Plan Completion Congratulations',
    message: 'Congratulations! You have successfully completed your financial plan: {plan_name}',
    action_url: '/plans',
    icon: 'check-circle',
    image_url: null,
    is_read: false,
    is_archived: false,
    is_sent: true,
    sent_at: '2024-01-17T11:20:00Z',
    delivery_channels: ['in_app', 'email'],
    priority: 2,
    created_at: '2024-01-15T13:20:00Z',
    read_at: null,
    expires_at: null,
    metadata: {
      template_type: 'plan_completion',
      auto_send: true
    },
    recipient_count: 89,
    sent_count: 89,
    open_rate: 89.7
  },
  {
    id: '5',
    user_id: 'admin',
    type: 'error',
    title: 'System Maintenance Notice',
    message: 'FinHome will be undergoing maintenance on {maintenance_date} from {start_time} to {end_time}',
    action_url: null,
    icon: 'info',
    image_url: null,
    is_read: false,
    is_archived: true,
    is_sent: true,
    sent_at: '2024-01-10T08:00:00Z',
    delivery_channels: ['in_app', 'email', 'push'],
    priority: 3,
    created_at: '2024-01-08T15:00:00Z',
    read_at: null,
    expires_at: '2024-01-12T00:00:00Z',
    metadata: {
      template_type: 'maintenance',
      auto_send: false
    },
    recipient_count: 1234,
    sent_count: 1234,
    open_rate: 95.3
  }
]

export const NotificationManagementTable: React.FC = () => {
  const [data] = useState(mockNotifications)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return Trophy
      case 'info': return Info
      case 'success': return CheckCircle
      case 'warning': return AlertCircle
      case 'error': return XCircle
      default: return Info
    }
  }

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'success': return 'bg-green-100 text-green-800 border-green-300'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'error': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityBadge = (priority: number | null) => {
    switch (priority) {
      case 1:
        return <Badge variant="destructive" className="text-xs">High</Badge>
      case 2:
        return <Badge variant="secondary" className="text-xs">Medium</Badge>
      case 3:
        return <Badge variant="outline" className="text-xs">Low</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Normal</Badge>
    }
  }

  const columns = useMemo<ColumnDef<Notification & { recipient_count?: number; sent_count?: number; open_rate?: number }>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="rounded border-gray-300"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Notification
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const notification = row.original
          const IconComponent = getNotificationTypeIcon(notification.type)
          
          return (
            <div className="flex items-start gap-3">
              <div className={cn(
                'p-2 rounded-lg flex-shrink-0 border',
                getNotificationTypeColor(notification.type)
              )}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-900 max-w-[250px]">
                  {notification.title}
                </div>
                <div className="text-sm text-gray-500 max-w-[250px] truncate">
                  {notification.message}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', getNotificationTypeColor(notification.type))}
                  >
                    {notification.type}
                  </Badge>
                  {getPriorityBadge(notification.priority)}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'delivery_channels',
        header: 'Channels',
        cell: ({ row }) => {
          const channels = row.getValue('delivery_channels') as string[]
          
          return (
            <div className="flex flex-wrap gap-1">
              {channels.map((channel) => (
                <Badge key={channel} variant="secondary" className="text-xs">
                  {channel.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: 'recipient_count',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Recipients
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {row.original.recipient_count?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500">
              {row.original.sent_count?.toLocaleString() || 0} sent
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'open_rate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Open Rate
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const openRate = row.original.open_rate || 0
          
          return (
            <div className="text-center">
              <div className="font-medium text-gray-900">
                {openRate.toFixed(1)}%
              </div>
              <div className={cn(
                'text-xs',
                openRate >= 70 ? 'text-green-600' : 
                openRate >= 50 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {openRate >= 70 ? 'Excellent' : 
                 openRate >= 50 ? 'Good' : 'Poor'}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const notification = row.original
          
          if (notification.is_archived) {
            return (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                Archived
              </Badge>
            )
          }
          
          if (notification.is_sent) {
            return (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Sent
              </Badge>
            )
          }
          
          return (
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
              <Clock className="w-3 h-3 mr-1" />
              Pending
            </Badge>
          )
        },
        filterFn: (row, _id, value) => {
          if (value === 'all') return true
          if (value === 'sent') return !!row.original.is_sent
          if (value === 'pending') return !row.original.is_sent && !row.original.is_archived
          if (value === 'archived') return !!row.original.is_archived
          return true
        },
      },
      {
        accessorKey: 'sent_at',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Sent Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const sentAt = row.getValue('sent_at')
          
          if (!sentAt) {
            return <span className="text-gray-400 text-sm">Not sent</span>
          }
          
          const date = new Date(sentAt as string)
          return (
            <div className="text-sm">
              <div className="text-gray-900">
                {date.toLocaleDateString('vi-VN')}
              </div>
              <div className="text-gray-500">
                {date.toLocaleTimeString('vi-VN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const notification = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(notification.id)}
                >
                  Copy notification ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit template
                </DropdownMenuItem>
                {!notification.is_sent && (
                  <DropdownMenuItem>
                    <Send className="mr-2 h-4 w-4" />
                    Send now
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  return (
    <div className="w-full space-y-4 p-4">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
          <Select
            value={(table.getColumn('type')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('type')?.setFilterValue(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="achievement">Achievement</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}