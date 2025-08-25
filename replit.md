# Overview

This is a Spotify Vibe Journal application that allows users to capture and track their emotional responses to music they're listening to. The app integrates with Spotify's API to fetch currently playing tracks and enables users to associate emojis and notes with those tracks, creating a personal music mood journal. Users can view their vibe history, see weekly statistics, and export their data.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React and TypeScript using Vite as the build tool. It follows a component-based architecture with:

- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for client-side routing with simple, lightweight navigation
- **State Management**: TanStack Query for server state management and caching
- **Theme**: Custom dark theme with Spotify-inspired colors (green accents, dark backgrounds)
- **Layout**: Responsive design with sidebar navigation on desktop and mobile-friendly interface

## Backend Architecture
The backend uses Express.js with TypeScript in a monorepo structure:

- **Server Framework**: Express.js with middleware for JSON parsing, logging, and error handling
- **API Design**: RESTful endpoints for authentication, vibe entries, and Spotify integration
- **Authentication**: Spotify OAuth 2.0 flow with token management and refresh logic
- **Session Management**: Express sessions with PostgreSQL session store
- **Development Setup**: Vite integration for development with HMR support

## Database Schema
Uses Drizzle ORM with PostgreSQL for type-safe database operations:

- **Users Table**: Stores Spotify user data, tokens, and profile information
- **Vibe Entries Table**: Core feature storing emoji, notes, track metadata, and timestamps
- **Weekly Stats Table**: Aggregated statistics for user engagement and top moods/artists
- **Relationships**: Proper foreign key constraints with cascade deletes for data integrity

## Authentication & Authorization
Implements Spotify OAuth 2.0 flow:

- **OAuth Flow**: Standard authorization code flow with PKCE
- **Token Management**: Automatic refresh token handling for seamless user experience
- **Session Storage**: Secure session management with PostgreSQL backend
- **Route Protection**: Middleware-based authentication checks for protected endpoints

## Third-Party Integrations
Primary integration with Spotify Web API:

- **Now Playing**: Real-time fetching of currently playing tracks with 30-second refresh intervals
- **Track Metadata**: Album art, artist names, track names, and Spotify URIs
- **Error Handling**: Graceful degradation when Spotify API is unavailable
- **Rate Limiting**: Respect for Spotify API rate limits with appropriate retry logic

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM for database operations with PostgreSQL dialect
- **express**: Node.js web framework for API server
- **@tanstack/react-query**: Server state management and caching for React
- **wouter**: Lightweight client-side routing for React

## UI & Styling Dependencies
- **@radix-ui/***: Comprehensive set of UI primitives for accessible components
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Type-safe variant management for component styling
- **lucide-react**: Icon library with consistent SVG icons

## Development Dependencies
- **vite**: Build tool and development server with HMR support
- **typescript**: Type safety across the entire application stack
- **drizzle-kit**: Database migration and schema management tools
- **esbuild**: Fast JavaScript bundler for production builds

## Authentication & Session Dependencies
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **zod**: Runtime type validation for API inputs and form validation

## Spotify Integration
- **Spotify Web API**: RESTful API for accessing user's currently playing tracks, profile data, and playback information through OAuth 2.0 authentication flow