# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2024-03-21

### Added
- User location pip showing current position on the map
- Settings to control location pip display (non-pulsing, no heading arrow)
- Improved user location permission handling to prevent repeated prompts
- Comprehensive TODO list with structured development plan

### Changed
- Updated to semantic versioning with major version increase (0.3.0)
- Resolved cross-browser compatibility issues with geolocation services
- Enhanced map control visibility with improved CSS

## [0.2.11] - 2024-03-21

### Added
- User location "pip" feature showing current position on the map
- Real-time location tracking with direction heading indicator
- Accuracy circle displaying GPS precision
- Location control button in the top-right corner
- Support for continuous location updates as the user moves

### Fixed
- Fixed map style change causing satellite button to break
- Resolved issue with markers not reappearing after style changes

## [0.2.10] - 2024-03-21

### Added
- Geolocation feature that attempts to center the map on the user's location
- Permission-based location detection with browser's Geolocation API
- Fallback to Melbourne, Australia when location access is denied or unavailable
- Improved initial user experience with relevant starting location

## [0.2.9] - 2024-03-21

### Changed
- Implemented IndexedDB for more robust location storage
- Added localStorage fallback mechanism for broader compatibility
- Improved error handling for storage operations
- Enhanced data persistence across browser sessions and device reboots

## [0.2.8] - 2024-03-21

### Changed
- Reduced the size of map markers to 80% of their original size for better visual balance
- Improved overall map appearance with more proportional marker sizing

## [0.2.7] - 2024-03-21

### Changed
- Removed debug console.logs throughout the codebase
- Streamlined logging to essential error messages only
- Improved code readability and performance
- Standardized error message format

## [0.2.6] - 2024-03-21

### Changed
- Added hover state to action buttons for better interactive feedback
- Subtle lift effect (translateY) on hover for depth
- Blue highlight for icon on hover to match active state
- Improved overall user interface responsiveness

## [0.2.5] - 2024-03-21

### Changed
- Removed focus outlines from action buttons
- Improved button visual appearance when clicked
- Added cross-browser fixes for focus states

## [0.2.4] - 2024-03-21

### Changed
- Improved layer toggle icons with more intuitive symbols
- Using a proper map grid icon when in satellite view
- Ensures icon clarity and intuitive visual feedback

## [0.2.3] - 2024-03-21

### Changed
- Moved layer toggle from top-left to action bar
- Simplified UI by removing separate layer toggle component
- Added context-aware map/satellite icons that switch based on current state
- Improved action bar spacing for better usability
- Removed unused CSS for cleaner codebase

## [0.2.2] - 2024-03-21

### Fixed
- Improved locations panel visibility with fixed positioning
- Enhanced panel styling with stronger shadow and border highlight
- Added padding for better content presentation
- Fixed z-index and positioning to ensure panel appears above map
- Added debug logging for panel state tracking

## [0.2.1] - 2024-03-21

### Fixed
- Fixed location panel visibility when toggled from action bar
- Improved panel styling to ensure proper width and positioning
- Added pointer-events control for better interaction

## [0.2.0] - 2024-03-21

### Milestone
- First stable version with complete map and routing functionality
- Includes all core features: locations, directions, routes, and map controls
- Robust marker handling and style switching
- Mobile-responsive design with clean UI
- Completed full functionality testing

## [0.0.13] - 2024-03-21

### Fixed
- Fixed marker display on initial map load
- Fixed marker persistence during style changes
- Improved map style switching reliability
- Added detailed logging for debugging

## [0.0.12] - 2024-03-21

### Fixed
- Fixed map style switching errors
- Improved marker handling during style changes
- Added proper cleanup and reinitialization of map layers
- Better error handling for map state changes

## [0.0.11] - 2024-03-21

### Added
- Route information display with total distance and duration
- Detailed turn-by-turn directions with distance and time for each step
- Improved styling for the route information panel
- Auto-clearing of route information when locations change

## [0.0.10] - 2024-03-21

### Added
- Route plotting using Mapbox Directions API
- Visual route display on map
- Automatic map camera adjustment to show entire route
- Route distance and duration calculation
- Fixed satellite view style changes

## [0.0.9] - 2024-03-21

### Changed
- Restructured layout to properly separate map and UI components
- Improved container hierarchy with flexbox layout
- Fixed map container isolation
- Better panel and action bar positioning

## [0.0.8] - 2024-03-21

### Changed
- Replaced emoji icons with proper SVG icons in action bar
- Improved action button styling and spacing
- Better icon transitions and active states

## [0.0.7] - 2024-03-21

### Changed
- Completely redesigned UI with mobile-app style bottom action bar
- Moved panels to slide up from bottom
- Improved panel transitions and animations
- Better mobile-first design approach
- Simplified navigation between features

## [0.0.6] - 2024-03-21

### Fixed
- Fixed overlapping UI components in the top right
- Improved UI layout structure with proper component hierarchy
- Reorganized controls container for better organization
- Fixed LayerToggle positioning and styling

## [0.0.5] - 2024-03-21

### Changed
- Improved UI responsiveness across all components
- Enhanced visual consistency between panels
- Better spacing and layout on mobile devices
- Refined typography and color scheme
- Added hover states and transitions for better interactivity

## [0.0.4] - 2024-03-20

### Added
- Directions panel with location selection
- Tab interface for switching between locations and directions
- Basic route selection functionality with start and end points
- Improved UI organization with separated components

## [0.0.3] - 2024-03-20

### Added
- Location markers that can be added to the map
- Location list panel showing all saved locations
- Delete functionality for removing saved locations
- Flyto capability to zoom to selected locations
- Local storage persistence for saved locations

## [0.0.2] - 2024-03-19

### Added
- Basic map functionality using Mapbox GL
- Navigation controls for zoom and rotation
- Map style switcher (street vs. satellite)

## [0.0.1] - 2024-03-19

### Added
- Initial project setup with Vite and TypeScript
- Basic application structure
- Environment configuration 