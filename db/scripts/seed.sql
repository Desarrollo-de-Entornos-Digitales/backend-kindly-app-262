-- =============================================================================
-- KINDLY APP - DATABASE INITIAL SEED DATA (PostgreSQL)
-- =============================================================================
-- Este script contiene datos iniciales y de prueba para la base de datos de Kindly.
-- Construido estrictamente a partir de las 21 entidades TypeORM actuales del proyecto.
-- Respeta el orden topológico de dependencias de Foreign Keys y transacciones ACID.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. ROLES
-- Entidad: Role | Tabla: role
-- =============================================================================
INSERT INTO role (id, name, description) VALUES
(1, 'admin', 'Administrador con acceso total a la gestión de usuarios, organizaciones y auditoría del sistema'),
(2, 'volunteer', 'Voluntario con permisos para explorar causas, postularse, registrar asistencia y recibir logros'),
(3, 'organizer', 'Organizador o fundación que publica y administra causas comunitarias, suministros y comunicados');

-- =============================================================================
-- 2. PERMISSIONS
-- Entidad: Permission | Tabla: permissions
-- =============================================================================
INSERT INTO permissions (id, name, description) VALUES
(1, 'manage_users', 'Gestionar cuentas de usuarios, estados de activación y asignación de roles'),
(2, 'manage_causes', 'Crear, actualizar, publicar y finalizar causas de voluntariado'),
(3, 'manage_organizations', 'Verificar, auditar y actualizar perfiles de organizaciones'),
(4, 'manage_volunteers', 'Visualizar y gestionar hojas de vida y perfiles de voluntarios'),
(5, 'manage_announcements', 'Publicar, editar y moderar anuncios oficiales dentro de causas'),
(6, 'participate_causes', 'Postularse a causas de voluntariado y marcar asistencia'),
(7, 'react_announcements', 'Reaccionar con emoticones/iconos a anuncios comunitarios'),
(8, 'view_metrics', 'Acceso a tableros de control y métricas de impacto social');

-- =============================================================================
-- 3. ROLE_PERMISSIONS
-- Entidad: RolePermission | Tabla: role_permissions (Clave compuesta: role_id, permission_id)
-- =============================================================================
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Admin: todos los permisos (1 al 8)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
-- Volunteer: participar, reaccionar
(2, 6), (2, 7),
-- Organizer: causas, voluntarios, anuncios, reaccionar, métricas
(3, 2), (3, 4), (3, 5), (3, 7), (3, 8);

-- =============================================================================
-- 4. USERS
-- Entidad: User | Tabla: users
-- FK: role_id -> role.id
-- =============================================================================
INSERT INTO users (id, name, role_id, username, email, contact, password, is_active, created_at) VALUES
(1, 'Administrador Kindly', 1, 'admin_kindly', 'admin@kindly.org', '+57 300 111 2233', '$2b$10$wT8lH5mX1K6oZJ9bZq8yTe1234567890abcdefghijklm', true, '2026-01-10 08:00:00'),
(2, 'Fundación Huellas Verdes', 3, 'huellas_verdes', 'contacto@huellasverdes.org', '+57 301 222 3344', '$2b$10$wT8lH5mX1K6oZJ9bZq8yTe1234567890abcdefghijklm', true, '2026-01-15 09:30:00'),
(3, 'Banco de Alimentos Esperanza', 3, 'banco_esperanza', 'info@bancoesperanza.org', '+57 302 333 4455', '$2b$10$wT8lH5mX1K6oZJ9bZq8yTe1234567890abcdefghijklm', true, '2026-01-18 10:15:00'),
(4, 'Asociación Protege Animales', 3, 'protege_animales', 'ayuda@protegeanimales.org', '+57 303 444 5566', '$2b$10$wT8lH5mX1K6oZJ9bZq8yTe1234567890abcdefghijklm', true, '2026-01-20 11:00:00'),
(5, 'Camila Restrepo Pérez', 2, 'camila_restrepo', 'camila.restrepo@example.com', '+57 311 445 6677', '$2b$10$wT8lH5mX1K6oZJ9bZq8yTe1234567890abcdefghijklm', true, '2026-01-22 14:20:00'),
(6, 'Santiago Gómez Osorio', 2, 'santiago_gomez', 'santiago.gomez@example.com', '+57 312 556 7788', '$2b$10$wT8lH5mX1K6oZJ9bZq8yTe1234567890abcdefghijklm', true, '2026-01-25 15:45:00'),
(7, 'Valentina Torres Silva', 2, 'valentina_torres', 'valentina.torres@example.com', '+57 313 667 8899', '$2b$10$wT8lH5mX1K6oZJ9bZq8yTe1234567890abcdefghijklm', true, '2026-01-28 16:10:00'),
(8, 'Mateo Morales Duque', 2, 'mateo_morales', 'mateo.morales@example.com', '+57 314 778 9900', '$2b$10$wT8lH5mX1K6oZJ9bZq8yTe1234567890abcdefghijklm', true, '2026-02-01 11:30:00'),
(9, 'Lucía Fernández Ramos', 2, 'lucia_fernandez', 'lucia.fernandez@example.com', '+57 315 889 0011', '$2b$10$wT8lH5mX1K6oZJ9bZq8yTe1234567890abcdefghijklm', true, '2026-02-03 13:00:00'),
(10, 'Daniel Herrera Castro', 2, 'daniel_herrera', 'daniel.herrera@example.com', '+57 316 990 1122', '$2b$10$wT8lH5mX1K6oZJ9bZq8yTe1234567890abcdefghijklm', true, '2026-02-05 17:15:00');

