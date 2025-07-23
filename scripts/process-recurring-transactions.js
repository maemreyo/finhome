#!/usr/bin/env node
// scripts/process-recurring-transactions.js
// Script to process recurring transactions - can be run as a cron job

const process = require('process')

/**
 * Process recurring transactions by calling the API endpoint
 * This script can be scheduled to run daily via cron
 */
async function processRecurringTransactions() {
  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3033'
  const API_KEY = process.env.RECURRING_PROCESSOR_API_KEY || 'recurring_processor_secret_key_2025'

  try {
    console.log(`[${new Date().toISOString()}] Processing recurring transactions...`)

    const response = await fetch(`${API_URL}/api/expenses/recurring/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    console.log(`[${new Date().toISOString()}] Processing completed:`)
    console.log(`  - Processed: ${result.processedCount} transactions`)
    console.log(`  - Errors: ${result.errorCount} transactions`)

    if (result.processedTransactions.length > 0) {
      console.log('\nProcessed transactions:')
      result.processedTransactions.forEach(tx => {
        console.log(`  - ${tx.recurringTransactionName}: ${tx.amount.toLocaleString()} VND (${tx.transactionType})`)
      })
    }

    if (result.errors.length > 0) {
      console.log('\nErrors:')
      result.errors.forEach(error => {
        console.log(`  - ${error.recurringTransactionName}: ${error.error}`)
      })
    }

    // Exit with non-zero code if there were errors
    process.exit(result.errorCount > 0 ? 1 : 0)

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error processing recurring transactions:`, error.message)
    process.exit(1)
  }
}

// Run the processing if this script is executed directly
if (require.main === module) {
  processRecurringTransactions()
}

module.exports = { processRecurringTransactions }

/*
CRON SETUP EXAMPLES:

1. Run daily at 1:00 AM:
   0 1 * * * /usr/bin/node /path/to/finhome/scripts/process-recurring-transactions.js >> /var/log/recurring-transactions.log 2>&1

2. Run every hour:
   0 * * * * /usr/bin/node /path/to/finhome/scripts/process-recurring-transactions.js >> /var/log/recurring-transactions.log 2>&1

3. Run daily at 6:00 AM with environment variables:
   0 6 * * * cd /path/to/finhome && /usr/bin/node scripts/process-recurring-transactions.js >> /var/log/recurring-transactions.log 2>&1

ENVIRONMENT VARIABLES NEEDED:
- NEXT_PUBLIC_APP_URL: Your app URL (e.g., https://yourapp.com)
- RECURRING_PROCESSOR_API_KEY: The API key for processing (same as in .env.local)

SYSTEMD SERVICE EXAMPLE:
Create /etc/systemd/system/recurring-transactions.service:

[Unit]
Description=Process Recurring Transactions
After=network.target

[Service]
Type=oneshot
User=www-data
WorkingDirectory=/path/to/finhome
Environment=NEXT_PUBLIC_APP_URL=https://yourapp.com
Environment=RECURRING_PROCESSOR_API_KEY=your_secret_key
ExecStart=/usr/bin/node scripts/process-recurring-transactions.js

Then create /etc/systemd/system/recurring-transactions.timer:

[Unit]
Description=Run recurring transactions processor daily
Requires=recurring-transactions.service

[Timer]
OnCalendar=*-*-* 01:00:00
Persistent=true

[Install]
WantedBy=timers.target

Enable with:
sudo systemctl enable recurring-transactions.timer
sudo systemctl start recurring-transactions.timer
*/