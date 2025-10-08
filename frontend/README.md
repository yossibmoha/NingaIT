# NinjaIT Frontend

React-based frontend application for NinjaIT platform.

## Tech Stack

- **Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI / Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Testing**: Jest, React Testing Library

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - Check TypeScript types

## Project Structure

```
frontend/
├── public/            # Static assets
├── src/
│   ├── components/    # React components
│   │   ├── common/    # Shared components
│   │   ├── layout/    # Layout components
│   │   └── features/  # Feature components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services
│   ├── store/         # Redux store
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript types
│   ├── styles/        # Global styles
│   └── tests/         # Tests
├── package.json
└── tsconfig.json
```

## Development

See [DEVELOPMENT.md](../docs/DEVELOPMENT.md) for detailed development guide.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

