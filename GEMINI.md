# Trickcal Re:Vive Team Manager - Project Context

## Project Overview
This project is a web-based management and simulation tool for the mobile game **Trickcal Re:Vive**. It allows players to manage their "apostles" (characters), simulate deck performance, calculate synergies, and receive deck recommendations based on their collection.

### Core Technologies
- **Frontend Framework**: React 19 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4, daisyUI
- **State Management**: Zustand
- **Database/Backend**: Supabase
- **Validation**: Zod
- **Testing**: Vitest, JSDOM
- **Linting & Formatting**: Biome
- **Routing**: React Router Dom
- **Transitions**: @ssgoi/react

## Architecture

### Directory Structure
- `src/components`: UI components, including the main functional modules:
  - `builder/`: Deck Recommender logic and UI.
  - `party/`: Deck Simulator and analysis.
  - `SimpleBuilder/`: Simplified deck builder for quick strategy.
  - `layout/`: Common application layout (Navbar, Footer).
- `src/pages`: Top-level page components and routing definitions.
- `src/stores`: Zustand stores for managing authentication, game data, deck configurations, and user collection.
- `src/schemas`: Zod validation schemas for game data (apostles, skills, artifacts, asides, etc.).
- `src/data`: JSON files containing the core game data, validated by schemas.
- `src/services`: Business logic and data loading services (e.g., `DataLoaderService`).
- `src/hooks`: Custom hooks for data loading, cloud synchronization (`useCloudSync`), and specific gameplay logic.
- `src/utils`: Utilities for image path resolution, search algorithms, and deck analysis calculations.
- `src/types`: TypeScript interfaces and types for game entities.

### Key Workflows
1. **Data Loading**: On application start, `useDataLoader` fetches game data from JSON files and validates them against Zod schemas.
2. **Deck Simulation**: Users can select apostles to see real-time calculation of synergy scores, personality bonuses, and role balance.
3. **Cloud Sync**: User progress and collections are synced with Supabase via the `useCloudSync` hook.
4. **PWA Support**: The app is configured as a Progressive Web App for offline access and mobile installation.

## Key Commands

### Development
- `npm run dev`: Starts the Vite development server.
- `npm run predev`: Automatically generates version information before starting dev.

### Build & Preview
- `npm run build`: Type-checks and builds the project for production.
- `npm run serve`: Previews the production build locally.

### Testing & Quality
- `npm test`: Runs the test suite using Vitest.
- `npm run check`: Runs Biome for linting, formatting, and general checks.
- `npm run lint`: Fixes linting issues using Biome.
- `npm run format`: Formats code using Biome.

### Data Management
- `npm run data:export`: Exports apostle data using internal scripts.
- `npm run data:import`: Imports apostle data using internal scripts.

## Development Conventions
- **Language**: TypeScript is strictly enforced.
- **Styles**: Use Tailwind CSS utility classes and daisyUI components.
- **State**: Keep UI state local, but share game data and user collection via Zustand stores.
- **Validation**: Any new game data should have a corresponding Zod schema in `src/schemas`.
- **Formatting**: Adhere to Biome's rules (configured in `biome.json`).
- **Tests**: Add unit tests in `src/__tests__` for utility functions and core game logic.
