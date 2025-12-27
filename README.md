# Homy Sofa — Frontend

Comprehensive repository for the Homy Sofa booking application. This repository contains an Angular 15 frontend (SPA) and a Spring Boot backend (Java 17) with file-upload support, Flyway migrations and a MySQL-compatible data layer.

This README provides an overview of the project, repository layout, development setup, run/build instructions, and implementation notes to help you get started quickly.

---

## Contents
- Overview
- Tech stack
- Repository layout
- Quick start (development)
- Backend details
- Frontend details
- Uploads & asset serving
- Database & migrations
- Testing & build
- Contributing
- Troubleshooting & notes

---

## Overview

Homy Sofa is a booking and management application with two main feature areas:

- Public site (user-facing) to browse services and create bookings.
- Admin site (protected) for managing services, bookings, customers and site settings, including uploading service images.

The frontend is implemented as a lazy-loaded Angular SPA. The backend is a Spring Boot app exposing REST APIs and a file upload endpoint for storing service images on disk and serving them under `/assets/backend/**`.

## Tech stack

- Frontend: Angular 15 (TypeScript)
- Backend: Spring Boot (Java 17), Maven
- DB: MySQL (used with Flyway for migrations)
- File storage: server-side filesystem (configurable upload directory)
- Dev tooling: `ng` / `npm`, Maven wrapper `mvnw`

## Repository layout (high level)

- `src/` — Angular app
	- `src/app/` — application code
		- `admin/` — admin feature module and components
		- `user/` — public feature module and components
		- `core/` — guards, interceptors, services used across the app
		- `models/` — TypeScript models (e.g., `service.model.ts`, `booking.model.ts`)
		- `shared/` — shared components (navbar, footer) and Material module
- `backend/Homy-backend/` — Spring Boot backend
	- `src/main/java/...` — application Java code (controllers, entities, config)
	- `src/main/resources/application.properties` — backend config
	- `uploads/backend/` — configured upload directory (runtime)
	- `pom.xml` & `mvnw` wrappers
- `proxy.conf.json` — Angular dev proxy configuration
- `package.json` — frontend scripts and dependencies

Key files to inspect:

- Frontend routing and lazy-loading: [src/app/app-routing.module.ts](src/app/app-routing.module.ts)
- Admin routing & guard: [src/app/admin/admin-routing.module.ts](src/app/admin/admin-routing.module.ts) and [src/app/core/guards/admin.guard.ts](src/app/core/guards/admin.guard.ts)
- Shared Material module: [src/app/shared/material/material/material.module.ts](src/app/shared/material/material/material.module.ts)
- Backend upload handling and resource mapping: `backend/Homy-backend/src/main/java/.../ServiceController.java` and `WebMvcConfig.java`

## Quick start (development)

Prerequisites:

- Node.js (recommended LTS) and `npm`
- Java 17
- Maven or use the provided Maven wrapper (`mvnw` / `mvnw.cmd`)
- A running MySQL instance (or compatible DB) and a user configured for the app

1) Install frontend dependencies

```bash
npm install
```

2) Configure backend DB and properties

Edit `backend/Homy-backend/src/main/resources/application.properties` to set your database URL, credentials and optionally `app.upload.dir`:

- `spring.datasource.url` — JDBC URL
- `spring.datasource.username` / `spring.datasource.password`
- `app.upload.dir` — where uploaded images are stored (default: `uploads/backend` relative to backend working dir)

3) Run the backend (from Windows PowerShell in the `backend/Homy-backend` folder):

```powershell
.\mvnw spring-boot:run
```

Or on macOS / Linux:

```bash
./mvnw spring-boot:run
```

Default backend port: 8080 (unless overridden in `application.properties`). The backend uses Flyway to apply DB migrations on startup.

4) Run the frontend (from repo root)

```bash
npm start
# or
ng serve --proxy-config proxy.conf.json
```

The frontend dev server runs at `http://localhost:4200/` and the `proxy.conf.json` forwards API calls and requests for `/assets/backend/**` to the backend during development.

## Backend details

