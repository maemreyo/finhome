-- 017_atomic_transactions.sql
-- Atomic Batch Transaction Processing for Data Integrity
-- Ensures multi-step transactions (like "ăn sáng 40k, đổ xăng 50k") are processed atomically

-- =============================================
-- ERROR LOGGING TABLE
-- =============================================

-- Table for comprehensive error logging and monitoring
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_context JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient error monitoring
CREATE INDEX idx_error_logs_user_type ON error_logs(user_id, error_type, created_at DESC);
CREATE INDEX idx_error_logs_unresolved ON error_logs(resolved, created_at DESC) WHERE resolved = false;

-- Enable RLS on error logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy for error logs (users can only see their own errors, admins see all)
CREATE POLICY "Users can view own error logs" ON error_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all error logs" ON error_logs
    FOR ALL USING (is_admin(auth.uid()));

-- =============================================
-- BATCH TRANSACTION FUNCTION
-- =============================================

-- Function to process multiple transactions atomically
CREATE OR REPLACE FUNCTION create_batch_transactions(
    batch_data JSONB
) RETURNS JSONB AS $$
DECLARE
    result JSONB := jsonb_build_object('success', true, 'errors', '[]'::jsonb, 'transaction_ids', '[]'::jsonb);
    transaction_record JSONB;
    new_transaction_id UUID;
    wallet_balance DECIMAL(15,2);
    required_balance DECIMAL(15,2) := 0;
    transaction_type_val transaction_type;
    expense_amount DECIMAL(15,2);
    batch_user_id UUID;
    batch_wallet_id UUID;
    error_details JSONB;
    category_id UUID;
    income_cat_id UUID;
    transfer_wallet_id UUID;
    transfer_fee_val DECIMAL(15,2);
