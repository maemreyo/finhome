#!/usr/bin/env node
// Test script for batch transaction API
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/transactions/batch';

// Test data matching the expected schema
const testData = {
  user_id: "457cc15c-4d5d-40c6-82e7-0814b75dda16", // This should be a valid user ID
  wallet_id: "550e8400-e29b-41d4-a716-446655440000", // This should be a valid wallet ID
  transactions: [
    {
      transaction_type: "expense",
      amount: 50000,
      currency: "VND",
      description: "Breakfast at cafe",
      notes: "Morning coffee and croissant",
      expense_category_key: "food_dining",
      tags: ["breakfast", "coffee"],
      transaction_date: "2025-01-23",
      transaction_time: "08:30:00",
      merchant_name: "Highlands Coffee",
      is_confirmed: true
    }
  ]
};

async function testBatchAPI() {
  try {
    console.log('Testing batch transaction API...');
    console.log('Request data:', JSON.stringify(testData, null, 2));

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, you'd need proper authentication headers
      },
      body: JSON.stringify(testData)
    });

    const responseData = await response.json();
    
    console.log('\nResponse status:', response.status);
    console.log('Response data:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('\n✅ Test successful!');
    } else {
      console.log('\n❌ Test failed!');
      if (responseData.error) {
        console.log('Error:', responseData.error);
        if (responseData.details) {
          console.log('Details:', responseData.details);
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

// Run the test
testBatchAPI();