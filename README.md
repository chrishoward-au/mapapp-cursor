# MapApp

![Version](https://img.shields.io/badge/version-0.3.22-blue)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6)
![Mapbox GL](https://img.shields.io/badge/Mapbox%20GL-3.10.0-000000)

An interactive mapping application built with React, TypeScript, and Mapbox GL, designed to provide users with location management, directions, and powerful mapping features.

## Features

- **Interactive Map**: Responsive map display with zoom, pan, and custom controls
- **Layer Management**: Toggle between map and satellite views
- **Location Management**: Add, edit, list, and delete locations
- **Directions**: Get routes between locations with turn-by-turn instructions
- **Route Alternatives**: View and select from multiple route options
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Optimized for both desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- NPM (v8 or newer)
- [Mapbox access token](https://account.mapbox.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd mapapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Mapbox access token:
   ```
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules and TailwindCSS
- **Mapping**: Mapbox GL JS
- **Icons**: Lucide React
- **Storage**: Local storage (with plans for Supabase integration)
- **Type Safety**: TypeScript with strict type checking
- **State Management**: React Context API

## Architecture

The application follows a component-based architecture with React:

- **Components**: Reusable UI elements in `src/components/`
- **Contexts**: Global state management in `src/contexts/`
- **Services**: API and utility services in `src/services/`
- **Types**: TypeScript types and interfaces in `src/types/`

## Development Guidelines

- Follow TypeScript strict type checking
- Use functional components with hooks
- Use async/await for promises with proper error handling
- Follow JSDoc for documenting functions and interfaces
- Use named exports instead of default exports
- Use CSS modules for component styling
- Update the changelog before each commit

## Current Status

MapApp is currently in active development. The application provides core functionality for location management and directions, with ongoing improvements to the user interface and feature set.

## Future Enhancements

- User accounts and authentication
- Cloud storage integration
- Route sharing capabilities
- Weather data integration
- Offline support
- Mobile applications
- Real-time collaboration

## Contributing

Contributions are welcome! Please follow the existing code style and architecture.

## License

[MIT](LICENSE)