-- =============================================================================
-- 5. SKILLS
-- Entidad: Skill | Tabla: skills
-- =============================================================================
INSERT INTO skills (id, name) VALUES
(1, 'Primeros auxilios y atención básica'),
(2, 'Diseño gráfico y comunicación visual'),
(3, 'Logística, acopio y coordinación de eventos'),
(4, 'Enseñanza, pedagogía y talleres infantiles'),
(5, 'Cuidado, rescate y adiestramiento canino'),
(6, 'Reforestación, siembra y compostaje'),
(7, 'Desarrollo web y soporte tecnológico');

-- =============================================================================
-- 6. CATEGORIES
-- Entidad: Category | Tabla: categories
-- =============================================================================
INSERT INTO categories (id, name) VALUES
(1, 'Medio Ambiente y Reforestación'),
(2, 'Educación e Infancia'),
(3, 'Protección y Bienestar Animal'),
(4, 'Salud y Acompañamiento Comunitario'),
(5, 'Asistencia Alimentaria y Nutrición');

-- =============================================================================
-- 7. ORGANIZATION_TYPES
-- Entidad: OrganizationType | Tabla: organization_types
-- =============================================================================
INSERT INTO organization_types (id, name, description) VALUES
(1, 'ONG / Fundación', 'Organizaciones sin ánimo de lucro constituidas legalmente con enfoque social y ambiental'),
(2, 'Institución Educativa', 'Colegios, universidades e instituciones de formación comunitaria'),
(3, 'Colectivo Comunitario', 'Iniciativas barriales o ciudadanas autogestionadas en pro de la comunidad'),
(4, 'Entidad Pública / Municipal', 'Instituciones del Estado que canalizan voluntariado civil y participación ciudadana');

-- =============================================================================
-- 8. ORGANIZERS
-- Entidad: Organizer | Tabla: organizers
-- FKs: user_id -> users.id, organization_type_id -> organization_types.id
-- =============================================================================
INSERT INTO organizers (id, user_id, is_organization, name, description, website, verification_file, verification_status, organization_type_id) VALUES
(1, 2, true, 'Fundación Huellas Verdes', 'Dedicada a la recuperación de cuencas hidrográficas y educación ambiental comunitaria.', 'https://huellasverdes.org', 'doc_rut_huellas_verdes.pdf', 'verified', 1),
(2, 3, true, 'Banco de Alimentos Esperanza', 'Recolección, acopio y redistribución de alimentos nutritivos a comedores comunitarios.', 'https://bancoesperanza.org', 'doc_camara_comercio_esperanza.pdf', 'verified', 1),
(3, 4, true, 'Asociación Protege Animales', 'Refugio para caninos y felinos abandonados, campañas de esterilización y adopción.', 'https://protegeanimales.org', 'doc_acta_asociacion_animales.pdf', 'verified', 3);

