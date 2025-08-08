# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "Dart's Bli", an Expo-based React Native darts scoring application. The app allows players to track scores in dart games (501/301 variants), manage multiple players, and maintain game state with persistent storage.

## Development Commands

- **Start development server**: `expo start` (or `npm start`)
- **Run on specific platforms**:
  - Android: `expo start --android`
  - iOS: `expo start --ios`
  - Web: `expo start --web`
- **Testing**: `jest --watchAll`

## Architecture

### Navigation Structure
The app uses Expo Router with file-based routing:
- Main navigation in `app/_layout.tsx` with Stack navigation
- Tab-based navigation in `app/(tabs)/` for main screens
- Modal screens for settings and about pages
- Dynamic routing for game screens: `app/game/[id].tsx`

### Core Models and Data Layer

**Game Engine (`models/game.ts`)**:
- Central `Game` class managing game state, player turns, scoring logic
- Supports 501/301 game variants with classic or double finish types
- Handles player rotation, dart scoring, and game completion
- Uses AsyncStorage for persistence with static methods for data access

**Player System**:
- `Player` class (`models/player.ts`) for individual player data
- `PlayerInRow` (`models/playerInRow.ts`) for turn-based scoring
- Players have order, score, and name properties

**Repository Pattern**:
- Interface-based repository pattern in `repository/`
- `GameAsyncStorageRepository.ts` implements AsyncStorage persistence
- Generic `Repository` interface for potential future data sources

### Type Definitions
Key types in `types/index.ts`:
- `PlayerType`: Player data structure
- `GameType`: Game state representation  
- `DartsType`: Individual dart score and multiplier

### Components Structure
- Shared UI components in `components/`
- Game-specific components in `components/game/`
- Themed components using React Navigation themes
- Custom styled text and layout components

### Storage Strategy
- Uses `@react-native-async-storage/async-storage` for game persistence
- Games stored with generated IDs prefixed with "darts"
- Static methods on Game class handle storage operations
- No backend dependency - fully offline capable

## Key Game Logic

The app implements standard darts scoring rules:
- Players start with 501 or 301 points
- Score is reduced by dart values (score × multiplier)  
- Players finish when reaching exactly 0 points
- Optional double-finish requirement
- Turn management with 3 darts per turn
- Automatic player rotation and game state tracking

## Development Notes

- Uses TypeScript with strict mode enabled
- Expo SDK ~49.0.15 with React Native 0.72.6
- Custom fonts loaded via expo-font
- Image handling through expo-image
- Uses React Native's built-in theming system