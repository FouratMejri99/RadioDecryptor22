# Overview

This is a software-defined radio (SDR) scanner application that provides real-time frequency monitoring and signal visualization. The application is designed as a progressive web app with Telegram Web App integration, featuring live spectrum analysis, waterfall displays, and bookmark management for frequency monitoring.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript using Vite for development and build tooling
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with dark theme optimized for radio scanning
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket connections for live signal data streaming

**Key Design Patterns**:
- Custom hooks for WebSocket management (`use-websocket`) and signal data processing (`use-signal-data`)
- Component composition pattern with separate UI components for different scanner functions
- Mobile-first responsive design optimized for small screens

## Backend Architecture

**Runtime**: Node.js with Express.js server
- **Build System**: ESBuild for production bundling with ES modules
- **Development**: TSX for TypeScript execution in development
- **WebSocket Server**: ws library for real-time signal data broadcasting
- **Static Assets**: Vite dev server in development, static file serving in production

**API Structure**:
- RESTful endpoints for CRUD operations on frequencies, bookmarks, and scanner settings
- WebSocket endpoint (`/ws`) for real-time signal data streaming
- Memory-based storage implementation with interface for future database integration

## Data Storage Solutions

**Current Implementation**: In-memory storage with TypeScript interfaces
- **Storage Interface**: `IStorage` defines contracts for frequencies, bookmarks, and scanner settings
- **Memory Implementation**: `MemStorage` class provides full CRUD operations
- **Database Ready**: Drizzle ORM configuration prepared for PostgreSQL integration

**Schema Design**:
- Frequencies table with categorization (aviation, amateur radio, emergency, etc.)
- User bookmarks with frequency and modulation settings  
- Scanner settings per user (volume, squelch, current frequency, scan state)

## External Dependencies

**Database**: PostgreSQL configured via Drizzle ORM with Neon Database serverless driver
- Migration system set up with `drizzle-kit`
- Schema definitions in shared TypeScript files
- Connection pooling via `@neondatabase/serverless`

**Telegram Integration**: Telegram Web App SDK
- User identification and authentication
- Haptic feedback for mobile interactions
- Native UI integration (main button, back button)
- Theme adaptation to Telegram's color scheme

**UI Framework**: Comprehensive Radix UI component ecosystem
- All form controls, dialogs, and interactive elements
- Accessibility features built-in
- Consistent design system implementation

**Real-time Communication**: WebSocket-based signal streaming
- Simulated SDR signal generation for demonstration
- Live waterfall spectrum display updates
- Signal strength visualization with frequency data

**Development Tools**:
- Replit-specific integrations for cloud development
- Runtime error overlay for development debugging
- Cartographer plugin for enhanced development experience