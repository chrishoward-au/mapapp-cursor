# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.12] - 2024-03-21

### Fixed
- Fixed map style switching errors
- Improved marker handling during style changes
- Added proper cleanup and reinitialization of map layers
- Better error handling for map state changes

## [0.0.11] - 2024-03-21

### Added
- Route information display with distance and duration
- Turn-by-turn directions with step details
- Distance and duration for each step
- Improved route information styling
- Clear route info when changing locations

## [0.0.10] - 2024-03-21

### Added
- Implemented route plotting using Mapbox Directions API
- Added route visualization with blue line on map
- Auto-zoom to show entire route when selected
- Proper route layer management with GeoJSON source

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

## [0.0.4] - 2024-03-21

### Added
- Directions panel with location selection
- Tab interface for switching between locations and directions
- Basic route selection functionality
- Improved UI organization with side panel

## [0.0.3] - 2024-03-21

### Fixed
- Map container warning by properly separating UI elements
- Location persistence between page refreshes
- Type safety improvements for map initialization

### Changed
- Improved UI layout with proper layering
- Enhanced component structure for better maintainability

## [0.0.2] - 2024-03-21

### Added
- Local storage integration for location persistence
- Automatic loading of saved locations on app start
- Automatic saving of locations when changes occur

## [0.0.1] - 2024-03-21

### Added
- Basic map display with Mapbox integration
- Layer toggle between map and satellite views
- Location management features:
  - Add locations by clicking on map
  - Display locations as markers
  - List view of saved locations
  - Delete locations
  - Center map on selected location
- Initial project structure and configuration

### Changed
- Updated project structure to follow clean architecture principles
- Implemented type-safe interfaces for locations and preferences 