BEGIN
    -- Validate input structure
    IF batch_data->>'user_id' IS NULL OR batch_data->>'wallet_id' IS NULL OR batch_data->'transactions' IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Missing required fields: user_id, wallet_id, or transactions array',
            'transaction_ids', '[]'::jsonb
        );
    END IF;

    -- Extract batch-level data
    batch_user_id := (batch_data->>'user_id')::UUID;
    batch_wallet_id := (batch_data->>'wallet_id')::UUID;

    -- Verify user owns the wallet
    SELECT balance INTO wallet_balance 
    FROM expense_wallets 
    WHERE id = batch_wallet_id AND user_id = batch_user_id AND is_active = true;
    
    IF wallet_balance IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Wallet not found or user does not have access',
            'transaction_ids', '[]'::jsonb
        );
    END IF;

    -- Pre-calculate total required balance for expense transactions
    FOR transaction_record IN SELECT * FROM jsonb_array_elements(batch_data->'transactions')
    LOOP
        transaction_type_val := (transaction_record->>'transaction_type')::transaction_type;
        expense_amount := (transaction_record->>'amount')::DECIMAL(15,2);
        transfer_fee_val := COALESCE((transaction_record->>'transfer_fee')::DECIMAL(15,2), 0);
        
        IF transaction_type_val = 'expense' THEN
            required_balance := required_balance + expense_amount;
        ELSIF transaction_type_val = 'transfer' THEN
            required_balance := required_balance + expense_amount + transfer_fee_val;
        END IF;
    END LOOP;

    -- Check if wallet has sufficient balance for all expense transactions
    IF wallet_balance < required_balance THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', format('Insufficient balance. Required: %s VND, Available: %s VND', 
                           required_balance::TEXT, wallet_balance::TEXT),
            'transaction_ids', '[]'::jsonb
        );
    END IF;

    -- BEGIN atomic transaction block
    BEGIN
        -- Process each transaction in the batch
        FOR transaction_record IN SELECT * FROM jsonb_array_elements(batch_data->'transactions')
        LOOP
            -- Extract and validate transaction data
            transaction_type_val := (transaction_record->>'transaction_type')::transaction_type;
            expense_amount := (transaction_record->>'amount')::DECIMAL(15,2);
            
            -- Validate amount is positive
            IF expense_amount <= 0 THEN
                RAISE EXCEPTION 'Transaction amount must be positive: %', expense_amount;
            END IF;

            -- Handle category assignment based on transaction type
            category_id := NULL;
            income_cat_id := NULL;
            transfer_wallet_id := NULL;
            transfer_fee_val := 0;

            IF transaction_type_val = 'expense' THEN
                -- Try to get expense category ID
                IF transaction_record->>'expense_category_key' IS NOT NULL THEN
                    SELECT id INTO category_id 
                    FROM expense_categories 
                    WHERE category_key = (transaction_record->>'expense_category_key')::expense_category_type;
                END IF;
                
                -- Fallback to 'other' category if not found
                IF category_id IS NULL THEN
                    SELECT id INTO category_id 
                    FROM expense_categories 
                    WHERE category_key = 'other';
                END IF;

            ELSIF transaction_type_val = 'income' THEN
                -- Try to get income category ID
                IF transaction_record->>'income_category_key' IS NOT NULL THEN
                    SELECT id INTO income_cat_id 
                    FROM income_categories 
                    WHERE category_key = (transaction_record->>'income_category_key')::income_category_type;
                END IF;
                
                -- Fallback to 'other' category if not found
                IF income_cat_id IS NULL THEN
                    SELECT id INTO income_cat_id 
                    FROM income_categories 
                    WHERE category_key = 'other';
                END IF;

            ELSIF transaction_type_val = 'transfer' THEN
                transfer_wallet_id := (transaction_record->>'transfer_to_wallet_id')::UUID;
                transfer_fee_val := COALESCE((transaction_record->>'transfer_fee')::DECIMAL(15,2), 0);
                
                -- Validate transfer wallet exists and user has access
                IF NOT EXISTS (
                    SELECT 1 FROM expense_wallets 
                    WHERE id = transfer_wallet_id AND user_id = batch_user_id AND is_active = true
                ) THEN
                    RAISE EXCEPTION 'Transfer destination wallet not found or access denied: %', transfer_wallet_id;
                END IF;
                
                -- Validate not transferring to same wallet
                IF transfer_wallet_id = batch_wallet_id THEN
                    RAISE EXCEPTION 'Cannot transfer to the same wallet';
                END IF;
            END IF;

            -- Insert the transaction
            INSERT INTO expense_transactions (
                user_id,
                wallet_id,
                transaction_type,
                amount,
                currency,
                description,
                notes,
                expense_category_id,
                income_category_id,
                custom_category,
                tags,
                transfer_to_wallet_id,
                transfer_fee,
                transaction_date,
                transaction_time,
                receipt_images,
                location,
                merchant_name,
                is_confirmed
            ) VALUES (
                batch_user_id,
                batch_wallet_id,
                transaction_type_val,
                expense_amount,
                COALESCE(transaction_record->>'currency', 'VND'),
                transaction_record->>'description',
                transaction_record->>'notes',
                category_id,
                income_cat_id,
                transaction_record->>'custom_category',
                COALESCE(
                    ARRAY(SELECT jsonb_array_elements_text(transaction_record->'tags')),
                    '{}'::TEXT[]
                ),
                transfer_wallet_id,
                transfer_fee_val,
                COALESCE(
                    (transaction_record->>'transaction_date')::DATE, 
                    CURRENT_DATE
                ),
                COALESCE(
                    (transaction_record->>'transaction_time')::TIME, 
                    CURRENT_TIME
                ),
                COALESCE(transaction_record->'receipt_images', '[]'::jsonb),
                transaction_record->'location',
                transaction_record->>'merchant_name',
                COALESCE((transaction_record->>'is_confirmed')::BOOLEAN, true)
            ) RETURNING id INTO new_transaction_id;

            -- Add transaction ID to result
            result := jsonb_set(
                result, 
                '{transaction_ids}', 
                (result->'transaction_ids') || jsonb_build_array(new_transaction_id)
            );

        END LOOP;

        -- If we get here, all transactions were successful
        result := jsonb_set(result, '{message}', to_jsonb('All transactions processed successfully'));
        
        RETURN result;

    EXCEPTION WHEN OTHERS THEN
        -- Any error will cause ROLLBACK of all transactions
        -- Enhanced error classification and logging
        error_details := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE,
            'error_context', jsonb_build_object(
                'batch_user_id', batch_user_id,
                'batch_wallet_id', batch_wallet_id,
                'transaction_count', jsonb_array_length(batch_data->'transactions'),
                'required_balance', required_balance,
                'wallet_balance', wallet_balance,
                'rollback_triggered', true,
                'timestamp', extract(epoch from now())
            ),
            'transaction_ids', '[]'::jsonb
        );
        
        -- Log the error for monitoring (if logging table exists)
        BEGIN
            INSERT INTO error_logs (
                user_id, 
                error_type, 
                error_message, 
                error_context, 
                created_at
            ) 
            VALUES (
                batch_user_id,
                'batch_transaction_error',
                SQLERRM,
                error_details->'error_context',
                NOW()
            );
        EXCEPTION WHEN OTHERS THEN
            -- Ignore logging errors to prevent masking the original error
            NULL;
        END;
        
        RETURN error_details;
    END;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to validate transaction batch before processing
CREATE OR REPLACE FUNCTION validate_transaction_batch(
    batch_data JSONB
) RETURNS JSONB AS $$
DECLARE
    validation_result JSONB := jsonb_build_object('valid', true, 'errors', '[]'::jsonb);
    transaction_record JSONB;
    transaction_count INTEGER := 0;
    total_expense DECIMAL(15,2) := 0;
    wallet_balance DECIMAL(15,2);
    batch_user_id UUID;
    batch_wallet_id UUID;
