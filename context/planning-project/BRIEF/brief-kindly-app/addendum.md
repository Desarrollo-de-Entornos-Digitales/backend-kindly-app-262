# Addendum: kindly-app Context, Technical Architecture & Persistence Ideas

## Authors & Contributors
- Mariana Cerón
- Juliana Jiménez
- Hanna Muriel
- Maritce

---

## 1. Technical Architecture, Database Persistence & Role Model

Para enriquecer la arquitectura full-stack (NestJS Backend + DB + Responsive Frontend), se definen estos modelos y consideraciones clave:

### A. Modelo de Control de Acceso y Roles (RBAC)
El sistema cuenta con **3 Roles Principales**:
1. **VOLUNTEER (Voluntario):** Exploración, matching, postulación, indicación de insumos aportados, consulta de anuncios, escaneo de QR de asistencia y visualización de causas completadas.
2. **ORGANIZER (Organización):** Creación/edición de causas (incluyendo lista de insumos/herramientas requeridas), revisión de candidatos, generación de QR para eventos, publicación de anuncios y solicitud de verificación.
3. **ADMIN (Administrador / Superusuario):**
   - **Gestión Integral de Usuarios:** Listar usuarios, habilitar/deshabilitar cuentas (bloqueo preventivo o reactivación).
   - **Asignación de Roles y Permisos:** Capacidad de cambiar roles o delegar permisos administrativos.
   - **Revisión de Verificaciones:** Aprobar o rechazar las solicitudes de verificación de organizaciones tras revisar los documentos adjuntos.
   - **Moderación Global:** Capacidad de supervisar, pausar o dar de baja causas o anuncios inapropiados.

### B. Modelo de Datos y Persistencia Relacional
1. **Insumos y Recursos Ligados a la Causa (CauseSupplies & VolunteerSupplies):**
   - La entidad Cause se relaciona 1:N con CauseSupply (ej. *nombre del insumo: 'Palas', cantidad requerida: 5, unidad: 'unidades'*).
   - Al postularse, la relación intermedia Application o VolunteerSupply permite al voluntario seleccionar: *'Aporto 1 pala'*.
   - Mantiene el sistema limpio, estructurado y 100% enfocado en el objetivo del evento sin crear un marketplace abierto desordenado.
2. **Asistencia y Causas Completadas (Attendances - Lean / Binary Check-in):**
   - **Enfoque simplificado:** No se registran horas exactas con temporizador ni fraccionamiento de tiempo.
   - Al escanear el QR en el evento presencial, el registro marca el estado ttended: true y la fecha.
   - En el perfil del voluntario, se muestra la lista y contador de * Causas Completadas / Asistidas*.
3. **Taxonomía de Causas y Habilidades (Categories & Skills):**
   - Categorías predefinidas (e.g., *Medio Ambiente*, *Rescate Animal*, *Infancia y Educación*, *Adulto Mayor*, *Salud y Bienestar*).
   - Habilidades etiquetadas (e.g., *Veterinaria*, *Primeros auxilios*, *Logística*, *Fotografía*, *Enseñanza*).
   - Facilita el algoritmo de matching en base de datos mediante intersección de tablas intermedias.
4. **Gestión Atómica de Cupos (Quotas & Capacity):**
   - En la tabla Causes, almacenar max_capacity y current_accepted_count.
   - Transacciones en NestJS para evitar sobrecupo al momento de aceptar postulaciones.
5. **Validación Segura de Asistencia con Código QR:**
   - El backend genera un código/token único asociado a la causa.
   - El escaneo envía el token a POST /attendances/check-in, validando que el voluntario esté en estado ACCEPTED y registrando la asistencia única.
6. **Persistencia de Documentos de Verificación de Organización:**
   - Carga y persistencia de archivos de soporte (PDF/imágenes de personería jurídica o RUT) para la aprobación del Administrador.

---

## 2. Detailed UI / Screen Flow Breakdown (Taller Corte 1)

### Role: Voluntario (5 Screens)
1. **Home**:
   - Match de Causas: Interfaz swipe (tarjetas deslizables) para enviar solicitud automática / compartir perfil.
   - Para ti (For You): Feed con fechas próximas y sugerencias basadas en filtros/intereses.
2. **Búsqueda**:
   - Vista de Mapa interactivo con marcadores geográficos.
   - Buscador por texto y filtros (tipo de iniciativa, habilidades).
   - Resultados en cards.
3. **Comunidades / Causas**:
   - Listado de comunidades a las que pertenece o explora.
   - Detalle de la Causa (descripción, progreso, metas, insumos requeridos).
   - Registro de asistencia vía escáner de código QR.
   - Foro de novedades / tablón de anuncios unidireccional del organizador.
4. **Solicitudes**:
   - Estados: Pendientes, Aceptadas, Rechazadas.
   - Gestión: Cancelar postulación pendiente o retirarse de causa aceptada.
5. **Perfil**:
   - Datos personales, etiquetas de intereses y habilidades, ubicación.
   - Información operativa de campo: Centro de salud de referencia y tallaje de indumentaria.
   - Listado de causas activas y causas completadas.

### Role: Organizador (4 Screens)
1. **Home / Dashboard**:
   - Dashboard de causas activas y creadas.
   - Formulario de creación y publicación de causa (requisitos, ubicación, fecha, cupos, lista de insumos/herramientas requeridas).
2. **Mis Causas (Administración)**:
   - Panel de edición/eliminación.
   - Lista de miembros aceptados vs cupos disponibles (ej. 8/10) y balance de insumos confirmados por voluntarios.
   - Generación y descarga de QR para control de asistencia presencial.
   - Emisión de anuncios en el foro de la causa.
3. **Solicitudes (Postulantes)**:
   - Agrupación por causa con postulaciones pendientes.
   - Revisión de perfil de postulante (habilidades, intereses, talla, datos médicos/salud, insumos que aporta).
   - Acciones de Aceptar / Rechazar individual.
4. **Perfil Organizacional**:
   - Nombre, misión, datos de contacto y redes sociales.
   - Verificación de cuenta (envío de documentos para revisión de Admin).

### Role: Administrador (Módulo de Gestión)
1. **Dashboard de Usuarios & Roles:**
   - Directorio general de usuarios (Voluntarios, Organizaciones, Administradores).
   - Acciones para habilitar / deshabilitar cuentas y modificar roles/permisos.
2. **Panel de Verificación de Organizaciones:**
   - Lista de solicitudes de verificación pendientes con visor de documentos adjuntos.
   - Acciones de Aprobar (otorga insignia de verificado) o Rechazar con retroalimentación.
3. **Supervisión y Moderación de Causas:**
   - Visibilidad global de causas y auditoría de estado.

---

## 3. Parked Enhancement Ideas (Para evaluar en fases posteriores / PRD)

- **Voluntario:** Descarga de certificado digital de participación en 1-clic (PDF generado en backend) y contacto de emergencia (nombre y teléfono).
- **Organización:** Exportación de listado de asistentes en formato CSV/Excel.
- **Administrador:** Tarjetas visuales de métricas clave (KPIs de usuarios, causas activas y porcentaje global de asistencia) y campo de motivo al rechazar verificaciones o suspender usuarios.
