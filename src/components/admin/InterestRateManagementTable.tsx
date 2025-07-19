// src/components/admin/InterestRateManagementTable.tsx
// Interest rate management table using TanStack Table

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
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BankInterestRate } from '@/lib/supabase/types'

// Mock data based on your database schema
const mockInterestRates: (BankInterestRate & { bank_name?: string; bank_code?: string })[] = [
  {
    id: '1',
    bank_id: '1',
    bank_name: 'BIDV',
    bank_code: 'BIDV',
    product_name: 'Home Loan Premium',
    loan_type: 'home_loan',
    interest_rate: 7.3,
    min_rate: 7.0,
    max_rate: 7.8,
    min_loan_amount: 500000000, // 500M VND
    max_loan_amount: 50000000000, // 50B VND
    max_ltv_ratio: 80,
    min_term_months: 60,
    max_term_months: 300,
    min_income: 20000000, // 20M VND
    required_documents: {
      identity: true,
      income_proof: true,
      property_papers: true,
      bank_statement: true
    },
    eligibility_criteria: {
      min_age: 21,
      max_age: 65,
      employment_type: ['employee', 'business_owner'],
      credit_score_min: 650
    },
    processing_fee: 5000000, // 5M VND
    processing_fee_percentage: 1.0,
    early_payment_fee: 2.0,
    effective_date: '2024-01-01T00:00:00Z',
    expiry_date: '2024-06-30T23:59:59Z',
    is_active: true,
    promotional_rate: 6.5,
    promotional_period_months: 12,
    promotional_conditions: { new_customer: true },
    promotional_end_date: '2024-06-30',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    bank_id: '2',
    bank_name: 'VCB',
    bank_code: 'VCB',
    product_name: 'Vay Mua Nhà Ưu Đãi',
    loan_type: 'home_loan',
    interest_rate: 7.5,
    min_rate: 7.2,
    max_rate: 8.0,
    min_loan_amount: 300000000,
    max_loan_amount: 30000000000,
    max_ltv_ratio: 75,
    min_term_months: 36,
    max_term_months: 240,
    min_income: 15000000,
    required_documents: {
      identity: true,
      income_proof: true,
      property_papers: true,
      bank_statement: false
    },
    eligibility_criteria: {
      min_age: 22,
      max_age: 60,
      employment_type: ['employee'],
      credit_score_min: 700
    },
    processing_fee: null,
    processing_fee_percentage: 0.8,
    early_payment_fee: 1.5,
    effective_date: '2024-01-15T00:00:00Z',
    expiry_date: '2024-12-31T23:59:59Z',
    is_active: true,
    promotional_rate: null,
    promotional_period_months: null,
    promotional_conditions: {},
    promotional_end_date: null,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-20T14:45:00Z'
  },
  {
    id: '3',
    bank_id: '3',
    bank_name: 'VietinBank',
    bank_code: 'VTB',
    product_name: 'Investment Property Loan',
    loan_type: 'investment_loan',
    interest_rate: 8.2,
    min_rate: 7.8,
    max_rate: 8.5,
    min_loan_amount: 1000000000,
    max_loan_amount: 100000000000,
    max_ltv_ratio: 70,
    min_term_months: 60,
    max_term_months: 180,
    min_income: 50000000,
    required_documents: {
      identity: true,
      income_proof: true,
      property_papers: true,
      bank_statement: true,
      business_license: true
    },
    eligibility_criteria: {
      min_age: 25,
      max_age: 55,
      employment_type: ['business_owner'],
      credit_score_min: 750
    },
    processing_fee: 15000000,
    processing_fee_percentage: 1.5,
    early_payment_fee: 3.0,
    effective_date: '2024-02-01T00:00:00Z',
    expiry_date: '2024-04-30T23:59:59Z',
    is_active: true,
    promotional_rate: null,
    promotional_period_months: null,
    promotional_conditions: {},
    promotional_end_date: null,
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-02-01T09:15:00Z'
  },
  {
    id: '4',
    bank_id: '4',
    bank_name: 'ACB',
    bank_code: 'ACB',
    product_name: 'Refinance Special',
    loan_type: 'refinance',
    interest_rate: 6.8,
    min_rate: 6.5,
    max_rate: 7.2,
    min_loan_amount: 500000000,
    max_loan_amount: 20000000000,
    max_ltv_ratio: 85,
    min_term_months: 24,
    max_term_months: 360,
    min_income: 25000000,
    required_documents: {
      identity: true,
      income_proof: true,
      existing_loan_docs: true,
      property_valuation: true
    },
    eligibility_criteria: {
      min_age: 21,
      max_age: 65,
      employment_type: ['employee', 'business_owner'],
      existing_loan_history: true
    },
    processing_fee: 3000000,
    processing_fee_percentage: 0.5,
    early_payment_fee: 1.0,
    effective_date: '2024-01-01T00:00:00Z',
    expiry_date: '2024-03-31T23:59:59Z',
    is_active: false,
    promotional_rate: null,
    promotional_period_months: null,
    promotional_conditions: {},
    promotional_end_date: null,
    created_at: '2023-12-15T00:00:00Z',
    updated_at: '2024-01-05T16:20:00Z'
  },
  {
    id: '5',
    bank_id: '1',
    bank_name: 'BIDV',
    bank_code: 'BIDV',
    product_name: 'First Home Buyer Special',
    loan_type: 'home_loan',
    interest_rate: 7.0,
    min_rate: 6.8,
    max_rate: 7.3,
    min_loan_amount: 200000000,
    max_loan_amount: 15000000000,
    max_ltv_ratio: 90,
    min_term_months: 84,
    max_term_months: 300,
    min_income: 12000000,
    required_documents: {
      identity: true,
      income_proof: true,
      property_papers: true,
      first_time_buyer_cert: true
    },
    eligibility_criteria: {
      min_age: 21,
      max_age: 35,
      first_time_buyer: true,
      employment_type: ['employee']
    },
    processing_fee: null,
    processing_fee_percentage: 0.3,
    early_payment_fee: 0.5,
    effective_date: '2024-03-01T00:00:00Z',
    expiry_date: '2024-03-15T23:59:59Z',
    is_active: true,
    promotional_rate: null,
    promotional_period_months: null,
    promotional_conditions: {},
    promotional_end_date: null,
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-20T11:00:00Z'
  }
]

