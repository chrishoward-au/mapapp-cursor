# MapApp Development TODO

## Phase 1: Core Map Features
- [x] Initialize project with Vite and TypeScript
- [x] Set up project structure
- [x] Configure environment variables
- [x] Implement basic map component
- [x] Add layer toggling functionality
- [x] Set up local storage utilities
- [x] Create basic UI layout
- [x] Add responsive design

## Phase 2: Location Management
- [x] Implement location marker addition
- [x] Create location list component
- [x] Add location delete functionality
- [ ] Add location edit functionality
- [ ] Implement location search/filter
- [x] Add location persistence in local storage

## Phase 3: Directions
- [x] Add location selection for routes
- [ ] Implement route calculation
- [ ] Create turn-by-turn directions display
- [ ] Add route summary component
- [ ] Implement alternative routes
- [ ] Add route persistence

## Phase 4: Weather Integration
- [ ] Set up OpenWeatherMap API integration
- [ ] Create weather overlay component
- [ ] Implement temperature display
- [ ] Add unit toggle functionality
- [ ] Implement weather data caching
- [ ] Add weather update on map movement

## Phase 5: Cloud Preparation
- [ ] Design REST API endpoints
- [ ] Create data migration utilities
- [ ] Plan authentication system
- [ ] Design sync mechanism
- [ ] Document cloud architecture

## Testing
- [ ] Set up testing environment
- [ ] Write core component tests
- [ ] Create E2E test suite
- [ ] Add integration tests
- [ ] Implement performance tests

## Documentation
- [ ] Create API documentation
- [ ] Write user guide
- [ ] Add developer setup guide
- [ ] Document component architecture
- [ ] Create contribution guidelines

## Current Focus
- Implement route calculation using Mapbox Directions API
- Create turn-by-turn directions display
- Add route summary component

## Recently Completed
- Added directions panel with location selection
- Implemented tab interface for better UI organization
- Set up basic route selection functionality

## Data Storage
- [ ] Implement cross-browser storage solution for a single device
- [ ] Research and implement cloud storage for cross-device synchronization
- [ ] Add offline data persistence for saved routes and locations

## UI/UX Improvements
- [ ] Add info popup when clicking a marker
- [ ] Redesign location list UI for mobile-friendly experience
- [ ] Redesign directions panel UI for mobile-friendly experience
- [ ] Implement dark mode that applies to all components (including Mapbox elements)

## Route Functionality
- [ ] Enable setting routes by clicking markers
- [ ] Add ability to use current user location as route start/end point
- [ ] Support adding multiple waypoints to build complex routes
- [ ] Implement route saving for offline access
- [ ] Add route editing capabilities (reordering, removing waypoints)

## Map Features
- [ ] Add township weather labels layer
- [ ] Improve map control positioning for mobile devices
- [ ] Add custom map layers for different use cases (hiking, cycling, etc.)

## Performance & Technical Debt
- [ ] Optimize marker rendering for large numbers of saved locations
- [ ] Improve load time for saved routes
- [ ] Handle offline mode gracefully

## Future Considerations
- [ ] User accounts and authentication
- [ ] Sharing routes with other users
- [ ] Integration with other navigation/mapping services

---
Last Updated: 2024-03-21 