-- =============================================================================
-- 9. VOLUNTEERS
-- Entidad: Volunteer | Tabla: volunteers
-- FK: user_id -> users.id
-- =============================================================================
INSERT INTO volunteers (id, user_id, description, shirt_size, height, health_center, blood_type, emergency_contact, completed_causes) VALUES
(1, 5, 'Apasionada por la protección ambiental, reforestación y actividades al aire libre.', 'M', '1.65', 'EPS Sura', 'O+', '+57 311 445 6677', 3),
(2, 6, 'Estudiante de medicina veterinaria con alta vocación de servicio y rescate animal.', 'L', '1.78', 'Sanitas', 'A+', '+57 312 556 7788', 5),
(3, 7, 'Diseñadora gráfica y educadora lúdica con experiencia en talleres escolares.', 'S', '1.60', 'Compensar', 'O-', '+57 313 667 8899', 2),
(4, 8, 'Ingeniero ambiental enfocado en reforestación, reciclaje y gestión de residuos.', 'M', '1.72', 'Famisanar', 'B+', '+57 314 778 9900', 4),
(5, 9, 'Profesional de enfermería especializada en emergencias médicas y atención primaria.', 'S', '1.63', 'Salud Total', 'O+', '+57 315 889 0011', 6),
(6, 10, 'Organizador de logística deportiva y dinámicas comunitarias con jóvenes.', 'XL', '1.85', 'Nueva EPS', 'AB+', '+57 316 990 1122', 1);

-- =============================================================================
-- 10. VOLUNTEER_SKILLS
-- Entidad: VolunteerSkill | Tabla: volunteer_skills (Clave compuesta: volunteer_id, skill_id)
-- =============================================================================
INSERT INTO volunteer_skills (volunteer_id, skill_id) VALUES
(1, 6), (1, 3), -- Camila: Reforestación, Logística
(2, 5), (2, 1), -- Santiago: Cuidado animal, Primeros auxilios
(3, 2), (3, 4), -- Valentina: Diseño, Pedagogía
(4, 6), (4, 7), -- Mateo: Reforestación, Soporte web
(5, 1), (5, 3), -- Lucía: Primeros auxilios, Logística
(6, 3), (6, 2); -- Daniel: Logística, Diseño

-- =============================================================================
-- 11. VOLUNTEER_CATEGORIES
-- Entidad: VolunteerCategory | Tabla: volunteer_categories (Clave compuesta: volunteer_id, category_id)
-- =============================================================================
INSERT INTO volunteer_categories (volunteer_id, category_id) VALUES
(1, 1), (1, 2), -- Camila: Medio Ambiente, Educación
(2, 3), (2, 4), -- Santiago: Protección Animal, Salud
(3, 2), (3, 5), -- Valentina: Educación, Alimentos
(4, 1), (4, 4), -- Mateo: Medio Ambiente, Salud
(5, 4), (5, 5), -- Lucía: Salud, Alimentos
(6, 2), (6, 3); -- Daniel: Educación, Protección Animal

-- =============================================================================
-- 12. ACHIEVEMENTS
-- Entidad: Achievement | Tabla: achievements
-- =============================================================================
INSERT INTO achievements (id, name, color, icon, description) VALUES
(1, 'Primer Paso', '#4CAF50', 'award-badge-step', 'Otorgado por completar con éxito tu primera causa de voluntariado'),
(2, 'Guardián Verde', '#2E7D32', 'leaf-eco', 'Participaste con dedicación en al menos 3 causas de impacto ecológico y reforestación'),
(3, 'Corazón Solidario', '#E91E63', 'heart-handshake', 'Completaste más de 15 horas de servicio comunitario activo'),
(4, 'Líder de Impacto', '#FF9800', 'star-medal', 'Reconocimiento por asistencia impecable y liderazgo en actividades de campo'),
(5, 'Héroe de los Animales', '#3F51B5', 'paw-print', 'Participaste en jornadas de rescate, cuidado y adopción responsable de animales');

-- =============================================================================
-- 13. VOLUNTEER_ACHIEVEMENTS
-- Entidad: VolunteerAchievement | Tabla: volunteer_achievements (Clave compuesta: volunteer_id, achievement_id)
-- =============================================================================
INSERT INTO volunteer_achievements (volunteer_id, achievement_id, obtained_at) VALUES
(1, 1, '2026-02-01 10:00:00'),
(1, 2, '2026-03-01 15:30:00'),
(2, 1, '2026-01-20 12:00:00'),
(2, 5, '2026-02-15 16:45:00'),
(2, 3, '2026-03-05 11:15:00'),
(3, 1, '2026-02-10 09:30:00'),
(4, 1, '2026-01-28 14:00:00'),
(4, 2, '2026-02-25 17:00:00'),
(5, 1, '2026-01-15 08:30:00'),
(5, 3, '2026-02-18 13:00:00'),
(5, 4, '2026-03-10 18:00:00'),
(6, 1, '2026-03-02 11:00:00');

