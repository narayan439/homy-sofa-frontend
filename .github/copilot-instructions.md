# Copilot / AI Assistant Instructions for homy-sofa-frontend

Quick, actionable guidance so an AI agent can be immediately productive in this Angular frontend.

- Project root: `src/` — app lives under `src/app/`.

- Big picture
  - This is an Angular SPA with two primary feature areas: `user` and `admin`.
  - Routing is lazy-loaded at the top level: see `src/app/app-routing.module.ts` which loads
    - `./user/user.module` for the public site
    - `./admin/admin.module` for admin pages
  - Admin routes are protected by `AdminGuard` at `src/app/core/guards/admin.guard.ts`.

- Major components and boundaries
  - Public UI: `src/app/user/*` (home, services, booking, contact). See `src/app/user/user-routing.module.ts` for internal routes.
  - Admin UI: `src/app/admin/*` (login, dashboard, manage-services, manage-bookings). See `src/app/admin/admin-routing.module.ts`.
  - Shared UI: `src/app/shared/components` contains `navbar` and `footer` used across pages.
  - Shared Material module: `src/app/shared/material/material/material.module.ts` groups Material imports for the app.

- Services and data flow
  - Core services live in `src/app/core/services/`:
    - `auth.service.ts` — authentication and token handling
    - `booking.service.ts` — booking API calls
    - `service.service.ts` — CRUD for services
  - Models in `src/app/models/` (e.g. `admin.model.ts`, `booking.model.ts`, `service.model.ts`) define shapes used across services/components.
  - Typical flow: UI component -> inject service from `core/services` -> HTTP request -> model -> update UI.

- Patterns & conventions (project-specific)
  - Feature modules are lazy-loaded via `loadChildren` in `app-routing.module.ts`.
  - Guards are placed under `core/guards` and imported in routing modules.
  - Keep cross-cutting services in `core/services` and models in `models/`.
  - Shared presentational pieces (navbar/footer) are in `shared/components` and not feature-specific.
  - Use Angular module barreling minimally; imports often use relative paths like `./core/services/auth.service`.

- Build / run / test
  - Start dev server (used by project tasks):

    ```bash
    npm start
    # or
    ng serve
    ```

  - Run tests (if configured):

    ```bash
    npm test
    # or
    ng test
    ```

  - If editing Angular Material imports, update `src/app/shared/material/material/material.module.ts`.

- Files to inspect when debugging common problems
  - Routing/guards: `src/app/app-routing.module.ts`, `src/app/user/user-routing.module.ts`, `src/app/admin/admin-routing.module.ts`, `src/app/core/guards/admin.guard.ts`
  - Services and API issues: `src/app/core/services/*.ts` and models in `src/app/models/*.ts`
  - Shared UI: `src/app/shared/components/navbar/navbar.component.ts` and `footer.component.ts`

- Quick examples to follow when changing or adding features
  - Add a lazy-loaded feature: create `src/app/<feature>` with `<feature>.module.ts` and `<feature>-routing.module.ts`, then add a top-level route in `src/app/app-routing.module.ts` using `loadChildren: () => import('./<feature>/<feature>.module').then(m => m.<Feature>Module)`.
  - Protect an admin route: add `canActivate: [AdminGuard]` to the route in the admin routing module and ensure `AdminGuard` is provided in `core/guards`.

- What not to change without verification
  - Don't convert lazy-loaded modules to eager without considering bundle/route consequences.
  - Avoid renaming `core/services` or `models` directories because many imports use relative paths.

- Where to ask for clarification
  - If HTTP base URL, environment variables, or backend contract are unclear, ask which backend / env is intended before changing service endpoints.

If anything is missing or inaccurate (e.g., new modules added), tell me which parts to expand or correct and I will update this file.
