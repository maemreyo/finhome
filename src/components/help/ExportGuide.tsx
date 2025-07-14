// src/components/help/ExportGuide.tsx
// Help guide for export functionality

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, BarChart3, Calculator, TrendingUp, Info } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const ExportGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Export Your Financial Plans
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Save and share your financial analysis with comprehensive export options
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Export */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                PDF Report Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    INCLUDES
                  </Badge>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Plan overview and property details
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Financial summary with key metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Detailed cash flow breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Risk analysis and recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Timeline milestones
                  </li>
                </ul>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <Info className="w-4 h-4 inline mr-1" />
                  Perfect for sharing with advisors or bank representatives
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Excel Export */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Excel Analysis Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    INCLUDES
                  </Badge>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Complete amortization schedule
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    20-year cash flow projection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Scenario comparison analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Detailed financial breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Editable calculations and formulas
                  </li>
                </ul>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-400">
                  <Calculator className="w-4 h-4 inline mr-1" />
                  Ideal for detailed financial analysis and modeling
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bulk Export */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Plans Comparison Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Compare Multiple Plans
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Export a side-by-side comparison of all your financial plans in a single Excel file. Perfect for portfolio analysis and decision making.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Included Metrics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-purple-500 rounded-full" />
                    Purchase prices
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-purple-500 rounded-full" />
                    Monthly payments
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-purple-500 rounded-full" />
                    ROI comparisons
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-purple-500 rounded-full" />
                    Risk assessments
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How to Export */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              How to Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h4 className="font-semibold">From Plan Details</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Open any financial plan and click the &quot;More&quot; menu (⋯) button. Select either PDF or Excel export option.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h4 className="font-semibold">From Plans List</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  In the plans list, click the dropdown menu on any plan card to export individual plans or use &quot;Export Comparison&quot; for bulk export.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h4 className="font-semibold">Download & Share</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Files will be automatically downloaded to your device. You can then share them with financial advisors, family, or colleagues.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ExportGuide