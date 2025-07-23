# Code Style & Conventions

## TypeScript Configuration
- **Strict mode enabled** with comprehensive type checking
- **ES2017 target** with ESNext modules
- **Path aliases**: `@/*` maps to `./src/*`
- **JSX preserve** mode for React components

## ESLint Rules
- Extends `next/core-web-vitals` and `next/typescript`
- **Disabled rules**:
  - `@typescript-eslint/no-explicit-any`: Allows `any` type usage
  - `@typescript-eslint/no-unused-vars`: Disabled unused variable warnings
  - `@typescript-eslint/ban-ts-comment`: Allows TypeScript comments
- **Warning level**: `prefer-const` for immutable variables

## Project Structure
- **App Router** architecture with `src/app` directory
- **Component organization**: `src/components` with UI components in `src/components/ui`
- **Utility functions**: `src/lib` for shared utilities
- **Custom hooks**: `src/hooks` directory
- **Type definitions**: `src/types` for TypeScript types
- **Internationalization**: `src/i18n` for translations

## File Naming Conventions
- **Pages**: `page.tsx` in route directories
- **Layouts**: `layout.tsx` for route layouts
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **API routes**: `route.ts` in app/api directories
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)

## Import/Export Patterns
- Use path aliases (`@/components`, `@/lib`, etc.)
- Prefer named exports for utilities and components
- Default exports for pages and layouts