BEGIN
    -- Basic structure validation
    IF batch_data->>'user_id' IS NULL THEN
        validation_result := jsonb_set(validation_result, '{valid}', 'false');
        validation_result := jsonb_set(
            validation_result, 
            '{errors}', 
            (validation_result->'errors') || jsonb_build_array('Missing user_id')
        );
    END IF;

    IF batch_data->>'wallet_id' IS NULL THEN
        validation_result := jsonb_set(validation_result, '{valid}', 'false');
        validation_result := jsonb_set(
            validation_result, 
            '{errors}', 
            (validation_result->'errors') || jsonb_build_array('Missing wallet_id')
        );
    END IF;

    IF batch_data->'transactions' IS NULL OR jsonb_array_length(batch_data->'transactions') = 0 THEN
        validation_result := jsonb_set(validation_result, '{valid}', 'false');
        validation_result := jsonb_set(
            validation_result, 
            '{errors}', 
            (validation_result->'errors') || jsonb_build_array('Missing or empty transactions array')
        );
        RETURN validation_result;
    END IF;

    batch_user_id := (batch_data->>'user_id')::UUID;
    batch_wallet_id := (batch_data->>'wallet_id')::UUID;

    -- Validate wallet access
    SELECT balance INTO wallet_balance 
    FROM expense_wallets 
    WHERE id = batch_wallet_id AND user_id = batch_user_id AND is_active = true;
    
    IF wallet_balance IS NULL THEN
        validation_result := jsonb_set(validation_result, '{valid}', 'false');
        validation_result := jsonb_set(
            validation_result, 
            '{errors}', 
            (validation_result->'errors') || jsonb_build_array('Wallet not found or access denied')
        );
        RETURN validation_result;
    END IF;

    -- Validate each transaction
    FOR transaction_record IN SELECT * FROM jsonb_array_elements(batch_data->'transactions')
    LOOP
        transaction_count := transaction_count + 1;
        
        -- Validate required fields
        IF transaction_record->>'transaction_type' IS NULL THEN
            validation_result := jsonb_set(validation_result, '{valid}', 'false');
            validation_result := jsonb_set(
                validation_result, 
                '{errors}', 
                (validation_result->'errors') || jsonb_build_array(
                    format('Transaction %s: Missing transaction_type', transaction_count)
                )
            );
        END IF;

        IF transaction_record->>'amount' IS NULL OR (transaction_record->>'amount')::DECIMAL(15,2) <= 0 THEN
            validation_result := jsonb_set(validation_result, '{valid}', 'false');
            validation_result := jsonb_set(
                validation_result, 
                '{errors}', 
                (validation_result->'errors') || jsonb_build_array(
                    format('Transaction %s: Invalid amount', transaction_count)
                )
            );
        END IF;

        -- Calculate total expense for balance check
        IF (transaction_record->>'transaction_type')::transaction_type IN ('expense', 'transfer') THEN
            total_expense := total_expense + (transaction_record->>'amount')::DECIMAL(15,2);
            IF transaction_record->>'transfer_fee' IS NOT NULL THEN
                total_expense := total_expense + (transaction_record->>'transfer_fee')::DECIMAL(15,2);
            END IF;
        END IF;
    END LOOP;

    -- Check total balance requirement
    IF total_expense > wallet_balance THEN
        validation_result := jsonb_set(validation_result, '{valid}', 'false');
        validation_result := jsonb_set(
            validation_result, 
            '{errors}', 
            (validation_result->'errors') || jsonb_build_array(
                format('Insufficient wallet balance. Required: %s, Available: %s', 
                       total_expense::TEXT, wallet_balance::TEXT)
            )
        );
    END IF;

    -- Add summary information
    validation_result := jsonb_set(validation_result, '{transaction_count}', to_jsonb(transaction_count));
    validation_result := jsonb_set(validation_result, '{total_expense_amount}', to_jsonb(total_expense));
    validation_result := jsonb_set(validation_result, '{wallet_balance}', to_jsonb(wallet_balance));

    RETURN validation_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PERMISSIONS
-- =============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_batch_transactions(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_transaction_batch(JSONB) TO authenticated;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON FUNCTION create_batch_transactions(JSONB) IS 
'Atomically processes multiple transactions in a single database transaction. 
Ensures all transactions succeed or all fail together, maintaining data integrity.
Input format: {"user_id": "uuid", "wallet_id": "uuid", "transactions": [...]}';

COMMENT ON FUNCTION validate_transaction_batch(JSONB) IS 
'Validates a transaction batch before processing without making changes.
Returns validation result with errors and summary information.';