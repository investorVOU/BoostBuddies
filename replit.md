# Overview

BoostBuddies is a social engagement platform designed to help content creators boost their posts across multiple social media platforms including Twitter, Facebook, YouTube, and TikTok. The application operates on a community-driven model where users submit their content for engagement from other community members, earning points and building social proof through likes, shares, and comments.

The platform features a comprehensive dashboard with analytics, community management, collaboration spotlights, live events, and a gamified points system to encourage active participation among creators.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## August 1, 2025 - Replit Migration Completed
- Successfully migrated project from Replit Agent to standard Replit environment
- Fixed database configuration to work with existing Supabase setup
- Resolved all server startup issues and configuration errors  
- Cleaned up frontend code and removed duplicate/malformed syntax
- Server now running cleanly on port 5000 with database connectivity confirmed
- All core functionality preserved during migration process
- Authentication system remains intact with Supabase backend
- Project ready for continued development in Replit environment

## Previous - Authentication System Fixed
- Successfully migrated from Neon to Supabase database
- Fixed email input field functionality - now fully typeable 
- Resolved database connectivity issues by using Supabase client instead of direct connections
- Fixed column name mapping between camelCase (frontend) and snake_case (database)
- Both registration and login now working with Supabase database
- User accounts stored with proper password hashing and validation
- Created exclusive admin dashboard accessible only to the project owner
- Added admin login tracking with admin_logs table in Supabase database

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Communication**: WebSocket server for live events and notifications
- **API Design**: RESTful endpoints with proper error handling and request logging

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Supabase PostgreSQL
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Session Storage**: PostgreSQL table for persistent sessions

## Authentication and Authorization
- **Provider**: Replit Auth using OpenID Connect protocol
- **Session Management**: Server-side sessions with PostgreSQL backing store
- **Security**: HTTP-only cookies with secure flags for production
- **User Management**: Automatic user creation and profile management through OAuth flow

## External Dependencies

### Core Infrastructure
- **Supabase**: PostgreSQL hosting for primary data storage
- **Replit Auth**: OAuth 2.0/OpenID Connect authentication provider
- **Replit Development Environment**: Integrated development and deployment platform

### Frontend Libraries
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **TanStack Query**: Powerful data synchronization for React applications
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation library

### Backend Libraries
- **Drizzle ORM**: Lightweight TypeScript ORM with excellent type safety
- **Express.js**: Minimal and flexible Node.js web framework
- **Passport.js**: Authentication middleware with OpenID Connect strategy
- **WebSocket (ws)**: Real-time bidirectional event-based communication

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking for enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS transformation tool with Autoprefixer