#!/bin/bash

# FinHome Database Backup and Restore Scripts
# Usage: ./backup_restore.sh [backup|restore] [environment] [options]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check dependencies
check_dependencies() {
    local deps=("pg_dump" "pg_restore" "psql")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "$dep is required but not installed."
            exit 1
        fi
    done
}

# Load environment variables
load_env() {
    local env_file="${SCRIPT_DIR}/../.env.${1:-local}"
    if [[ -f "$env_file" ]]; then
        log "Loading environment from $env_file"
        export $(cat "$env_file" | grep -v '^#' | xargs)
    else
        error "Environment file $env_file not found"
        exit 1
    fi
}

# Create backup directory
ensure_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log "Backup directory: $BACKUP_DIR"
}

# Database backup function
backup_database() {
    local env="${1:-local}"
    local include_data="${2:-true}"
    
    log "Starting database backup for environment: $env"
    
    load_env "$env"
    ensure_backup_dir
    
    local backup_file="${BACKUP_DIR}/finhome_${env}_${DATE}.sql"
    local schema_file="${BACKUP_DIR}/finhome_schema_${env}_${DATE}.sql"
    
    # Backup schema only
    log "Backing up database schema..."
    pg_dump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --schema-only \
        --no-owner \
        --no-privileges \
        --file="$schema_file"
    
    if [[ "$include_data" == "true" ]]; then
        # Full backup with data
        log "Backing up database with data..."
        pg_dump \
            --host="$DB_HOST" \
            --port="$DB_PORT" \
            --username="$DB_USER" \
            --dbname="$DB_NAME" \
            --no-owner \
            --no-privileges \
            --exclude-table="user_activities" \
            --exclude-table="schema_migrations" \
            --file="$backup_file"
        
        # Compress backup
        log "Compressing backup..."
        gzip "$backup_file"
        backup_file="${backup_file}.gz"
    fi
    
    success "Backup completed: $backup_file"
    
    # Cleanup old backups (keep last 30 days)
    find "$BACKUP_DIR" -name "finhome_${env}_*.sql*" -mtime +30 -delete
    log "Cleaned up backups older than 30 days"
}

# Database restore function
restore_database() {
    local env="${1:-local}"
    local backup_file="$2"
    local confirm="${3:-false}"
    
    if [[ -z "$backup_file" ]]; then
        error "Backup file path is required for restore"
        exit 1
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log "Starting database restore for environment: $env"
    log "Backup file: $backup_file"
    
    load_env "$env"
    
    # Safety check for production
    if [[ "$env" == "production" && "$confirm" != "true" ]]; then
        warning "You are about to restore to PRODUCTION database!"
        echo -n "Type 'YES' to confirm: "
        read -r confirmation
        if [[ "$confirmation" != "YES" ]]; then
            log "Restore cancelled"
            exit 0
        fi
    fi
    
    # Create a backup before restore
    warning "Creating safety backup before restore..."
    backup_database "$env" "true"
    
    # Decompress if needed
    local restore_file="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        log "Decompressing backup file..."
        restore_file="${backup_file%.gz}"
        gunzip -c "$backup_file" > "$restore_file"
    fi
    
    # Restore database
    log "Restoring database..."
    psql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --file="$restore_file"
    
    # Cleanup decompressed file if created
    if [[ "$backup_file" == *.gz ]]; then
        rm -f "$restore_file"
    fi
    
    success "Database restored successfully"
}

# Run migrations
run_migrations() {
    local env="${1:-local}"
    
    log "Running database migrations for environment: $env"
    
    load_env "$env"
    
    # Run migration files in order
    for migration_file in "$SCRIPT_DIR/migrations"/*.sql; do
        if [[ -f "$migration_file" ]]; then
            local migration_name=$(basename "$migration_file")
            log "Running migration: $migration_name"
            
            psql \
                --host="$DB_HOST" \
                --port="$DB_PORT" \
                --username="$DB_USER" \
                --dbname="$DB_NAME" \
                --file="$migration_file"
        fi
    done
    
    success "Migrations completed"
}

# Database health check
health_check() {
    local env="${1:-local}"
    
    log "Running database health check for environment: $env"
    
    load_env "$env"
    
    # Test connection
    if psql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --command="SELECT 1;" > /dev/null 2>&1; then
        success "Database connection successful"
    else
        error "Database connection failed"
        exit 1
    fi
    
    # Check table count
    local table_count=$(psql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --tuples-only \
        --command="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    
    log "Tables in database: $(echo $table_count | xargs)"
    
    # Check RLS status
    local rls_tables=$(psql \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --tuples-only \
        --command="SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;")
    
    log "Tables with RLS enabled: $(echo $rls_tables | xargs)"
    
    success "Health check completed"
}

# Show usage
show_usage() {
    echo "FinHome Database Management Script"
    echo ""
    echo "Usage: $0 <command> [environment] [options]"
    echo ""
    echo "Commands:"
    echo "  backup <env> [include_data]  - Backup database (default: include data)"
    echo "  restore <env> <file> [confirm] - Restore database from backup"
    echo "  migrate <env>                - Run database migrations"
    echo "  health <env>                 - Check database health"
    echo ""
    echo "Environments:"
    echo "  local       - Local development database"
    echo "  staging     - Staging environment database"  
    echo "  production  - Production database (use with caution)"
    echo ""
    echo "Examples:"
    echo "  $0 backup local"
    echo "  $0 backup production false  # Schema only"
    echo "  $0 restore local ./backups/finhome_local_20240115_120000.sql"
    echo "  $0 migrate staging"
    echo "  $0 health production"
}

# Main execution
main() {
    check_dependencies
    
    local command="$1"
    local env="$2"
    
    case "$command" in
        "backup")
            backup_database "$env" "${3:-true}"
            ;;
        "restore")
            restore_database "$env" "$3" "${4:-false}"
            ;;
        "migrate")
            run_migrations "$env"
            ;;
        "health")
            health_check "$env"
            ;;
        "help"|"--help"|"-h"|"")
            show_usage
            ;;
        *)
            error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"