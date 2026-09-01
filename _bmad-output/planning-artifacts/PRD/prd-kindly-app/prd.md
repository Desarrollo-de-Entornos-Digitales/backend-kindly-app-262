---
title: 'Product Requirements Document: kindly-app'
status: final
created: 2026-08-28
updated: 2026-08-31
---

# Product Requirements Document (PRD) - kindly-app

## 1. Overview & Vision
**Kindly-app** is a centralized full-stack volunteering connection platform developed for Web and Mobile (NestJS REST API backend, relational persistence, and responsive frontend). It replaces informal, chaotic social media listings with structured matching (swipe deck, geolocated map, category/interest filtering), operational cause logistics (quota limits, required in-cause supplies, announcements, QR-based check-in attendance), volunteer achievements, and platform-wide administrative governance based on roles and permissions.

---

## 2. User Roles & Actors
- **VOLUNTEER (Voluntario):** Individual seeking vetted community/social/environmental initiatives, applying to causes, registering attendance via QR, managing their volunteer profile, and viewing earned achievements.
- **ORGANIZER (Organización / ONG / Refugio):** Verified group or entity creating and managing causes, specifying required supplies, screening applicants, broadcasting announcements, tracking cause progress and capacity, and generating event QR codes.
- **ADMIN (Administrador del Sistema):** Superuser managing platform users (enable/disable), assigning roles and permissions, reviewing/approving organization verification documents, and managing platform-wide governance.

---

## 3. Epics & User Stories (with Acceptance Criteria)

### Epic 1: Identity, Roles & User Governance

#### US-1.1: Registration and Authentication
- **As a** new user (Volunteer or Organization representative),
- **I want to** register and authenticate securely using my email and password,
- **So that** I have a personalized and protected account within Kindly.
- **Acceptance Criteria:**
  1. The system supports registration with email, password (hashed via bcrypt), full name, contact information, unique username, and initial role selection (VOLUNTEER or ORGANIZER).
  2. Username and email must be unique within the platform.
  3. Authenticated requests return standard JWT access tokens.
  4. Form inputs validate email format, username availability, and password strength.
  5. Each registered user has an account status indicating whether the account is active or disabled.
  6. The system records the account creation date.

#### US-1.2: Volunteer Profile & Field Readiness
- **As a** Volunteer,
- **I want to** configure my personal profile with my skills, interests, personal information, and emergency information,
- **So that** organizations know my qualifications and have essential field logistics/safety information.
- **Acceptance Criteria:**
  1. Volunteer can maintain a personal description within their profile.
  2. Volunteer can select multiple interest categories (e.g., Environment, Animal Rescue, Education) and skill tags (e.g., First Aid, Logistics, Photography).
  3. Profile includes optional operational fields: Shirt Size (XS, S, M, L, XL), Height, Emergency Health Center, Blood Type, and Emergency Contact details.
  4. Shirt Size and Blood Type use predefined values.
  5. Volunteer can view their completed causes count and active applications.

#### US-1.3: Volunteer Achievements
- **As a** Volunteer,
- **I want to** view achievements obtained through my volunteering participation,
- **So that** I can track milestones and recognition earned within the platform.
- **Acceptance Criteria:**
  1. The system maintains a catalog of available achievements.
  2. Each achievement includes a name, description, color, and icon.
  3. Achievements can be associated with volunteers when they are obtained.
  4. The system records the date on which each achievement was obtained.
  5. Volunteer can view their earned achievements from their profile.

#### US-1.4: Organization Profile & Legal Verification Request
- **As an** Organization,
- **I want to** set up our organization profile and submit verification documentation (e.g., RUT or legal certificate),
- **So that** we can earn a verified trust badge on the platform.
- **Acceptance Criteria:**
  1. Organization profile includes organization name, description/mission, contact information associated with the user account, and website.
  2. The organization profile identifies whether the account represents an organization.
  3. Organization can upload a verification file.
  4. Organization verification status displays as UNVERIFIED, PENDING_REVIEW, VERIFIED, or REJECTED.
  5. Verified organizations can be identified through their verification status within the platform.

