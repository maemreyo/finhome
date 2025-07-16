// src/components/admin/UserManagementTable.tsx
// User management table using TanStack Table

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Mail,
  Phone,
  MapPin,
  Crown,
  Shield,
  Ban,
  UserCheck,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/lib/supabase/types'

// Mock data based on your database schema
const mockUsers: UserProfile[] = [
  {
    id: '1',
    email: 'nguyen.van.a@gmail.com',
    full_name: 'Nguyễn Văn A',
    avatar_url: null,
    phone: '+84987654321',
    date_of_birth: '1990-05-15',
    occupation: 'Software Engineer',
    company: 'TechCorp Vietnam',
    monthly_income: 25000000,
    city: 'Ho Chi Minh City',
    district: 'District 1',
    address: '123 Nguyen Hue Street',
    location: null,
    currency: 'VND',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    preferred_language: 'vi',
    currency_format: 'VND',
    subscription_tier: 'premium',
    subscription_expires_at: '2024-06-15T00:00:00Z',
    annual_income: 300000000,
    monthly_expenses: 15000000,
    current_assets: 500000000,
    current_debts: 200000000,
    experience_points: 1250,
    achievement_badges: ['first_home', 'smart_investor'],
    onboarding_completed: true,
    notification_preferences: {},
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    last_login_at: '2024-01-20T09:15:00Z',
    is_active: true
  },
  {
    id: '2',
    email: 'tran.thi.b@outlook.com',
    full_name: 'Trần Thị B',
    avatar_url: '/avatars/user2.jpg',
    phone: '+84912345678',
    date_of_birth: '1985-12-03',
    occupation: 'Marketing Manager',
    company: 'Global Marketing Ltd',
    monthly_income: 18000000,
    city: 'Hanoi',
    district: 'Ba Dinh',
    address: '456 Ba Dinh Square',
    location: null,
    currency: 'VND',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    preferred_language: 'vi',
    currency_format: 'VND',
    subscription_tier: 'free',
    subscription_expires_at: null,
    annual_income: 216000000,
    monthly_expenses: 12000000,
    current_assets: 150000000,
    current_debts: 50000000,
    experience_points: 450,
    achievement_badges: ['calculator_expert'],
    onboarding_completed: true,
    notification_preferences: {},
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-19T16:45:00Z',
    last_login_at: '2024-01-19T14:20:00Z',
    is_active: true
  },
  {
    id: '3',
    email: 'le.van.c@company.vn',
    full_name: 'Lê Văn C',
    avatar_url: null,
    phone: '+84901234567',
    date_of_birth: '1988-07-22',
    occupation: 'Business Owner',
    company: 'C&C Investment',
    monthly_income: 45000000,
    city: 'Da Nang',
    district: 'Hai Chau',
    address: '789 Bach Dang Street',
    location: null,
    currency: 'VND',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    preferred_language: 'vi',
    currency_format: 'VND',
    subscription_tier: 'professional',
    subscription_expires_at: '2024-12-31T00:00:00Z',
    annual_income: 540000000,
    monthly_expenses: 25000000,
    current_assets: 2000000000,
    current_debts: 800000000,
    experience_points: 2100,
    achievement_badges: ['smart_investor', 'property_expert', 'financial_guru'],
    onboarding_completed: true,
    notification_preferences: {},
    created_at: '2023-11-05T11:30:00Z',
    updated_at: '2024-01-18T13:20:00Z',
    last_login_at: '2024-01-18T11:45:00Z',
    is_active: true
  },
  {
    id: '4',
    email: 'pham.thi.d@email.com',
    full_name: 'Phạm Thị D',
    avatar_url: '/avatars/user4.jpg',
    phone: '+84976543210',
    date_of_birth: '1992-03-10',
    occupation: 'Teacher',
    company: 'Hanoi University',
    monthly_income: 12000000,
    city: 'Hanoi',
    district: 'Dong Da',
    address: '321 Giai Phong Road',
    location: null,
    currency: 'VND',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    preferred_language: 'vi',
    currency_format: 'VND',
    subscription_tier: 'free',
    subscription_expires_at: null,
    annual_income: 144000000,
    monthly_expenses: 8000000,
    current_assets: 80000000,
    current_debts: 30000000,
    experience_points: 200,
    achievement_badges: ['knowledge_seeker'],
    onboarding_completed: false,
    notification_preferences: {},
    created_at: '2024-01-25T15:00:00Z',
    updated_at: '2024-01-25T15:00:00Z',
    last_login_at: '2024-01-25T15:30:00Z',
    is_active: true
  },
  {
    id: '5',
    email: 'vo.van.e@inactive.com',
    full_name: 'Võ Văn E',
    avatar_url: null,
    phone: '+84965432109',
    date_of_birth: '1980-11-28',
    occupation: 'Freelancer',
    company: null,
    monthly_income: 8000000,
    city: 'Can Tho',
    district: 'Ninh Kieu',
    address: '654 Tran Hung Dao Street',
    location: null,
    currency: 'VND',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    preferred_language: 'vi',
    currency_format: 'VND',
    subscription_tier: 'free',
    subscription_expires_at: null,
    annual_income: 96000000,
    monthly_expenses: 6000000,
    current_assets: 30000000,
    current_debts: 10000000,
    experience_points: 50,
    achievement_badges: [],
    onboarding_completed: true,
    notification_preferences: {},
    created_at: '2023-08-12T12:00:00Z',
    updated_at: '2023-12-15T10:30:00Z',
    last_login_at: '2023-12-15T10:30:00Z',
    is_active: false
  }
]

