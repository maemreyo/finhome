// src/components/admin/AchievementManagementTable.tsx
// Achievement management table using TanStack Table

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
  Trophy,
  Star,
  Target,
  Users,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Achievement } from '@/src/types/supabase'

// Mock data based on your database schema
const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Home Purchase',
    name_vi: 'Mua Nhà Đầu Tiên',
    description: 'Complete your first property purchase plan',
    description_vi: 'Hoàn thành kế hoạch mua bất động sản đầu tiên',
    achievement_type: 'milestone',
    required_actions: {
      action: 'complete_purchase_plan',
      count: 1
    },
    required_value: 1,
    experience_points: 100,
    badge_icon: 'home',
    badge_color: '#10B981',
    is_active: true,
    is_hidden: false,
    sort_order: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    name: 'Smart Investor',
    name_vi: 'Nhà Đầu Tư Thông Minh',
    description: 'Create 3 successful investment plans',
    description_vi: 'Tạo 3 kế hoạch đầu tư thành công',
    achievement_type: 'financial',
    required_actions: {
      action: 'create_investment_plan',
      count: 3
    },
    required_value: 3,
    experience_points: 200,
    badge_icon: 'trending-up',
    badge_color: '#8B5CF6',
    is_active: true,
    is_hidden: false,
    sort_order: 2,
    created_at: '2024-01-12T09:00:00Z',
    updated_at: '2024-01-18T16:45:00Z'
  },
  {
    id: '3',
    name: 'Calculator Expert',
    name_vi: 'Chuyên Gia Tính Toán',
    description: 'Use loan calculator 10 times',
    description_vi: 'Sử dụng máy tính vay 10 lần',
    achievement_type: 'usage',
    required_actions: {
      action: 'use_calculator',
      count: 10
    },
    required_value: 10,
    experience_points: 50,
    badge_icon: 'calculator',
    badge_color: '#F59E0B',
    is_active: true,
    is_hidden: false,
    sort_order: 3,
    created_at: '2024-01-10T11:30:00Z',
    updated_at: '2024-01-19T13:20:00Z'
  },
  {
    id: '4',
    name: 'Knowledge Seeker',
    name_vi: 'Người Tìm Hiểu',
    description: 'Read 5 property market articles',
    description_vi: 'Đọc 5 bài viết về thị trường bất động sản',
    achievement_type: 'learning',
    required_actions: {
      action: 'read_article',
      count: 5
    },
    required_value: 5,
    experience_points: 75,
    badge_icon: 'book',
    badge_color: '#3B82F6',
    is_active: true,
    is_hidden: false,
    sort_order: 4,
    created_at: '2024-01-08T15:00:00Z',
    updated_at: '2024-01-16T10:15:00Z'
  },
  {
    id: '5',
    name: 'Social Connector',
    name_vi: 'Người Kết Nối',
    description: 'Share 3 plans with friends',
    description_vi: 'Chia sẻ 3 kế hoạch với bạn bè',
    achievement_type: 'social',
    required_actions: {
      action: 'share_plan',
      count: 3
    },
    required_value: 3,
    experience_points: 80,
    badge_icon: 'share',
    badge_color: '#EF4444',
    is_active: false,
    is_hidden: true,
    sort_order: 5,
    created_at: '2024-01-05T12:00:00Z',
    updated_at: '2024-01-14T08:30:00Z'
  }
]

export const AchievementManagementTable: React.FC = () => {
  const [data] = useState(mockAchievements)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const getAchievementTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return Trophy
      case 'financial': return Target
      case 'usage': return Star
      case 'learning': return BookOpen
      case 'social': return Users
      default: return Trophy
    }
  }

  const getAchievementTypeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-green-100 text-green-800 border-green-300'
      case 'financial': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'usage': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'learning': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'social': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const columns = useMemo<ColumnDef<Achievement>[]>(
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
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Achievement
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const achievement = row.original
          const IconComponent = getAchievementTypeIcon(achievement.achievement_type)
          
          return (
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center border"
                style={{ 
                  backgroundColor: achievement.badge_color + '20',
                  borderColor: achievement.badge_color + '40'
                }}
              >
                <IconComponent 
                  className="w-5 h-5" 
                  style={{ color: achievement.badge_color }} 
                />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {achievement.name}
                </div>
                <div className="text-sm text-gray-500">
                  {achievement.name_vi}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="max-w-[300px]">
            <div className="text-sm text-gray-900 mb-1">
              {row.original.description}
            </div>
            <div className="text-xs text-gray-500">
              {row.original.description_vi}
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'achievement_type',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.getValue('achievement_type') as string
          const IconComponent = getAchievementTypeIcon(type)
          
          return (
            <Badge 
              variant="outline" 
              className={cn('text-xs', getAchievementTypeColor(type))}
            >
              <IconComponent className="w-3 h-3 mr-1" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          )
        },
        filterFn: (row, _id, value) => {
          if (value === 'all') return true
          return row.getValue('achievement_type') === value
        },
      },
      {
        accessorKey: 'required_value',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Required
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const requiredValue = row.getValue('required_value') as number
          const requiredActions = row.original.required_actions as any
          
          return (
            <div className="text-center">
              <div className="font-medium text-gray-900">
                {requiredValue}
              </div>
              <div className="text-xs text-gray-500">
                {requiredActions?.action?.replace('_', ' ')}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'experience_points',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            XP Reward
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <Badge variant="secondary" className="bg-blue-50 text-blue-800 border-blue-300">
              +{row.getValue('experience_points')} XP
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <Badge 
              variant={row.original.is_active ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                row.original.is_active 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-gray-100 text-gray-800 border-gray-300'
              )}
            >
              {row.original.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {row.original.is_hidden && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-800 border-orange-300">
                Hidden
              </Badge>
            )}
          </div>
        ),
        filterFn: (row, _id, value) => {
          if (value === 'all') return true
          if (value === 'active') return !!row.original.is_active
          if (value === 'inactive') return !row.original.is_active
          if (value === 'hidden') return !!row.original.is_hidden
          return true
        },
      },
      {
        accessorKey: 'sort_order',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Order
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center font-mono text-sm">
            #{row.getValue('sort_order')}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const achievement = row.original

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
                  onClick={() => navigator.clipboard.writeText(achievement.id)}
                >
                  Copy achievement ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit achievement
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  View unlocked users
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete achievement
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
              placeholder="Search achievements..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
          <Select
            value={(table.getColumn('achievement_type')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('achievement_type')?.setFilterValue(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="milestone">Milestone</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="usage">Usage</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="social">Social</SelectItem>
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
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