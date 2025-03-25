# MapApp Development Guidelines

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Code Style
- Use TypeScript with strict type checking
- React components should use functional style with hooks
- Use async/await for promises, with proper error handling
- Follow JSDoc for documenting functions and interfaces
- Use named exports instead of default exports
- Use CSS modules for component styling
- Order imports: React/libraries, components, types, styles
- Use explicit return types for functions and interfaces
- Destructure props in component parameters
- Use early returns for conditional logic
- Follow consistent error handling patterns with try/catch
- Use consistent naming: PascalCase for components, camelCase for functions/variables
- Prefer absolute imports over relative when possible

## Architecture
- Store types in `src/types` directory
- Keep service logic in `src/services`
- Components belong in `src/components`
- Use contexts for global state management
- Follow container/presentation component pattern