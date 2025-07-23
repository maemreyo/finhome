# Codebase Structure

## Root Directory
- **Configuration files**: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`
- **Documentation**: `README.md`, `docs/` directory with comprehensive specs
- **Environment**: `.env.local.example` for environment variables
- **Build tools**: `postcss.config.mjs` for Tailwind CSS processing

## Source Directory (`src/`)
### App Router Structure (`src/app/`)
- **Internationalized routes**: `[locale]/` for multi-language support
- **Route groups**: 
  - `(marketing)/` - Public marketing pages
  - `(dashboard)/` - Protected user dashboard
  - `(public)/` - Public content pages
- **API routes**: `api/` with comprehensive endpoint structure
- **Authentication**: `auth/` with login, signup, password reset

### Components (`src/components/`)
- **UI components**: `ui/` directory with shadcn/ui components
- **Feature components**: Organized by functionality
- **Layout components**: Headers, footers, navigation

### Key Directories
- **`src/lib/`**: Utility functions, Supabase client, helpers
- **`src/hooks/`**: Custom React hooks
- **`src/types/`**: TypeScript type definitions
- **`src/config/`**: Application configuration
- **`src/i18n/`**: Internationalization setup

## External Directories
- **`supabase/`**: Database migrations and configuration
- **`docs/`**: Comprehensive product documentation
- **`scripts/`**: Build and testing scripts
- **`public/`**: Static assets (images, icons)

## Key Features by Route
- **Financial Planning**: `/plans` with CRUD operations
- **Expense Tracking**: `/expenses` with AI-powered parsing
- **Property Management**: `/properties` with market data
- **Analytics**: `/analytics` with financial insights
- **Admin Panel**: `/admin` for system management