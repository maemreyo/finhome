#!/bin/bash

# Simple test for batch transaction API without authentication
# This will test our error handling paths

curl -X POST http://localhost:3033/api/transactions/batch \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "457cc15c-4d5d-40c6-82e7-0814b75dda16",
    "wallet_id": "84ccf154-a16f-4754-9317-b755b7ba60ad",
    "transactions": [
      {
        "transaction_type": "expense",
        "amount": 50000,
        "currency": "VND",
        "description": "Test expense",
        "expense_category_key": "food_dining"
      }
    ]
  }' \
  | jq .