-- =============================================================================
-- 14. CAUSES
-- Entidad: Cause | Tabla: causes
-- FKs: organizer_id -> organizers.id, category_id -> categories.id
-- =============================================================================
INSERT INTO causes (
  id, organizer_id, category_id, title, cover_image_url, description, capacity,
  created_at, start_date, end_date, address, is_available,
  location_latitude, location_longitude, progress, qr_code
) VALUES
(
  1, 1, 1, 'Gran Sembratón Bosque Andino', 'https://images.kindly.org/causes/sembraton.jpg',
  'Jornada masiva de siembra comunitaria de 1.000 árboles nativos para restaurar la cuenca alta.',
  50, '2026-02-01 08:00:00', '2026-04-15 08:00:00', '2026-04-15 14:00:00',
  'Parque Ecológico San Jerónimo, Km 14', true, '6.2442', '-75.5812', 'in_progress', 'QR-CAUSE-001-SEMBRATON'
),
(
  2, 2, 5, 'Empaque y Reparto de Mercados Comunitarios', 'https://images.kindly.org/causes/alimentos.jpg',
  'Clasificación y distribución de 300 kits de alimentos nutritivos para comedores infantiles.',
  30, '2026-02-05 09:00:00', '2026-04-20 07:30:00', '2026-04-20 13:30:00',
  'Centro de Acopio Central, Cra 45 # 28-10', true, '6.2518', '-75.5636', 'open', 'QR-CAUSE-002-ALIMENTOS'
),
(
  3, 3, 3, 'Jornada de Baño y Rescate en Refugio', 'https://images.kindly.org/causes/adopcion.jpg',
  'Cuidado, higiene, paseo y preparación para adopción de más de 40 animales rescatados.',
  25, '2026-02-10 10:00:00', '2026-04-25 09:00:00', '2026-04-25 15:00:00',
  'Refugio Esperanza Animal, Vereda El Rosal', true, '6.2982', '-75.5410', 'open', 'QR-CAUSE-003-REFUGIO'
),
(
  4, 1, 2, 'Taller de Huerta Escolar y Reciclaje', 'https://images.kindly.org/causes/huerta.jpg',
  'Capacitación pedagógica a 60 niños de primaria en agricultura urbana y elaboración de compost.',
  20, '2026-02-15 11:00:00', '2026-05-02 08:30:00', '2026-05-02 12:30:00',
  'Institución Educativa Miraflores, Calle 50 # 12-40', true, '6.2301', '-75.5705', 'open', 'QR-CAUSE-004-HUERTA'
),
(
  5, 2, 4, 'Brigada de Salud y Acompañamiento Adulto Mayor', 'https://images.kindly.org/causes/salud.jpg',
  'Toma de signos vitales, actividades de estimulación cognitiva y compañía para adultos mayores.',
  35, '2026-02-20 08:30:00', '2026-05-10 08:00:00', '2026-05-10 13:00:00',
  'Hogar San José, Cra 70 # 32-15', true, '6.2410', '-75.5920', 'open', 'QR-CAUSE-005-BRIGADA'
);

-- =============================================================================
-- 15. SUPPLIES
-- Entidad: Supply | Tabla: supplies
-- FK: cause_id -> causes.id
-- =============================================================================
INSERT INTO supplies (id, cause_id, item_name, needed, quantity_needed, image) VALUES
(1, 1, 'Guantes de jardinería reforzados', true, 50, 'https://images.kindly.org/supplies/guantes.jpg'),
(2, 1, 'Palas pequeñas y azadones de mano', true, 30, 'https://images.kindly.org/supplies/palas.jpg'),
(3, 2, 'Cajas de cartón reforzado para alimentos', true, 100, 'https://images.kindly.org/supplies/cajas.jpg'),
(4, 2, 'Cinta de embalaje industrial', false, 15, 'https://images.kindly.org/supplies/cinta.jpg'),
(5, 3, 'Champú medicado para caninos', true, 20, 'https://images.kindly.org/supplies/shampoo.jpg'),
(6, 3, 'Toallas de baño y cobijas limpias', true, 40, 'https://images.kindly.org/supplies/toallas.jpg'),
(7, 4, 'Sobres de semillas de hortalizas variadas', true, 50, 'https://images.kindly.org/supplies/semillas.jpg'),
(8, 5, 'Tensiómetros digitales y botiquines básicos', false, 8, 'https://images.kindly.org/supplies/tensiometro.jpg');