#### US-1.5: Administrative User Management, Roles & Permissions
- **As an** Administrator,
- **I want to** list users, enable/disable accounts, manage roles and permissions, and review organization verification submissions,
- **So that** the platform remains safe, compliant, and trustworthy.
- **Acceptance Criteria:**
  1. Admin dashboard provides a list of all registered users with their account status.
  2. Admin can enable or disable user accounts.
  3. Admin can inspect uploaded verification documents for organizations and update their verification status to VERIFIED or REJECTED.
  4. Admin can assign or change ADMIN, ORGANIZER, or VOLUNTEER roles.
  5. The system maintains roles with a name and description.
  6. The system maintains permissions with a name and description.
  7. Permissions can be associated with roles through role-permission relationships.
  8. Protected functionality is controlled according to the user's assigned role and associated permissions.

---

### Epic 2: Cause Management & In-Cause Logistics

#### US-2.1: Cause Creation and Publishing
- **As an** Organizer,
- **I want to** create and publish a new volunteering cause with dates, location, capacity quota, category, images, and required supply items,
- **So that** interested volunteers can discover and understand the event requirements.
- **Acceptance Criteria:**
  1. Creation form captures: Title, Description, Category, Start Date/Time, End Date/Time, Physical Address, Geolocation coordinates (latitude/longitude), and Maximum Capacity quota (e.g., 10 volunteers).
  2. Organizer can define a list of required supplies/tools (e.g., Item Name: 'Shovels', Quantity Needed: 5).
  3. Each supply can indicate whether it is needed and can include an image.
  4. Organizer can add a cover image and additional images to the cause.
  5. The system records the cause creation date.
  6. Organizer can control whether the cause is available to volunteers.
  7. Published and available causes can be displayed through the discovery interfaces.

#### US-2.2: Cause Administration & Quota Balance
- **As an** Organizer,
- **I want to** view my active causes, edit information, monitor filled vs. available quota, manage progress, and close causes,
- **So that** I have full operational control over our events.
- **Acceptance Criteria:**
  1. Dashboard displays the cause capacity and the number of accepted volunteers.
  2. Organizer can update cause details.
  3. Organizer can change the availability of a cause when it should no longer receive volunteers.
  4. The system prevents over-acceptance when the quota limit is reached.
  5. Each cause maintains a progress status representing its current lifecycle.
  6. Cause progress uses the predefined progress values supported by the system.
  7. Organizer can manage required supplies associated with the cause.
  8. Organizer can manage the cause cover image and additional images.

#### US-2.3: Cause Announcements (Broadcast Channel)
- **As an** Organizer,
- **I want to** post announcement updates within a cause’s forum,
- **So that** accepted volunteers receive critical logistical news and instructions.
- **Acceptance Criteria:**
  1. Organizer can publish text announcements tied specifically to the cause.
  2. Each announcement includes a title, text, and creation timestamp.
  3. Announcements can have associated images.
  4. The system stores the number of likes associated with each announcement.
  5. Only accepted volunteers of that cause can view the announcement feed in their cause community tab.

---

### Epic 3: Discovery & Intelligent Matching

#### US-3.1: Swipe Match Discovery (Card Deck)
- **As a** Volunteer,
- **I want to** browse causes through a Tinder-style swipeable card interface,
- **So that** I can rapidly discover and express interest in causes that catch my attention.
- **Acceptance Criteria:**
  1. Cards display cause title, cover image, organization name, category, date, and location snippet.
  2. Swiping right / clicking 'Match' initiates a direct application flow.
  3. Swiping left / clicking 'Dismiss' skips the card and advances to the next cause.
  4. Only available causes can be presented as active opportunities.

#### US-3.2: Interactive Geolocation Map Search
- **As a** Volunteer,
- **I want to** view nearby volunteering opportunities on an interactive map,
- **So that** I can easily find initiatives close to my current physical location.
- **Acceptance Criteria:**
  1. Map displays interactive pins corresponding to active causes with valid latitude and longitude coordinates.
  2. Clicking a map pin opens a summary preview card with an option to open full details.
  3. Map allows zooming and navigation across the search area.
  4. Each map pin represents the physical location stored for the corresponding cause.

#### US-3.3: Multi-Criteria Filtered Search & 'For You' Feed
- **As a** Volunteer,
- **I want to** filter causes by keywords and category, as well as view a 'For You' prioritized feed,
- **So that** I can find specific opportunities aligned with my interests.
- **Acceptance Criteria:**
  1. Search bar supports text query over cause title and description.
  2. Filters allow selecting categories (e.g., Environment, Animals).
  3. Available filters correspond to categories maintained by the platform.
  4. 'For You' section displays upcoming available initiatives matching the volunteer’s selected profile interests.
  5. Cause results display only opportunities currently available for participation.

