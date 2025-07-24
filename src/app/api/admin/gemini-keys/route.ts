// src/app/api/admin/gemini-keys/route.ts
// API routes for Gemini API key management

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';

// Encryption utilities for secure key storage
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.GEMINI_KEYS_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-gcm';

interface GeminiApiKey {
  id?: string;
  name: string;
  key: string;
  is_active: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
  last_used?: string;
  usage_count?: number;
  failure_count?: number;
}

// Encrypt sensitive data
function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  cipher.setAAD(Buffer.from('gemini-api-key'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

// Decrypt sensitive data
function decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAAD(Buffer.from('gemini-api-key'));
  decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Check if user is admin
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

// GET - List all API keys (with masked values)
export async function GET(request: NextRequest) {
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

    // Fetch API keys from database
    const { data: keys, error } = await supabase
      .from('gemini_api_keys')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }

    // Return masked keys (show only last 4 characters)
    const maskedKeys = keys?.map(key => ({
      ...key,
      key: '***...' + key.encrypted_key.slice(-4),
      encrypted_key: undefined // Don't expose encrypted data
    })) || [];

    return NextResponse.json({ keys: maskedKeys });

  } catch (error) {
    console.error('Error in GET /api/admin/gemini-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add new API key
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

    const body = await request.json();
    const { name, key, is_active = true, priority = 1 } = body;

    // Validate input
    if (!name || !key) {
      return NextResponse.json({ error: 'Name and key are required' }, { status: 400 });
    }

    if (!key.startsWith('AIza')) {
      return NextResponse.json({ error: 'Invalid Gemini API key format' }, { status: 400 });
    }

    // Encrypt the API key
    const encryptedData = encrypt(key);

    // Insert into database
    const { data: newKey, error } = await supabase
      .from('gemini_api_keys')
      .insert({
        name,
        encrypted_key: encryptedData.encrypted,
        encryption_iv: encryptedData.iv,
        encryption_tag: encryptedData.tag,
        is_active,
        priority,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting API key:', error);
      return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 });
    }

    // Log the action
    await supabase
      .from('gemini_key_audit_log')
      .insert({
        key_id: newKey.id,
        action: 'created',
        user_id: user.id,
        details: { name, priority, is_active }
      });

    // Return success (without exposing the actual key)
    return NextResponse.json({ 
      message: 'API key added successfully',
      key: {
        ...newKey,
        key: '***...' + key.slice(-4),
        encrypted_key: undefined
      }
    });

  } catch (error) {
    console.error('Error in POST /api/admin/gemini-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update API key
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { id, name, is_active, priority } = body;

    if (!id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    // Update the key
    const { data: updatedKey, error } = await supabase
      .from('gemini_api_keys')
      .update({
        name,
        is_active,
        priority,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating API key:', error);
      return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 });
    }

    // Log the action
    await supabase
      .from('gemini_key_audit_log')
      .insert({
        key_id: id,
        action: 'updated',
        user_id: user.id,
        details: { name, is_active, priority }
      });

    return NextResponse.json({ 
      message: 'API key updated successfully',
      key: {
        ...updatedKey,
        encrypted_key: undefined
      }
    });

  } catch (error) {
    console.error('Error in PUT /api/admin/gemini-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove API key
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    // Get key info before deletion for logging
    const { data: keyInfo } = await supabase
      .from('gemini_api_keys')
      .select('name')
      .eq('id', keyId)
      .single();

    // Delete the key
    const { error } = await supabase
      .from('gemini_api_keys')
      .delete()
      .eq('id', keyId);

    if (error) {
      console.error('Error deleting API key:', error);
      return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
    }

    // Log the action
    await supabase
      .from('gemini_key_audit_log')
      .insert({
        key_id: keyId,
        action: 'deleted',
        user_id: user.id,
        details: { name: keyInfo?.name }
      });

    return NextResponse.json({ message: 'API key deleted successfully' });

  } catch (error) {
    console.error('Error in DELETE /api/admin/gemini-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}