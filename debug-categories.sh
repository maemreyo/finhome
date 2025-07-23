#!/bin/bash

# Debug script to check what categories exist
echo "Testing category endpoints..."

echo -e "\n=== Testing expense categories endpoint ==="
curl -s "http://localhost:3033/api/expenses/categories" | jq '.expense_categories | length' 2>/dev/null || echo "No expense categories endpoint or no data"

echo -e "\n=== Let's check if there's a direct category debugging endpoint ==="
curl -s "http://localhost:3033/api/debug/categories" 2>/dev/null || echo "No debug endpoint"

echo -e "\n=== Check parse endpoint for category info ==="
echo "This should show available categories in logs..."