# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.20] - 2025-03-22

### Added
- Support for multiple route options when available from the Mapbox Directions API
- Route alternatives navigator UI in the directions panel
- Ability to toggle between different route options with visual indicators
- Arrow buttons and dot indicators for convenient route switching

## [0.3.19] - 2025-03-22

### Fixed
- Fixed issue with panel behavior on desktop - now properly resizes the map area instead of sliding over it
- Improved map resize handling to maintain proper route visibility
- Added extra padding when viewing routes to account for the panel space
- Fixed positioning issues with the panel that prevented proper desktop layout

## [0.3.18] - 2025-03-22

### Changed
- Improved panel behavior with responsive design:
  - On desktop and tablet devices (>768px), panels now resize the map area instead of overlaying it
  - On mobile devices, panels continue to slide over the map to maximize screen real estate
  - Added smooth transitions for panel open/close animations
  - Automatically resize map when panels open/close to ensure proper rendering

## [0.3.17] - 2025-03-22

### Added
- Added Lucide React icon library for consistent icon design throughout the application

### Changed
- Replaced all inline SVG icons with Lucide React components:
  - Updated map action bar icons
  - Updated direction type icons (Car, Bike, Footprints)
  - Updated DarkModeToggle to use Sun and Moon icons

## [0.3.16] - 2025-03-22

### Changed
- Updated action bar icons to more intuitive Feather icons:
  - List icon for the locations panel
  - Compass icon for the directions panel
  - Maximize icon for viewing all locations
  - Globe icon for satellite view
  - Map icon for map view

## [0.3.15] - 2025-03-22

### Added
- "View all locations" button to zoom the map to show all saved locations at once
- Disabled state styling for action buttons when the action is not available

## [0.3.14] - 2025-03-22

### Changed
- Replaced browser's default prompt for adding locations with a custom modal
- Added styled form with improved UX for entering location names
- Display coordinates in the modal for better context
- Added animations for smoother transitions when opening/closing the modal
- Ensured dark mode support for the new modal

## [0.3.13] - 2025-03-22

### Added
- Close button added to the location list panel for consistent UI
- Improved header style in location list panel
- Consistent close mechanism across all panels

## [0.3.12] - 2025-03-22

### Changed
- Completely redesigned the directions panel to slide from the left instead of bottom
- Fixed panel width to 300px for better space utilization
- Removed auto-closing behavior when a route is calculated
- Added a close button in the top right corner of panel
- Improved user experience with more intuitive panel behavior

## [0.3.11] - 2025-03-22

### Fixed
- Fixed critical issue with directions panel immediately closing when reopening
- Eliminated auto-recalculation on panel reopen that was causing UI problems
- Implemented smarter change detection to only calculate routes when values actually change
- Simplified panel toggling behavior for more predictable user experience

## [0.3.10] - 2025-03-22

### Fixed
- Simplified panel auto-close logic to be more reliable
- Always close directions panel when a route is created or updated
- Removed complex conditional logic that was causing inconsistent behavior

## [0.3.9] - 2025-03-22

### Fixed
- Fixed issue with directions panel toggling when a route already exists
- Improved panel behavior to only auto-close on initial route creation
- Ensured directions panel can be properly reopened after creating a route

## [0.3.8] - 2025-03-22

### Added
- Route state persistence when closing and reopening the directions panel
- Auto-closing of directions panel after route selection for cleaner map viewing

### Changed
- Improved state management with route information stored at Map component level
- Better user experience with persistent route state

## [0.3.7] - 2025-03-22

### Changed
- Removed "Calculate Route" button from DirectionsPanel
- Added automatic route calculation when both start and end locations are selected
- Implemented auto-recalculation when either location changes
- Improved user experience with instant route updates

## [0.3.6] - 2025-03-22

### Added
- Direction type toggle in the DirectionsPanel component
- Support for three transportation modes: walking (default), cycling, and driving
- Automatic route recalculation when changing transportation mode
- Distinct route colors for each mode (blue for walking, green for cycling, amber for driving)
- Improved route information display with mode-specific details

## [0.3.5] - 2025-03-22

### Fixed
- Restored automatic user location display (blue pip) on map load
- Added delay to ensure location permission is processed correctly
- Stored GeolocateControl in a ref for better management
- Added timeout parameter to position options for improved reliability

## [0.3.4] - 2025-03-22

### Fixed
- Restored user location "pip" visibility in dark mode
- Fixed CSS that was causing geolocate control to disappear
- Maintained original blue dot appearance for location indicator

## [0.3.3] - 2025-03-22

### Added
- Dark mode support with automatic theme detection based on system preferences
- Dark mode toggle in the action bar with sun/moon icons
- Dark mode styling for all UI components while preserving original design
- Persistent theme preference stored in localStorage

### Changed
- Dark mode only affects UI components, not the map itself

## [0.3.2] - 2025-03-22

### Added
- Dark mode support with automatic theme detection based on system preferences
- Dark styled Mapbox map for better nighttime viewing
- Dark mode toggle in the action bar with sun/moon icons
- Dark mode styling for all UI components while preserving original design
- Persistent theme preference stored in localStorage

## [0.3.1] - 2025-03-22

### Added
- Dark mode support with automatic theme detection based on system preferences
- Dark styled Mapbox map for better nighttime viewing
- Dark mode toggle in the action bar
- Dark mode styling for all UI components (panels, buttons, lists, forms)
- Persistent theme preference stored in localStorage

## [0.3.0] - 2025-03-22

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