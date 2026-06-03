# NOTES

## Starter Code

This project is based on two previous repositories:

* Laura's Oblig 1 repository
* Laura's Oblig 3 repository
* Emilie's Oblig 3 repository

The project was significantly extended and modified during the development of the exam project.

---

## Reused and Modified Frontend Code

The following parts were reused from previous assignments and heavily modified:

* The game board component originates from Laura's Oblig 1 project. It was converted to JSX and adapted to work within the new React application structure.
* The Lobby page originates from Laura's Oblig 3 project. It was extensively modified with new variables, functionality, game states, filtering, joining mechanics, and UI elements.
* The Tournament List page originates from Laura's Oblig 3 project. It was extensively modified with new tournament-related functionality, status handling, navigation, controls, and interface elements.
* The "About Spanish Poker Dice" page is based on content from Laura's Oblig 1 project.

The following frontend features were implemented from scratch or substantially redesigned:

* Tournament Page
* Tournament Overview components
* Admin pages
* Dashboard components
* Spectator functionality
* Multiple WebSocket-enabled pages and components for live updates, comments, and game state synchronization

---

## Backend Notes

The backend is primarily based on Emilie's Oblig 3 repository, but several architectural and functional changes were introduced.

Major modifications include:

* Business logic was reorganized from controllers into dedicated service layers.
* HTTP request structures were modified to improve testing and application flow.
* New API routes were added to support tournaments, administration, live gameplay, and additional functionality.
* The database seed was redesigned and expanded to provide sufficient data for demonstration and testing.
* WebSocket functionality was added to support live game updates and live comments.
* Additional authentication, authorization, tournament, and gameplay functionality was implemented.

---

## Database Seeding

A custom seed script is included with the project.

The seed populates the database with:

* Users
* Matches
* Tournaments
* Comments

This data is intended to provide enough content to demonstrate the application's functionality during evaluation.

---

## Running the Application

1. Install dependencies:

npm install

2. Configure environment variables.

3. Seed the database:

npm run seed

4. Start the backend server:

npm run dev

5. Start the frontend application:

npm run dev

---

## Team Work Distribution

The workload was distributed among team members throughout the project.

Frontend development, tournament-related pages, user-facing interfaces, and various React components were primarily developed and adapted by Laura.

Backend architecture, services, API functionality, and game-related logic were primarily based on and extended from Emilie's repository.

All team members contributed to the final integration, testing, debugging, and project review.

---

## Known Limitations

Some minor bugs, visual inconsistencies, and edge cases may still exist.

The project prioritizes demonstrating the required functionality, architecture, React component structure, REST API design, authentication, database integration, and real-time communication features required by the course.