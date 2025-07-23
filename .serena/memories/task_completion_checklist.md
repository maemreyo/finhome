# Task Completion Checklist

## Before Committing Code
1. **Type checking**: Run `pnpm type-check` to ensure no TypeScript errors
2. **Linting**: Run `pnpm lint` to check code style and fix with `pnpm lint:fix`
3. **Build verification**: Run `pnpm build` to ensure production build works
4. **Manual testing**: Test the functionality in development mode with `pnpm dev`

## Code Quality Standards
- Follow TypeScript strict mode requirements
- Ensure all components are properly typed
- Use Zod schemas for API validation
- Implement proper error handling
- Follow Next.js App Router patterns

## Security Considerations
- Validate all user inputs with Zod schemas
- Implement proper authentication checks
- Use Supabase RLS policies for data security
- Never expose sensitive environment variables
- Follow Next.js security best practices

## Performance Checks
- Optimize images using Next.js Image component
- Implement proper loading states
- Use React.memo() and useMemo() where appropriate
- Lazy load components when possible
- Monitor bundle size impact

## Documentation Requirements
- Add JSDoc comments for complex functions
- Update API documentation if endpoints change
- Document any new configuration or setup steps
- Update README if major changes are made