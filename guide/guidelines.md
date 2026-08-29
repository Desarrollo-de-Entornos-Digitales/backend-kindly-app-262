# Guía General de Desarrollo - Kindly App

Esta guía establece los estándares de colaboración, flujo de trabajo con Git y convenciones de código para mantener el proyecto ordenado, consistente y escalable.

---

## 1. Estrategia de Ramas (Git Flow)

Todo el desarrollo del proyecto sigue una estructura centralizada en base a dos ramas principales y ramas temporales de trabajo:

### Ramas Principales
- **`main`**: Rama de producción y versiones estables. **Protegida** (nunca hacer commit ni push directo). Solo recibe integraciones vía Pull Request desde `develop` o ramas de `release`/`hotfix`.
- **`develop`**: Rama base para el desarrollo diario y la integración de nuevas funcionalidades.

### Ramas de Trabajo (Branching Model)
Toda nueva tarea se ramifica a partir de **`develop`** y debe reintegrarse a **`develop`** mediante PR o merge.

Formato de nombres: `<tipo>/<descripcion-kebab-case>`

- **`feature/<nombre>`**: Nueva funcionalidad (ej. `feature/matching-algorithm`, `feature/auth-organizations`).
- **`fix/<nombre>`**: Corrección de un error o bug (ej. `fix/volunteer-profile-validation`).
- **`refactor/<nombre>`**: Reestructuración de código sin cambiar funcionalidad (ej. `refactor/database-service`).
- **`chore/<nombre>`**: Tareas de mantenimiento, dependencias o configuración (ej. `chore/eslint-setup`).
- **`docs/<nombre>`**: Cambios exclusivos en documentación (ej. `docs/api-endpoints`).
- **`test/<nombre>`**: Creación o ajuste de pruebas unitarias/ee2e (ej. `test/matching-service`).

---

## 2. Convenciones de Commits (Conventional Commits)

Utilizamos el estándar [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) para mantener un historial legible, semántico y preparado para versionado automático.

### Estructura de un Commit
```text
<tipo>(<alcance opcional>): <descripción concisa>

[cuerpo opcional explicando el porqué del cambio]

[pie de página opcional, e.g. BREAKING CHANGE o referencias a tareas]
```

### Tipos Permitidos
| Tipo | Uso | Ejemplo |
| :--- | :--- | :--- |
| **`feat`** | Nueva funcionalidad | `feat(matching): add cause affinity calculation` |
| **`fix`** | Corrección de un bug | `fix(auth): handle expired token error` |
| **`refactor`** | Cambio de código que no añade feat ni corrige bug | `refactor(users): simplify organization validation service` |
| **`docs`** | Modificaciones a documentación | `docs: add development and commit guidelines` |
| **`test`** | Adición o modificación de pruebas | `test(opportunities): add unit tests for filter query` |
| **`chore`** | Tareas auxiliares, dependencias, tooling | `chore: upgrade nestjs dependencies` |
| **`perf`** | Mejora de rendimiento | `perf(search): optimize volunteer location query` |
| **`style`** | Formato, espacios, puntos y comas (sin cambio de lógica) | `style: format files with prettier` |
| **`ci`** | Ajustes a pipelines o configuración CI/CD | `ci: add github action for automated testing` |

### Reglas para los Mensajes
1. Escribir la descripción en tiempo presente/imperativo y en minúsculas (ej. *add*, *fix*, *implement* o en español según el acuerdo del equipo).
2. No terminar el asunto con punto final.
3. Máximo 72 caracteres en la primera línea.
4. Si hay un cambio disruptivo (breaking change), indicarlo con un signo de exclamación antes de los dos puntos (`feat(auth)!: change jwt payload structure`) o en el pie de página (`BREAKING CHANGE: ...`).

---

## 3. Flujo de Trabajo Recomendado

1. **Actualizar `develop`**:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Crear rama de trabajo**:
   ```bash
   git checkout -b feature/opportunity-filters
   ```
3. **Desarrollar y realizar commits atómicos**:
   ```bash
   git commit -m "feat(opportunities): implement category filter endpoint"
   ```
4. **Verificar antes de subir**:
   ```bash
   cd server
   npm run lint
   npm run test
   ```
5. **Subir rama y abrir Pull Request hacia `develop`**:
   ```bash
   git push -u origin feature/opportunity-filters
   ```
