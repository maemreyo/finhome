// src/app/api/health/route.ts
// Simple health check endpoint for testing
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'finhome-api'
  })
}