# Kindly App — Backend API

<p align="center">
  <strong>Plataforma integral para conectar y gestionar oportunidades de voluntariado de alto impacto</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM" />
  <img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=for-the-badge" alt="Conventional Commits" />
</p>

---

## 📖 Descripción del Proyecto

**Kindly** es una plataforma centralizada que conecta a voluntarios con organizaciones, fundaciones y refugios mediante:
- **Descubrimiento Inteligente:** Tarjetas tipo *swipe deck*, mapa interactivo geolocalizado y feed personalizado *"Para ti"*.
- **Logística Operativa de Campo:** Control de cupos máximos, listas de insumos requeridos y perfiles de preparación operativa (tallas, centros de salud, contactos de emergencia).
- **Asistencia Verificada:** Generación y escaneo de códigos QR dinámicos para validación de asistencia in situ.
- **Gobernanza y Confianza:** Sistema de verificación de documentos legales para organizaciones y moderación administrativa.
- **Comunidad y Gamificación:** Tablón oficial de anuncios con reacciones y sistema de insignias/logros por horas y causas completadas.

---

## 🏛️ Arquitectura del Sistema y Entidades

El backend está estructurado en **21 entidades TypeORM** organizadas en módulos de dominio dentro de `server/src/`:

```
server/src/
├── auth/            # JWT Strategy, Bcrypt hashing, Roles/Permissions Guards
├── users/           # User, Role, Permission, RolePermission
├── volunteers/      # Volunteer, Skill, Category, VolunteerSkill, VolunteerCategory
├── organizations/   # Organizer, OrganizationType
├── causes/          # Cause, Supply
├── participations/  # Submission (postulaciones), Attendance (asistencia QR)
├── matches/         # Algoritmos de afinidad, Swipe Deck y Búsqueda Geoespacial
├── announcements/   # Announcement, Reaction, AnnouncementReaction
├── achievements/    # Achievement, VolunteerAchievement
├── media/           # Image (gestión de imágenes para causas y anuncios)
└── common/          # Pipes de validación, Domain Exceptions, Decoradores
```

---

## 🚀 Inicio Rápido y Configuración

### 1. Requisitos Previos
- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

### 2. Instalación de Dependencias
```bash
cd server
npm install
```

### 3. Variables de Entorno
Crea un archivo `.env` en la raíz de `server/` (o configúralo en tu entorno):
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=kindly_db
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=7d
```

### 4. Inicialización de Base de Datos y Datos de Prueba (Seed)
Ejecuta el script SQL topológico de inicialización ubicado en `db/scripts/seed.sql`:
```bash
psql -h localhost -p 5433 -U postgres -d kindly_db -f ../db/scripts/seed.sql
```

### 5. Ejecutar la Aplicación
```bash
# Modo desarrollo con recarga en caliente
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

### 6. Calidad de Código y Pruebas
```bash
npm run lint       # Validación de estilo y buenas prácticas con ESLint
npm run test       # Pruebas unitarias con Jest
npm run test:e2e   # Pruebas End-to-End
```

---

## 🌿 Flujo de Trabajo Git y Distribución de Ramas

El equipo sigue estrictamente el flujo **Git Flow** con **Conventional Commits**.

* **`main`**: Producción (Protegida).
* **`develop`**: Rama base de integración diaria.

### Resumen de Ramas por Integrante (56 Historias de Jira)

| Integrante | Dominio Principal | Ramas de Trabajo |
|---|---|---|
| **👤 Persona 1** | IAM, Perfiles, Admin y Búsqueda (19 US) | • `feature/auth-and-user-governance`<br>• `feature/volunteer-profiles-and-achievements`<br>• `feature/organization-profiles-verification`<br>• `feature/causes-search-and-filters` |
| **👤 Persona 2** | Gestión de Causas, Anuncios y Match Cards (19 US) | • `feature/causes-crud-and-supplies`<br>• `feature/announcements-and-reactions`<br>• `feature/swipe-match-deck`<br>• `feature/causes-map-preview` |
| **👤 Persona 3** | Postulaciones, QR, Asistencia y Feed For You (18 US) | • `feature/application-pipeline-screening`<br>• `feature/attendance-qr-checkin`<br>• `feature/for-you-feed-and-map-navigation` |

---

## 📚 Documentación Detallada

Para más detalles, consulta la documentación en la carpeta `guide/` y `context/`:

- 📋 [**Guía de Flujo de Trabajo y Distribución de Historias de Jira (team-workflow.md)**](./guide/team-workflow.md)
- 📐 [**Guía General de Desarrollo y Convenciones de Commits (guidelines.md)**](./guide/guidelines.md)
- 📄 [**Documento de Requerimientos de Producto (PRD)**](./context/planning-project/PRD/prd-kindly-app/prd.md)
- 🗄️ [**Script de Semillas y Modelo de Datos SQL**](./db/scripts/seed.sql)