---

### Epic 4: Application Pipeline & QR Attendance Check-in

#### US-4.1: Application Submission
- **As a** Volunteer,
- **I want to** apply to a cause,
- **So that** the organization knows I want to participate and can review my application.
- **Acceptance Criteria:**
  1. Upon applying (via match or cause detail), an application is created and associated with the volunteer and cause.
  2. Application is created in PENDING state and appears in the organizer’s applicant queue.
  3. The system records the date and time when the application was created.
  4. Volunteer can provide a justification explaining their interest in participating in the cause.
  5. Volunteer can view the status of submitted applications.

#### US-4.2: Applicant Screening & Decisioning
- **As an** Organizer,
- **I want to** review pending applicant profiles and accept or reject them,
- **So that** I can assemble the most suitable and prepared team of volunteers.
- **Acceptance Criteria:**
  1. Organizer can view applicant profile summary including description, skills, interests, health center, clothing size, height, blood type, emergency contact, completed causes, and application justification.
  2. Organizer can click 'Accept' (transitions state to ACCEPTED and increments accepted count) or 'Reject' (transitions state to REJECTED).
  3. Accepted volunteers count toward the cause capacity.
  4. The system prevents further applicant acceptance once the cause reaches its full quota.
  5. Application status remains associated with both the volunteer and the corresponding cause.

#### US-4.3: QR Code Attendance Check-in
- **As an** Organizer and an accepted Volunteer,
- **We want to** generate and scan an on-site event QR code,
- **So that** volunteer physical attendance is verified securely and instantly.
- **Acceptance Criteria:**
  1. Organizer dashboard provides a unique QR code for the cause.
  2. Volunteer uses the in-app camera QR scanner to scan the organizer’s QR code.
  3. The backend endpoint validates that the volunteer holds ACCEPTED status for that cause and creates an Attendance record with the volunteer, cause, and check-in timestamp.
  4. The volunteer’s profile increments their 'Completed Causes' counter upon verified check-in.
  5. The system prevents duplicate attendance check-ins for the same user and cause.

---

## 4. Non-Functional Requirements (NFRs)

- **NFR-01 (Security & Auth):** Passwords securely hashed with bcrypt (salt rounds >= 10). Stateless JWT authentication with role and permission authorization guards on NestJS endpoints (VOLUNTEER, ORGANIZER, ADMIN).

- **NFR-02 (Roles & Authorization):** Access to platform functionality must respect the relationship between USERS, ROLE, ROLE_PERMISSIONS, and PERMISSIONS, ensuring that users can only perform actions permitted by their assigned role and associated permissions.

- **NFR-03 (Responsiveness & Mobile Usability):** Responsive mobile-first UI optimized for touch gestures (swipe cards) and HTML5 camera API access for QR scanning across mobile web browsers.

- **NFR-04 (Performance & Concurrency):** Database transactions used for quota decrement and acceptance to eliminate race conditions. The system prevents volunteer acceptance when a cause reaches its configured capacity.

- **NFR-05 (Data Integrity):** Relational foreign key and cascade constraints enforce valid relationships between users, volunteers, organizers, causes, applications, attendance, categories, skills, achievements, supplies, announcements, images, roles, and permissions.

- **NFR-06 (Application State Integrity):** Application state transitions must follow a valid workflow (PENDING -> ACCEPTED/REJECTED). Attendance is stored separately through an Attendance record after a volunteer with an ACCEPTED application successfully completes QR check-in.

- **NFR-07 (Relational Consistency):** Many-to-many relationships such as volunteer skills, volunteer categories, volunteer achievements, and role permissions must maintain valid references to their corresponding entities.

---

## 5. Success Metrics
- **Match-to-Application Conversion:** > 30% of swipe interactions convert to submitted applications.
- **Attendance Verification Rate:** > 80% of accepted volunteers verified on-site via QR scan.
- **Organizer Turnaround Time:** Applications reviewed within < 48 hours.
- **Platform Integrity:** 100% of active organization accounts reviewed by system administrators.
- **Volunteer Participation:** Number of completed causes registered for volunteers through verified attendance.
- **Volunteer Achievement Engagement:** Number of achievements obtained by volunteers as they participate in causes.