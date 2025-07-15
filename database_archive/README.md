# Database Archive

This folder contains the original database schema files that were used to create the unified schema in `supabase/migrations/`.

## ⚠️ **Important Note**

**This folder is for reference only.** The actual production database schema is now located in:
- `supabase/migrations/001_finhome_unified_schema.sql`
- `supabase/migrations/002_seed_data.sql`

## 📁 **Folder Contents**

### Original Schema Files (ARCHIVED)
- `schema.sql` - Original comprehensive schema
- `rls_policies.sql` - Original RLS policies  
- `seed_data.sql` - Original seed data
- `migrations/` - Original migration files
- `consolidation_strategy.md` - Strategy document for consolidation

### Useful Scripts (KEEP)
- `backup_restore.sh` - Production backup and restore scripts ✅

## 🔄 **Migration Status**

- ✅ **COMPLETED:** All schemas consolidated into unified migration
- ✅ **COMPLETED:** Conflicts resolved between SaaS template and FinHome schema
- ✅ **COMPLETED:** TypeScript types updated to match unified schema
- ✅ **COMPLETED:** RLS policies unified and enhanced
- ✅ **COMPLETED:** Seed data with Vietnamese banks and market data

## 📋 **What to Use Now**

For all database operations, use:
```bash
# Production migrations
supabase/migrations/001_finhome_unified_schema.sql
supabase/migrations/002_seed_data.sql

# Backup/restore (keep this script)
database_archive/backup_restore.sh
```

## 🗑️ **Safe to Remove**

You can safely delete the following files as they are now consolidated:
- `schema.sql` (merged into unified schema)
- `rls_policies.sql` (merged into unified schema)
- `seed_data.sql` (merged into seed data migration)
- `migrations/` folder (replaced by supabase/migrations/)
- `consolidation_strategy.md` (task completed)

## 📝 **Keep for Reference**

- `backup_restore.sh` - Move this to project root or scripts folder