-- =============================================================================
-- 16. SUBMISSION
-- Entidad: Submission | Tabla: submission (Singular)
-- FKs: volunteer_id -> volunteers.id, cause_id -> causes.id
-- =============================================================================
INSERT INTO submission (id, volunteer_id, cause_id, status, created_at, justification) VALUES
(1, 1, 1, 'approved', '2026-02-15 10:00:00', 'Cuento con experiencia previa en reforestación y disponibilidad completa.'),
(2, 4, 1, 'approved', '2026-02-16 11:30:00', 'Ingeniero ambiental motivado en apoyar la dirección técnica de siembra.'),
(3, 2, 3, 'approved', '2026-02-20 14:15:00', 'Estudiante de veterinaria con conocimiento en manejo canino y primeros auxilios.'),
(4, 3, 4, 'approved', '2026-02-22 09:00:00', 'Experiencia como educadora en dinámicas infantiles y reciclaje lúdico.'),
(5, 5, 5, 'approved', '2026-02-25 16:00:00', 'Enfermera profesional dispuesta a coordinar la toma de signos y triage.'),
(6, 6, 2, 'pending', '2026-03-01 12:45:00', 'Deseo apoyar en la logística de carga y despacho de los mercados.'),
(7, 3, 2, 'pending', '2026-03-02 08:30:00', 'Disponibilidad para ayudar en clasificación y etiquetado de alimentos.'),
(8, 1, 4, 'rejected', '2026-03-03 15:20:00', 'El cupo de voluntarios para el área pedagógica se completó previamente.');

-- =============================================================================
-- 17. ATTENDANCE
-- Entidad: Attendance | Tabla: attendance (Singular, Clave compuesta: cause_id, volunteer_id)
-- FKs: cause_id -> causes.id, volunteer_id -> volunteers.id
-- =============================================================================
INSERT INTO attendance (cause_id, volunteer_id, checked_in_at) VALUES
(1, 1, '2026-04-15 08:05:00'),
(1, 4, '2026-04-15 08:12:00'),
(3, 2, '2026-04-25 08:58:00'),
(4, 3, '2026-05-02 08:25:00'),
(5, 5, '2026-05-10 07:55:00');

-- =============================================================================
-- 18. ANNOUNCEMENTS
-- Entidad: Announcement | Tabla: announcements
-- FK: cause_id -> causes.id
-- =============================================================================
INSERT INTO announcements (id, cause_id, title, text, likes, created_at) VALUES
(1, 1, 'Punto de encuentro y recomendaciones Sembratón', 'Recuerden llevar ropa cómoda, botas pantaneras, hidratación personal y bloqueador solar. ¡Nos encontramos en el km 14!', 24, '2026-04-10 09:00:00'),
(2, 1, '¡Superamos la meta de árboles sembrados!', 'Gracias a la energía de los 50 voluntarios logramos plantar 1.150 árboles nativos. ¡Gran huella ecológica!', 58, '2026-04-16 18:30:00'),
(3, 2, 'Convocatoria abierta para empaque de mercados', 'Buscamos 15 personas adicionales con buena energía para empacar los kits de alimentos este fin de semana.', 17, '2026-04-12 11:00:00'),
(4, 3, 'Jornada de adopción programada tras el baño', 'Luego de la jornada de aseo, tendremos pasarela de adopción responsable para 12 perritos listos para un hogar.', 42, '2026-04-18 14:00:00'),
(5, 5, 'Insumos médicos completos para la brigada', 'Confirmamos que ya contamos con todos los tensiómetros y medicamentos básicos gracias a las donaciones.', 31, '2026-04-28 16:45:00');

-- =============================================================================
-- 19. REACTIONS
-- Entidad: Reaction | Tabla: reactions
-- =============================================================================
INSERT INTO reactions (id, name, icon) VALUES
(1, 'Me inspira', 'sparkles'),
(2, 'Me encanta', 'heart'),
(3, 'Apoyo solidario', 'hands-clapping'),
(4, 'Unidos', 'smile');

