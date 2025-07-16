// src/components/admin/BankManagementTableConnected.tsx
// Bank management table connected to real Supabase data

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
  Mail,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRealtimeBanks } from '@/lib/hooks/useRealtimeData'
import { ExportImportUtils } from '@/lib/utils/export-import'
import { useToast } from '@/hooks/use-toast'
import { AdminQueriesClient } from '@/lib/supabase/admin-queries-client'
import type { Bank } from '@/lib/supabase/types'

interface BankManagementTableConnectedProps {
  initialData: Bank[]
  locale: string
}

export const BankManagementTableConnected: React.FC<BankManagementTableConnectedProps> = ({
  initialData,
  locale
}) => {
  const { data, isLoading, setData } = useRealtimeBanks(initialData)
  const { toast } = useToast()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const handleUpdateBank = async (id: string, updates: Partial<Bank>) => {
    try {
      const updatedBank = await AdminQueriesClient.updateBank(id, updates)
      setData(prev => prev.map(bank => bank.id === id ? updatedBank : bank))
      
      toast({
        title: "Bank updated",
        description: "Bank information has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bank. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBank = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank? This action cannot be undone.')) {
      return
    }

    try {
      await AdminQueriesClient.deleteBank(id)
      setData(prev => prev.filter(bank => bank.id !== id))
      
      toast({
        title: "Bank deleted",
        description: "Bank has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bank. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportData = async () => {
    try {
      const exportData = await AdminQueriesClient.exportData('banks', 'csv')
      ExportImportUtils.downloadCSV(exportData, `banks_export_${new Date().toISOString().split('T')[0]}.csv`)
      
      toast({
        title: "Export completed",
        description: "Bank data has been exported successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBulkStatusUpdate = async (bankIds: string[], isActive: boolean) => {
    try {
      await AdminQueriesClient.bulkUpdateBankStatus(bankIds, isActive)
      setData(prev => prev.map(bank => 
        bankIds.includes(bank.id) ? { ...bank, is_active: isActive } : bank
      ))
      
      toast({
        title: "Bulk update completed",
        description: `${bankIds.length} banks have been ${isActive ? 'activated' : 'deactivated'}.`,
      })
      
      setRowSelection({})
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update banks. Please try again.",
        variant: "destructive",
      })
    }
  }

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
                <DropdownMenuItem
                  onClick={() => handleUpdateBank(bank.id, { is_active: !bank.is_active })}
                >
                  {bank.is_active ? 'Deactivate' : 'Activate'}
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
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => handleDeleteBank(bank.id)}
                >
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

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedBankIds = selectedRows.map(row => row.original.id)

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
          
          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate(selectedBankIds, true)}
              >
                Activate ({selectedRows.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate(selectedBankIds, false)}
              >
                Deactivate ({selectedRows.length})
              </Button>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-500">Loading banks...</div>
        </div>
      )}

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