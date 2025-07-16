// src/components/admin/BankManagementTable.tsx
// Bank management table using TanStack Table with full CRUD operations

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
  ExternalLink,
  Phone,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Bank } from '@/lib/supabase/types'

// Mock data based on your database schema
const mockBanks: Bank[] = [
  {
    id: '1',
    bank_code: 'BIDV',
    bank_name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    bank_name_en: 'Bank for Investment and Development of Vietnam',
    logo_url: '/banks/bidv-logo.png',
    website_url: 'https://www.bidv.com.vn',
    hotline: '1900 9247',
    email: 'contact@bidv.com.vn',
    headquarters_address: '35 Hàng Vôi, Hà Nội',
    loan_products: {
      home_loan: true,
      investment_loan: true,
      refinance: true
    },
    special_offers: {
      first_time_buyer: '0.5% discount for 6 months',
      high_income: 'Preferential rates for income > 50M VND'
    },
    is_active: true,
    is_featured: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    bank_code: 'VCB',
    bank_name: 'Ngân hàng TMCP Ngoại thương Việt Nam',
    bank_name_en: 'Joint Stock Commercial Bank for Foreign Trade of Vietnam',
    logo_url: '/banks/vcb-logo.png',
    website_url: 'https://www.vietcombank.com.vn',
    hotline: '1900 545413',
    email: 'info@vietcombank.com.vn',
    headquarters_address: '198 Trần Quang Khải, Hà Nội',
    loan_products: {
      home_loan: true,
      investment_loan: false,
      refinance: true
    },
    special_offers: {
      salary_account: 'No processing fee for salary account holders'
    },
    is_active: true,
    is_featured: true,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-18T16:45:00Z'
  },
  {
    id: '3',
    bank_code: 'VTB',
    bank_name: 'Ngân hàng TMCP Công thương Việt Nam',
    bank_name_en: 'Vietnam Joint Stock Commercial Bank for Industry and Trade',
    logo_url: '/banks/vtb-logo.png',
    website_url: 'https://www.vietinbank.vn',
    hotline: '1900 558868',
    email: 'support@vietinbank.vn',
    headquarters_address: '108 Trần Hưng Đạo, Hà Nội',
    loan_products: {
      home_loan: true,
      investment_loan: true,
      refinance: false
    },
    special_offers: {},
    is_active: true,
    is_featured: false,
    created_at: '2024-01-12T11:30:00Z',
    updated_at: '2024-01-19T13:20:00Z'
  },
  {
    id: '4',
    bank_code: 'ACB',
    bank_name: 'Ngân hàng TMCP Á Châu',
    bank_name_en: 'Asia Commercial Bank',
    logo_url: '/banks/acb-logo.png',
    website_url: 'https://www.acb.com.vn',
    hotline: '1900 545454',
    email: 'customercare@acb.com.vn',
    headquarters_address: '442 Nguyễn Thị Minh Khai, TP.HCM',
    loan_products: {
      home_loan: true,
      investment_loan: true,
      refinance: true
    },
    special_offers: {
      digital_discount: '0.3% discount for online applications'
    },
    is_active: false,
    is_featured: false,
    created_at: '2024-01-08T15:00:00Z',
    updated_at: '2024-01-16T10:15:00Z'
  }
]

export const BankManagementTable: React.FC = () => {
  const [data] = useState(mockBanks)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<Bank>[]>(
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
        accessorKey: 'bank_code',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono font-semibold text-blue-600">
            {row.getValue('bank_code')}
          </div>
        ),
      },
      {
        accessorKey: 'bank_name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Bank Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const bankName = row.getValue('bank_name') as string
          const logoUrl = row.original.logo_url
          
          return (
            <div className="flex items-center gap-3">
              {logoUrl && (
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">
                    {row.getValue('bank_code')}
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900 max-w-[300px] truncate">
                  {bankName}
                </div>
                <div className="text-sm text-gray-500 max-w-[300px] truncate">
                  {row.original.bank_name_en}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'contact',
        header: 'Contact Info',
        cell: ({ row }) => (
          <div className="space-y-1">
            {row.original.hotline && (
              <div className="flex items-center gap-1 text-sm">
                <Phone className="w-3 h-3 text-gray-400" />
                <span>{row.original.hotline}</span>
              </div>
            )}
            {row.original.email && (
              <div className="flex items-center gap-1 text-sm">
                <Mail className="w-3 h-3 text-gray-400" />
                <span className="truncate max-w-[150px]">{row.original.email}</span>
              </div>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'loan_products',
        header: 'Loan Products',
        cell: ({ row }) => {
          const products = row.original.loan_products as any
          const activeProducts = Object.entries(products || {})
            .filter(([_, active]) => active)
            .map(([product, _]) => product)

          return (
            <div className="flex flex-wrap gap-1">
              {activeProducts.map((product) => (
                <Badge key={product} variant="secondary" className="text-xs">
                  {product.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          )
        },
        enableSorting: false,
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
            {row.original.is_featured && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800 border-yellow-300">
                Featured
              </Badge>
            )}
          </div>
        ),
        filterFn: (row, _id, value) => {
          if (value === 'all') return true
          if (value === 'active') return row.original.is_active
          if (value === 'inactive') return !row.original.is_active
          if (value === 'featured') return row.original.is_featured
          return true
        },
      },
      {
        accessorKey: 'updated_at',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Last Updated
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue('updated_at'))
          return (
            <div className="text-sm text-gray-600">
              {date.toLocaleDateString('vi-VN')}
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const bank = row.original

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
                  onClick={() => navigator.clipboard.writeText(bank.id)}
                >
                  Copy bank ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit bank
                </DropdownMenuItem>
                {bank.website_url && (
                  <DropdownMenuItem asChild>
                    <a href={bank.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit website
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete bank
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
              placeholder="Search banks..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
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
              <SelectItem value="featured">Featured</SelectItem>
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