-- =============================================================================
-- 20. ANNOUNCEMENT_REACTIONS
-- Entidad: AnnouncementReaction | Tabla: "announcementReactions" (CamelCase, Clave compuesta: reaction_id, announcement_id, user_id)
-- FKs: reaction_id -> reactions.id, announcement_id -> announcements.id, user_id -> users.id
-- =============================================================================
INSERT INTO "announcementReactions" (reaction_id, announcement_id, user_id, created_at) VALUES
(2, 1, 5, '2026-04-10 10:15:00'),
(1, 1, 6, '2026-04-10 11:20:00'),
(3, 2, 5, '2026-04-16 19:00:00'),
(2, 2, 8, '2026-04-16 19:30:00'),
(1, 2, 7, '2026-04-16 20:05:00'),
(3, 3, 9, '2026-04-12 14:00:00'),
(2, 4, 6, '2026-04-18 15:10:00'),
(4, 4, 10, '2026-04-18 16:00:00'),
(3, 5, 9, '2026-04-28 17:30:00');

-- =============================================================================
-- 21. IMAGES
-- Entidad: Image | Tabla: images
-- FKs (ambas nullable): cause_id -> causes.id, announcement_id -> announcements.id
-- =============================================================================
INSERT INTO images (id, cause_id, announcement_id, image_url) VALUES
(1, 1, NULL, 'https://images.kindly.org/causes/galeria_sembraton_1.jpg'),
(2, 1, NULL, 'https://images.kindly.org/causes/galeria_sembraton_2.jpg'),
(3, NULL, 1, 'https://images.kindly.org/announcements/mapa_punto_encuentro.png'),
(4, NULL, 2, 'https://images.kindly.org/announcements/foto_grupal_voluntarios.jpg'),
(5, 2, NULL, 'https://images.kindly.org/causes/galeria_mercados_1.jpg'),
(6, 3, NULL, 'https://images.kindly.org/causes/galeria_perros_refugio.jpg'),
(7, NULL, 4, 'https://images.kindly.org/announcements/perritos_en_adopcion.jpg'),
(8, 5, NULL, 'https://images.kindly.org/causes/galeria_brigada_salud.jpg');

-- =============================================================================
-- SINCRONIZACIÓN DE SECUENCIAS POSTGRESQL
-- Sincroniza los contadores autoincrementables (SERIAL / IDENTITY) con los IDs explícitos insertados.
-- =============================================================================
SELECT setval(pg_get_serial_sequence('role', 'id'), COALESCE((SELECT MAX(id) FROM role), 1));
SELECT setval(pg_get_serial_sequence('permissions', 'id'), COALESCE((SELECT MAX(id) FROM permissions), 1));
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('skills', 'id'), COALESCE((SELECT MAX(id) FROM skills), 1));
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval(pg_get_serial_sequence('organization_types', 'id'), COALESCE((SELECT MAX(id) FROM organization_types), 1));
SELECT setval(pg_get_serial_sequence('organizers', 'id'), COALESCE((SELECT MAX(id) FROM organizers), 1));
SELECT setval(pg_get_serial_sequence('volunteers', 'id'), COALESCE((SELECT MAX(id) FROM volunteers), 1));
SELECT setval(pg_get_serial_sequence('achievements', 'id'), COALESCE((SELECT MAX(id) FROM achievements), 1));
SELECT setval(pg_get_serial_sequence('causes', 'id'), COALESCE((SELECT MAX(id) FROM causes), 1));
SELECT setval(pg_get_serial_sequence('supplies', 'id'), COALESCE((SELECT MAX(id) FROM supplies), 1));
SELECT setval(pg_get_serial_sequence('submission', 'id'), COALESCE((SELECT MAX(id) FROM submission), 1));
SELECT setval(pg_get_serial_sequence('announcements', 'id'), COALESCE((SELECT MAX(id) FROM announcements), 1));
SELECT setval(pg_get_serial_sequence('reactions', 'id'), COALESCE((SELECT MAX(id) FROM reactions), 1));
SELECT setval(pg_get_serial_sequence('images', 'id'), COALESCE((SELECT MAX(id) FROM images), 1));

COMMIT;

