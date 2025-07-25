// src/app/api/admin/gemini-keys/test/route.ts
// API route for testing Gemini API key validity

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/src/types/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Encryption utilities (same as in main route)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.GEMINI_KEYS_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-gcm';

// Decrypt function
function decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAAD(Buffer.from('gemini-api-key'));
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Check admin access
async function checkAdminAccess(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', userId)  // Fixed: using 'id' instead of 'user_id'
      .single();
    
    return profile?.is_admin === true;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

// POST - Test API key validity
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access
    const isAdmin = await checkAdminAccess(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get key ID from query params
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    // Fetch the encrypted key from database
    let keyData;
    try {
      const { data, error: fetchError } = await supabase
        .from('gemini_api_keys')
        .select('encrypted_key, encryption_iv, encryption_tag, name, failure_count')
        .eq('id', keyId)
        .single();

      if (fetchError || !data) {
        return NextResponse.json({ error: 'API key not found' }, { status: 404 });
      }
      keyData = data;
    } catch (error) {
      console.error('Database error while fetching API key:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    try {
      // Decrypt the API key
      const decryptedKey = decrypt({
        encrypted: keyData.encrypted_key,
        iv: keyData.encryption_iv,
        tag: keyData.encryption_tag
      });

      // Test the key with Google Generative AI
      const genAI = new GoogleGenerativeAI(decryptedKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Simple test prompt
      const result = await model.generateContent('Hello, respond with just "OK"');
      const response = await result.response;
      const text = response.text();

      // Update last_used timestamp and test success
      try {
        await supabase
          .from('gemini_api_keys')
          .update({ 
            last_used: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', keyId);

        // Log the test action
        await supabase
          .from('gemini_key_audit_log')
          .insert({
            key_id: keyId,
            action: 'used',
            user_id: user.id,
            details: { 
              name: keyData.name,
              test_result: 'success',
              response_preview: text.substring(0, 50)
            }
          });
      } catch (dbError) {
        console.log('Could not update database after successful test:', dbError);
        // Continue - the test was successful even if we can't log it
      }

      return NextResponse.json({ 
        success: true,
        message: 'API key is valid and working',
        test_response: text.substring(0, 100) // First 100 chars of response
      });

    } catch (testError) {
      console.error('API key test failed:', testError);
      
      // Update failure count
      try {
        await supabase
          .from('gemini_api_keys')
          .update({ 
            failure_count: keyData.failure_count ? keyData.failure_count + 1 : 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', keyId);

        // Log the failed test
        await supabase
          .from('gemini_key_audit_log')
          .insert({
            key_id: keyId,
            action: 'failed',
            user_id: user.id,
            details: { 
              name: keyData.name,
              error: testError instanceof Error ? testError.message : 'Unknown error'
            }
          });
      } catch (dbError) {
        console.log('Could not update database after failed test:', dbError);
        // Continue - we still want to return the test failure
      }

      return NextResponse.json({ 
        success: false,
        error: 'API key test failed',
        details: testError instanceof Error ? testError.message : 'Unknown error'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in POST /api/admin/gemini-keys/test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}