export const InterestRateManagementTable: React.FC = () => {
  const [data] = useState(mockInterestRates)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercent = (rate: number) => {
    return `${rate.toFixed(2)}%`
  }

  const getLoanTypeColor = (type: string) => {
    switch (type) {
      case 'home_loan':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'investment_loan':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'refinance':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const columns = useMemo<ColumnDef<BankInterestRate & { bank_name?: string; bank_code?: string }>[]>(
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
        accessorKey: 'bank_name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Bank
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-blue-600">
                {row.original.bank_code}
              </div>
              <div className="text-sm text-gray-500">
                {row.original.bank_name}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'product_name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Product
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900 max-w-[200px]">
              {row.getValue('product_name')}
            </div>
            <Badge 
              variant="outline" 
              className={cn('text-xs mt-1', getLoanTypeColor(row.original.loan_type))}
            >
              {row.original.loan_type.replace('_', ' ')}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: 'interest_rate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Rate
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const rate = row.getValue('interest_rate') as number
          const minRate = row.original.min_rate
          const maxRate = row.original.max_rate
          
          return (
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {formatPercent(rate)}
              </div>
              {minRate && maxRate && (
                <div className="text-xs text-gray-500">
                  {formatPercent(minRate)} - {formatPercent(maxRate)}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'loan_amount_range',
        header: 'Loan Amount',
        cell: ({ row }) => {
          const minAmount = row.original.min_loan_amount
          const maxAmount = row.original.max_loan_amount
          
          return (
            <div className="text-sm">
              {minAmount && (
                <div className="text-gray-600">
                  Min: {formatCurrency(minAmount)}
                </div>
              )}
              {maxAmount && (
                <div className="text-gray-600">
                  Max: {formatCurrency(maxAmount)}
                </div>
              )}
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: 'max_ltv_ratio',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            LTV
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const ltv = row.getValue('max_ltv_ratio') as number
          
          return (
            <div className="text-center">
              <div className="font-medium text-gray-900">
                {ltv}%
              </div>
              <div className={cn(
                'text-xs',
                ltv >= 85 ? 'text-red-600' : 
                ltv >= 80 ? 'text-yellow-600' : 'text-green-600'
              )}>
                {ltv >= 85 ? 'High' : ltv >= 80 ? 'Medium' : 'Conservative'}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'term_range',
        header: 'Term (Months)',
        cell: ({ row }) => {
          const minTerm = row.original.min_term_months
          const maxTerm = row.original.max_term_months
          
          return (
            <div className="text-center text-sm">
              {minTerm && maxTerm && (
                <div className="text-gray-900">
                  {minTerm} - {maxTerm}
                </div>
              )}
              {maxTerm && (
                <div className="text-gray-500">
                  Up to {Math.round(maxTerm / 12)} years
                </div>
              )}
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: 'fees',
        header: 'Fees',
        cell: ({ row }) => {
          const processingFee = row.original.processing_fee
          const processingFeePercent = row.original.processing_fee_percentage
          const earlyPaymentFee = row.original.early_payment_fee
          
          return (
            <div className="text-xs space-y-1">
              {processingFee && (
                <div className="text-gray-600">
                  Processing: {formatCurrency(processingFee)}
                </div>
              )}
              {processingFeePercent && (
                <div className="text-gray-600">
                  Processing: {processingFeePercent}%
                </div>
              )}
              {earlyPaymentFee && (
                <div className="text-gray-600">
                  Early payment: {earlyPaymentFee}%
                </div>
              )}
            </div>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: 'expiry_date',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            Expiry
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const expiryDate = row.getValue('expiry_date') as string | null
          
          if (!expiryDate) {
            return <span className="text-gray-400 text-sm">No expiry</span>
          }
          
          const date = new Date(expiryDate)
          const expiringSoon = isExpiringSoon(expiryDate)
          const expired = isExpired(expiryDate)
          
          return (
            <div className="text-sm">
              <div className={cn(
                'font-medium',
                expired ? 'text-red-600' : 
                expiringSoon ? 'text-orange-600' : 'text-gray-900'
              )}>
                {date.toLocaleDateString('vi-VN')}
              </div>
              {expiringSoon && (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">Expiring soon</span>
                </div>
              )}
              {expired && (
                <div className="text-xs text-red-600">Expired</div>
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
          const expiryDate = row.original.expiry_date
          const expired = expiryDate ? isExpired(expiryDate) : false
          
          if (expired) {
            return (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )
          }
          
          return (
            <Badge 
              variant={isActive ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                isActive 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-gray-100 text-gray-800 border-gray-300'
              )}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          )
        },
        filterFn: (row, _id, value) => {
          if (value === 'all') return true
          if (value === 'active') return row.original.is_active
          if (value === 'inactive') return !row.original.is_active
          if (value === 'expired') return row.original.expiry_date ? isExpired(row.original.expiry_date) : false
          if (value === 'expiring') return row.original.expiry_date ? isExpiringSoon(row.original.expiry_date) : false
          return true
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const rate = row.original

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
                  onClick={() => navigator.clipboard.writeText(rate.id)}
                >
                  Copy rate ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit rate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Extend expiry
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Update fees
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete rate
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
              placeholder="Search rates..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
          <Select
            value={(table.getColumn('loan_type')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) =>
              table.getColumn('loan_type')?.setFilterValue(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="home_loan">Home Loan</SelectItem>
              <SelectItem value="investment_loan">Investment</SelectItem>
              <SelectItem value="refinance">Refinance</SelectItem>
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
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
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