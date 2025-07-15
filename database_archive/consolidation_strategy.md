# Database Consolidation Strategy

## 🎯 **Problem:**
We have conflicting database schemas between:
- `supabase/migrations/` (existing partial schema)
- `database/` (new comprehensive schema)

## 🚀 **Solution: Clean Slate Approach**

### **Step 1: Backup Current Data**
```bash
# Backup any existing data
./database/backup_restore.sh backup local
```

### **Step 2: Replace Migrations**
Replace the existing migrations with our consolidated schema:

**Option A: Clean Start (Recommended)**
1. Delete `supabase/migrations/001_initial_schema.sql`
2. Delete `supabase/migrations/002_finhome_schema.sql` 
3. Delete `supabase/migrations/003_seed_data.sql`
4. Copy our new schema files to replace them

**Option B: Incremental Migration**
1. Create migration `004_drop_conflicting_tables.sql`
2. Create migration `005_finhome_complete_schema.sql`
3. Create migration `006_comprehensive_seed_data.sql`

### **Step 3: Use Our Comprehensive Schema**
The new schema in `database/` is superior because:
- ✅ Proper Vietnamese bank integration
- ✅ Complete RLS policies  
- ✅ Better type definitions
- ✅ Comprehensive indexes
- ✅ Production-ready structure

### **Step 4: File Organization**
```
project/
├── supabase/
│   ├── config.toml
│   └── migrations/
│       ├── 001_comprehensive_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_seed_data.sql
└── database/ (keep as backup/documentation)
    ├── schema.sql
    ├── rls_policies.sql
    ├── seed_data.sql
    └── backup_restore.sh
```

## 🔧 **Implementation Plan:**

### **Immediate Actions:**
1. **Backup current database**
2. **Replace conflicting migrations**
3. **Test with fresh Supabase instance**
4. **Update TypeScript types**

### **Long-term Benefits:**
- Single source of truth for schema
- Better Vietnamese localization
- Production-ready security
- Comprehensive feature set
- Proper bank data integration

## 📋 **Checklist:**
- [ ] Backup existing data
- [ ] Replace migration files
- [ ] Test schema deployment
- [ ] Update application types
- [ ] Verify RLS policies
- [ ] Test bank data integration
- [ ] Validate Vietnamese content