- Location: `backend/Homy-backend`
- Main responsibilities:
	- Provide REST endpoints for services, bookings, customers and admin operations.
	- Accept image uploads (multipart/form-data), write them to disk, and return a URL/path for the saved asset.
	- Serve uploaded assets via a resource handler mapped to `/assets/backend/**`.

Important config:

- `app.upload.dir` (configured in `application.properties`) controls where the backend writes uploads. The running app will serve files from that folder.

If you change `app.upload.dir`, ensure `WebMvcConfig` (resource handler) is aligned or that the configuration is reloaded so the resource mapping points to the new folder.

## Frontend details

- Location: `src/` (Angular app)
- Key concepts:
	- Lazy-loaded feature modules: `user` (public) and `admin` (protected).
	- `core/services` contains HTTP services to call backend APIs (e.g., `auth.service.ts`, `service.service.ts`, `booking.service.ts`).
	- `models/` contains TypeScript interfaces for data exchanged with backend.
	- Admin image upload flow:
		- Admin selects an image file in the Manage Services UI.
		- Frontend shows a preview (data URL) locally while uploading.
		- The file is POSTed to the backend upload endpoint as `multipart/form-data`.
		- Backend returns a usable URL or path; frontend stores that in the service model and shows it in the UI.

Dev proxy: `proxy.conf.json` forwards API calls and asset requests to backend to avoid CORS during development.

## Uploads & asset serving

- Uploaded files are stored on the backend filesystem under the configured `app.upload.dir` (e.g., `uploads/backend`).
- The backend exposes uploaded assets at `/assets/backend/{filename}` via a Spring MVC resource handler (`WebMvcConfig`).
- Upload endpoint returns a full URL (or path) that the frontend can use to display the uploaded image.

Notes for Windows developers: the resource handler uses `file:` URIs where necessary so that filesystem paths are served correctly by Spring when using absolute Windows paths.

## Database & migrations

- Flyway is used for schema migrations. Migration SQL files live under `backend/Homy-backend/src/main/resources/db/migration` (or configured Flyway location).
- Example: migrations were used to add `image_path`/`image_url` columns and later to rename/normalize those columns. Keep migrations in source control so other developers can reproduce DB schema changes.

## Testing & build

Frontend:

- Run unit tests: `npm test` or `ng test`
- Build production bundle: `ng build --prod`

Backend:

- Run tests via Maven: `.\\mvnw test` (Windows) or `./mvnw test`
- Build jar: `.\\mvnw package`

## Contributing & development notes

- Follow existing project structure: keep cross-cutting services under `src/app/core/services`. Add new feature modules under `src/app/` and lazy-load them in `app-routing.module.ts`.
- Guards are in `src/app/core/guards`. Use `canActivate: [AdminGuard]` on admin routes.
- When adding or modifying backend file storage behavior, update `app.upload.dir` and `WebMvcConfig` so uploaded assets remain accessible.

Recommended workflow for local dev:

1. Start backend via Maven wrapper in `backend/Homy-backend`.
2. Start frontend `npm start` from repo root so `proxy.conf.json` sends API and asset requests to backend.

## Troubleshooting

- If uploaded images do not load in the browser:
	- Check the backend upload directory (value of `app.upload.dir`) for the file.
	- Confirm the backend serves the file at `/assets/backend/<file>` by opening `http://localhost:8080/assets/backend/<file>`.
	- Check the browser Network tab for 404/CORS errors; ensure the frontend dev proxy is running and correctly configured.
- If the backend fails to start:
	- Inspect console for Flyway migration failures or database connection errors.
	- Verify `application.properties` DB URL and credentials.

## Where to look for common tasks

- Admin guard and routing: [src/app/core/guards/admin.guard.ts](src/app/core/guards/admin.guard.ts) and [src/app/admin/admin-routing.module.ts](src/app/admin/admin-routing.module.ts)
- Manage Services (admin UI): [src/app/admin/manage-services](src/app/admin/manage-services)
- Service upload endpoint and resource handling: `backend/Homy-backend/src/main/java/.../ServiceController.java` and `WebMvcConfig.java`
