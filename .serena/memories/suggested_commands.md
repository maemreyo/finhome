# Suggested Development Commands

## Package Management
- **Package manager**: `pnpm` (required - do not use npm or yarn)
- **Install dependencies**: `pnpm install`
- **Add package**: `pnpm add <package>`
- **Add dev dependency**: `pnpm add -D <package>`

## Development Server
- **Start development**: `pnpm dev` (runs on port 3033 with Turbopack)
- **Build production**: `pnpm build`
- **Start production**: `pnpm start`

## Code Quality & Testing
- **Lint code**: `pnpm lint`
- **Fix lint issues**: `pnpm lint:fix`
- **Type checking**: `pnpm type-check` (TypeScript compiler check)

## Email Development
- **Email development**: `pnpm email:dev` (React Email)

## AI & Testing Scripts
- **Test AI prompts**: `pnpm test:ai-prompt`
- **Test AI prompts (dev)**: `pnpm test:ai-prompt:dev`
- **Run prompt tests**: `pnpm test:ai-prompt:run`
- **Test streaming performance**: `pnpm test:streaming`
- **Test automation bias**: `pnpm test:automation-bias`

## System Commands (macOS)
- **List files**: `ls` or `ls -la` for detailed view
- **Find files**: `find . -name "pattern"` or use `mdfind` for Spotlight search
- **Search content**: `grep -r "pattern" .` or `rg "pattern"` (ripgrep)
- **Git operations**: Standard git commands for version control