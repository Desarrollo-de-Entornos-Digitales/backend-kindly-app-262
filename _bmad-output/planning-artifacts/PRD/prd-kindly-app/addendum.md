# Addendum: PRD Technical Context & Downstream Mapping

## Authors & Contributors
- Mariana Cerón
- Juliana Jiménez
- Hanna Muriel
- Maritce

---

## 1. Traceability & Screen Mapping

| Epic / User Story | Corresponding Screen(s) | Key Backend Models / Endpoints |
| :--- | :--- | :--- |
| **US-1.1: Auth & Registration** | Login / Register Modal / Screen | User, POST /auth/register, POST /auth/login |
| **US-1.2: Volunteer Profile** | Pantalla 5: Perfil (Voluntario) | Profile, GET/PATCH /users/profile |
| **US-1.3: Org Profile & Verification** | Pantalla 4: Perfil (Organizador) | Organization, POST /organizations/verification-request |
| **US-1.4: Admin User Management** | Dashboard Administrador | GET/PATCH /admin/users, PATCH /admin/organizations/:id/verify |
| **US-2.1: Cause Creation** | Pantalla 1: Home (Organizador) | Cause, CauseSupply, POST /causes |
| **US-2.2: Cause Administration** | Pantalla 2: Mis Causas (Organizador) | PATCH/DELETE /causes/:id, Quota balance query |
| **US-2.3: Cause Announcements** | Pantalla 3: Comunidades (Foro) | Announcement, POST /causes/:id/announcements |
| **US-3.1: Swipe Match** | Pantalla 1: Home (Match de Causas) | GET /causes/feed/swipe, POST /applications/match |
| **US-3.2: Map Search** | Pantalla 2: Búsqueda (Vista Mapa) | GET /causes/map?lat=&lng=&radius= |
| **US-3.3: Filters & For You** | Pantalla 2: Buscador y Filtros | GET /causes/search?category=&skills= |
| **US-4.1: Application & Supplies** | Pantalla 4: Solicitudes (Voluntario) | Application, VolunteerSupply, POST /applications |
| **US-4.2: Applicant Screening** | Pantalla 3: Solicitudes (Organizador) | PATCH /applications/:id/decision (ACCEPT/REJECT) |
| **US-4.3: QR Attendance** | Pantalla 3: Comunidades (Escanear QR) | Attendance, POST /attendances/check-in |

---

## 2. Future Backlog (Post-MVP)
- **PDF Participation Certificates:** 1-click certificate generation in NestJS with volunteer name and cause metadata.
- **CSV Attendance Export:** Instant spreadsheet export for organizations.
- **Enhanced Volunteer Emergency Contacts:** Full secondary emergency contact fields.
