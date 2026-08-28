<!-- bmad:context -->
<!-- Verified 2026-08-28 against 74e8080. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## kindly-app

Plataforma para centralizar y conectar oportunidades de voluntariado entre organizaciones y voluntarios mediante un sistema de matching de causas (intereses, habilidades, ubicación y disponibilidad). El backend está construido con NestJS y TypeScript dentro de `server/`.

## Policy

- Nunca realizar cambios directos sobre `main`. Todo el desarrollo se ramifica desde y se integra hacia `develop`.
- Ramas de trabajo nombradas por convención: `feature/*`, `fix/*`, `chore/*`, `refactor/*`, `docs/*`, `test/*`.
- Seguir estrictamente Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`).
- Guía completa de contribución, ramas y commits: `docs/guidelines.md`.

## Where things are

- Backend (NestJS): `server/`
- Guía de convenciones y ramas: `docs/guidelines.md`
- Artefactos de planificación y diseño: `_bmad-output/`
- Configuración de BMad: `_bmad/`

## Running and verifying

- Ejecutar comandos de backend dentro del directorio `server/` (e.g. `npm run start:dev`, `npm run test`, `npm run lint`).

<!-- /bmad:context -->
