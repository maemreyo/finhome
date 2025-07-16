// src/lib/utils/export-import.ts
// Export and import utilities for admin data

import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

// CSV Export/Import utilities
export class ExportImportUtils {
  // Convert array of objects to CSV string
  static arrayToCSV(data: any[], filename: string = 'export.csv'): string {
    if (!data.length) return ''

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle null/undefined values
          if (value === null || value === undefined) return ''
          // Handle objects/arrays - stringify them
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          // Handle strings with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    return csvContent
  }

  // Download CSV file
  static downloadCSV(data: any[], filename: string = 'export.csv'): void {
    const csvContent = this.arrayToCSV(data, filename)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, filename)
  }

  // Download Excel file
  static downloadExcel(data: any[], filename: string = 'export.xlsx', sheetName: string = 'Data'): void {
    if (!data.length) return

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    // Auto-size columns
    const colWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(
        key.length,
        ...data.map(row => 
          row[key] ? row[key].toString().length : 0
        )
      )
    }))
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // Write file
    XLSX.writeFile(wb, filename)
  }

  // Parse CSV string to array of objects
  static parseCSV(csvString: string): any[] {
    const lines = csvString.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'))
    
    return lines.slice(1).map(line => {
      const values = this.parseCSVLine(line)
      const obj: any = {}
      
      headers.forEach((header, index) => {
        let value = values[index] || ''
        
        // Try to parse JSON objects
        if (value.startsWith('{') || value.startsWith('[')) {
          try {
            value = JSON.parse(value)
          } catch {
            // Keep as string if not valid JSON
          }
        }
        // Try to parse numbers
        else if (!isNaN(Number(value)) && value !== '') {
          value = Number(value).toString()
        }
        // Try to parse booleans
        else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          value = (value.toLowerCase() === 'true').toString()
        }
        
        obj[header] = value as any
      })
      
      return obj
    })
  }

  // Parse a single CSV line handling quoted values
  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  // Read file content
  static readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  // Read Excel file
  static readExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  // Validate import data structure
  static validateImportData(data: any[], requiredFields: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!Array.isArray(data)) {
      errors.push('Data must be an array')
      return { isValid: false, errors }
    }
    
    if (data.length === 0) {
      errors.push('No data to import')
      return { isValid: false, errors }
    }
    
    const firstRow = data[0]
    const fields = Object.keys(firstRow)
    
    // Check required fields
    const missingFields = requiredFields.filter(field => !fields.includes(field))
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`)
    }
    
    // Validate each row
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (row[field] === undefined || row[field] === null || row[field] === '') {
          errors.push(`Row ${index + 1}: Missing value for ${field}`)
        }
      })
    })
    
    return { isValid: errors.length === 0, errors }
  }

  // Format data for specific tables
  static formatBankData(rawData: any[]): any[] {
    return rawData.map(row => ({
      bank_code: row.bank_code || '',
      bank_name: row.bank_name || '',
      bank_name_en: row.bank_name_en || null,
      logo_url: row.logo_url || null,
      website_url: row.website_url || null,
      hotline: row.hotline || null,
      email: row.email || null,
      headquarters_address: row.headquarters_address || null,
      loan_products: typeof row.loan_products === 'string' 
        ? JSON.parse(row.loan_products) 
        : row.loan_products || {},
      special_offers: typeof row.special_offers === 'string' 
        ? JSON.parse(row.special_offers) 
        : row.special_offers || {},
      is_active: Boolean(row.is_active),
      is_featured: Boolean(row.is_featured)
    }))
  }

  static formatInterestRateData(rawData: any[]): any[] {
    return rawData.map(row => ({
      bank_id: row.bank_id || '',
      product_name: row.product_name || '',
      loan_type: row.loan_type || '',
      interest_rate: Number(row.interest_rate) || 0,
      min_rate: row.min_rate ? Number(row.min_rate) : null,
      max_rate: row.max_rate ? Number(row.max_rate) : null,
      min_loan_amount: row.min_loan_amount ? Number(row.min_loan_amount) : null,
      max_loan_amount: row.max_loan_amount ? Number(row.max_loan_amount) : null,
      max_ltv_ratio: row.max_ltv_ratio ? Number(row.max_ltv_ratio) : null,
      min_term_months: row.min_term_months ? Number(row.min_term_months) : null,
      max_term_months: row.max_term_months ? Number(row.max_term_months) : null,
      min_income: row.min_income ? Number(row.min_income) : null,
      required_documents: typeof row.required_documents === 'string' 
        ? JSON.parse(row.required_documents) 
        : row.required_documents || {},
      eligibility_criteria: typeof row.eligibility_criteria === 'string' 
        ? JSON.parse(row.eligibility_criteria) 
        : row.eligibility_criteria || {},
      processing_fee: row.processing_fee ? Number(row.processing_fee) : null,
      processing_fee_percentage: row.processing_fee_percentage ? Number(row.processing_fee_percentage) : null,
      early_payment_fee: row.early_payment_fee ? Number(row.early_payment_fee) : null,
      effective_date: row.effective_date || new Date().toISOString(),
      expiry_date: row.expiry_date || null,
      is_active: Boolean(row.is_active)
    }))
  }

  static formatAchievementData(rawData: any[]): any[] {
    return rawData.map(row => ({
      name: row.name || '',
      name_vi: row.name_vi || '',
      description: row.description || '',
      description_vi: row.description_vi || '',
      achievement_type: row.achievement_type || 'milestone',
      required_actions: typeof row.required_actions === 'string' 
        ? JSON.parse(row.required_actions) 
        : row.required_actions || {},
      required_value: row.required_value ? Number(row.required_value) : null,
      experience_points: Number(row.experience_points) || 0,
      badge_icon: row.badge_icon || null,
      badge_color: row.badge_color || '#10B981',
      is_active: Boolean(row.is_active),
      is_hidden: Boolean(row.is_hidden),
      sort_order: Number(row.sort_order) || 0
    }))
  }

  // Generate template files
  static generateBankTemplate(): void {
    const template = [{
      bank_code: 'EXAMPLE',
      bank_name: 'Example Bank Vietnam',
      bank_name_en: 'Example Bank Vietnam Ltd',
      logo_url: 'https://example.com/logo.png',
      website_url: 'https://example.com',
      hotline: '1900 123456',
      email: 'contact@example.com',
      headquarters_address: '123 Example Street, Ho Chi Minh City',
      loan_products: '{"home_loan": true, "investment_loan": false}',
      special_offers: '{"first_time_buyer": "Special rate for first-time buyers"}',
      is_active: true,
      is_featured: false
    }]
    
    this.downloadCSV(template, 'bank_template.csv')
  }

  static generateInterestRateTemplate(): void {
    const template = [{
      bank_id: 'bank-uuid-here',
      product_name: 'Home Loan Premium',
      loan_type: 'home_loan',
      interest_rate: 7.5,
      min_rate: 7.0,
      max_rate: 8.0,
      min_loan_amount: 500000000,
      max_loan_amount: 50000000000,
      max_ltv_ratio: 80,
      min_term_months: 60,
      max_term_months: 300,
      min_income: 20000000,
      required_documents: '{"identity": true, "income_proof": true}',
      eligibility_criteria: '{"min_age": 21, "max_age": 65}',
      processing_fee: 5000000,
      processing_fee_percentage: 1.0,
      early_payment_fee: 2.0,
      effective_date: '2024-01-01T00:00:00Z',
      expiry_date: '2024-12-31T23:59:59Z',
      is_active: true
    }]
    
    this.downloadCSV(template, 'interest_rate_template.csv')
  }

  static generateAchievementTemplate(): void {
    const template = [{
      name: 'First Home Purchase',
      name_vi: 'Mua Nhà Đầu Tiên',
      description: 'Complete your first property purchase plan',
      description_vi: 'Hoàn thành kế hoạch mua bất động sản đầu tiên',
      achievement_type: 'milestone',
      required_actions: '{"action": "complete_purchase_plan", "count": 1}',
      required_value: 1,
      experience_points: 100,
      badge_icon: 'home',
      badge_color: '#10B981',
      is_active: true,
      is_hidden: false,
      sort_order: 1
    }]
    
    this.downloadCSV(template, 'achievement_template.csv')
  }
}