export const UserManagementTable: React.FC = () => {
  const [data] = useState(mockUsers)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'professional':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'premium':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'free':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getSubscriptionIcon = (tier: string) => {
    switch (tier) {
      case 'professional':
        return Crown
      case 'premium':
        return Shield
      default:
        return UserCheck
    }
  }

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    return date.toLocaleDateString('vi-VN')
  }

  const columns = useMemo<ColumnDef<UserProfile>[]>(
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
        accessorKey: 'full_name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            User
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const user = row.original
          const initials = user.full_name
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
          
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-gray-900">
                  {user.full_name}
                </div>
                <div className="text-sm text-gray-500">
                  {user.email}
                </div>
                {user.phone && (
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {user.phone}
                  </div>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'subscription_tier',
        header: 'Subscription',
        cell: ({ row }) => {
          const tier = row.getValue('subscription_tier') as string
          const expiresAt = row.original.subscription_expires_at
          const IconComponent = getSubscriptionIcon(tier)
          
          return (
            <div className="space-y-1">
              <Badge 
                variant="outline" 
                className={cn('text-xs', getSubscriptionColor(tier))}
              >
                <IconComponent className="w-3 h-3 mr-1" />
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </Badge>
              {expiresAt && (
                <div className="text-xs text-gray-500">
                  Expires: {new Date(expiresAt).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>
          )
        },
        filterFn: (row, _id, value) => {
          if (value === 'all') return true
          return row.getValue('subscription_tier') === value
        },
      },
      {
        accessorKey: 'occupation',
        header: 'Occupation',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900 text-sm">
              {row.original.occupation || 'N/A'}
            </div>
            {row.original.company && (
              <div className="text-xs text-gray-500">
                {row.original.company}
              </div>
            )}
            <div className="text-xs text-gray-600 mt-1">
              {formatCurrency(row.original.monthly_income)}
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <div className="text-sm">
            {row.original.city && (
              <div className="flex items-center gap-1 text-gray-900">
                <MapPin className="w-3 h-3" />
                {row.original.city}
              </div>
            )}
            {row.original.district && (
              <div className="text-gray-500 text-xs">
                {row.original.district}
              </div>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'experience_points',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            XP & Badges
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <div className="font-bold text-blue-600">
              {row.getValue('experience_points')} XP
            </div>
            <div className="text-xs text-gray-500">
              {row.original.achievement_badges.length} badges
            </div>
            {row.original.achievement_badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {row.original.achievement_badges.slice(0, 2).map((badge) => (
                  <Badge key={badge} variant="secondary" className="text-xs">
                    {badge.replace('_', ' ')}
                  </Badge>
                ))}
                {row.original.achievement_badges.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{row.original.achievement_badges.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'last_login_at',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Last Login
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const lastLogin = row.getValue('last_login_at') as string | null
          
          return (
            <div className="text-sm">
              <div className="text-gray-900">
                {formatTimeAgo(lastLogin)}
              </div>
              {lastLogin && (
                <div className="text-xs text-gray-500">
                  {new Date(lastLogin).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.original.is_active
          const onboardingCompleted = row.original.onboarding_completed
          
          return (
            <div className="space-y-1">
              <Badge 
                variant={isActive ? 'default' : 'secondary'}
                className={cn(
                  'text-xs',
                  isActive 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : 'bg-red-100 text-red-800 border-red-300'
                )}
              >
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
              {!onboardingCompleted && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-300">
                  Incomplete
                </Badge>
              )}
            </div>
          )
        },
        filterFn: (row, _id, value) => {
          if (value === 'all') return true
          if (value === 'active') return row.original.is_active
          if (value === 'inactive') return !row.original.is_active
          if (value === 'incomplete') return !row.original.onboarding_completed
          return true
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const user = row.original

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
                  onClick={() => navigator.clipboard.writeText(user.id)}
                >
                  Copy user ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit user
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Send email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  View activity
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.is_active ? (
                  <DropdownMenuItem className="text-orange-600">
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend user
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-green-600">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Reactivate user
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete user
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
              placeholder="Search users..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
          <Select
            value={(table.getColumn('subscription_tier')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('subscription_tier')?.setFilterValue(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
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
              <SelectItem value="incomplete">Incomplete</SelectItem>
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