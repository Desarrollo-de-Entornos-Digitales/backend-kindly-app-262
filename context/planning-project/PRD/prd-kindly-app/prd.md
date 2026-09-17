---
title: "Product Requirements Document: kindly-app"
status: final
created: 2026-08-28
updated: 2026-08-28
---

# Product Requirements Document (PRD) - kindly-app

## 1. Overview & Vision

**Kindly-app** is a centralized full-stack volunteering connection platform developed for Web and Mobile (NestJS REST API backend, relational persistence, and responsive frontend). It replaces informal, chaotic social media listings with structured matching (swipe deck, geolocated map, skill/interest filtering), operational cause logistics (quota limits, required in-cause supplies, QR-based check-in attendance), and platform-wide administrative governance.

---

## 2. User Roles & Actors

- **VOLUNTEER (Voluntario):** Individual seeking vetted community/social/environmental initiatives, applying to causes, registering attendance via QR, and indicating supply contributions.
- **ORGANIZER (Organización / ONG / Refugio):** Verified group or entity creating causes, specifying requirements/supplies, screening applicants, broadcasting announcements, and generating event QR codes.
- **ADMIN (Administrador del Sistema):** Superuser managing platform users (enable/disable), assigning roles/permissions, reviewing/approving organization verification documents, and moderating system-wide causes.

---

## 3. Epics & User Stories (with Acceptance Criteria)

### Epic 1: Identity, Roles & User Governance

#### US-1.1: Registration and Authentication

- **As a** new user (Volunteer or Organization representative),
- **I want to** register and authenticate securely using my email and password,
- **So that** I have a personalized and protected account within Kindly.
- **Acceptance Criteria:**
  1. The system supports registration with email, password (hashed via bcrypt), full name, and initial role selection (VOLUNTEER or ORGANIZER).
  2. Authenticated requests return standard JWT access tokens.
  3. Form inputs validate email format and password strength.

#### US-1.2: Volunteer Profile & Field Readiness

- **As a** Volunteer,
- **I want to** configure my personal profile with my skills, interests, location, apparel size, and emergency health center,
- **So that** organizations know my qualifications and have essential field logistics/safety information.
- **Acceptance Criteria:**
  1. Volunteer can select multiple interest tags (e.g., Environment, Animal Rescue, Education) and skill tags (e.g., First Aid, Logistics, Photography).
  2. Profile includes optional operational fields: Shirt Size (XS, S, M, L, XL), Emergency Health Center name, and Emergency Contact details.
  3. Volunteer can view their completed causes count and active applications.

#### US-1.3: Organization Profile & Legal Verification Request

- **As an** Organization,
- **I want to** set up our organization profile and submit verification documentation (e.g., RUT or legal certificate),
- **So that** we can earn a verified trust badge on the platform.
- **Acceptance Criteria:**
  1. Organization profile includes organization name, description/mission, contact email, phone, location, and website/social links.
  2. Organization can upload verification files (PDF/PNG/JPG).
  3. Organization verification status displays as UNVERIFIED, PENDING_REVIEW, VERIFIED, or REJECTED.

#### US-1.4: Administrative User Management & Verification Review

- **As an** Administrator,
- **I want to** list users, enable/disable accounts, change roles, and review organization verification submissions,
- **So that** the platform remains safe, compliant, and trustworthy.
- **Acceptance Criteria:**
  1. Admin dashboard provides a paginated/searchable list of all registered users with status toggles (ACTIVE / DISABLED).
  2. Admin can inspect uploaded verification documents for organizations and toggle verification status to VERIFIED (with badge) or REJECTED (with feedback reason).
  3. Admin can grant or revoke ADMIN, ORGANIZER, or VOLUNTEER roles.

---

### Epic 2: Cause Management & In-Cause Logistics

#### US-2.1: Cause Creation and Publishing

- **As an** Organizer,
- **I want to** create and publish a new volunteering cause with dates, location, capacity quota, required skills, and required supply items,
- **So that** interested volunteers can discover and understand the event requirements.
- **Acceptance Criteria:**
  1. Creation form captures: Title, Description, Category, Start Date/Time, End Date/Time, Physical Address, Geolocation coordinates (latitude/longitude), and Maximum Capacity quota (e.g., 10 volunteers).
  2. Organizer can define a list of required supplies/tools (e.g., Item Name: 'Shovels', Quantity Needed: 5).
  3. Published cause is immediately queryable by the matching engine and map.

#### US-2.2: Cause Administration & Quota Balance

- **As an** Organizer,
- **I want to** view my active causes, edit information, monitor filled vs. available quota, and delete/close causes,
- **So that** I have full operational control over our events.
- **Acceptance Criteria:**
  1. Dashboard displays real-time quota status (e.g., '8/10 spots filled').
  2. Organizer can update details or manually close a cause when full or completed.
  3. The system prevents over-acceptance when quota limit is reached.

#### US-2.3: Cause Announcements (Broadcast Channel)

- **As an** Organizer,
- **I want to** post announcement updates within a cause’s forum,
- **So that** accepted volunteers receive critical logistical news and instructions.
- **Acceptance Criteria:**
  1. Organizer can publish text announcements tied specifically to the cause.
  2. Only accepted volunteers of that cause can view the announcement feed in their cause community tab.

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

#### US-3.2: Interactive Geolocation Map Search

- **As a** Volunteer,
- **I want to** view nearby volunteering opportunities on an interactive map,
- **So that** I can easily find initiatives close to my current physical location.
- **Acceptance Criteria:**
  1. Map displays interactive pins corresponding to active causes with valid coordinates.
  2. Clicking a map pin opens a summary preview card with an option to open full details.
  3. Map allows zooming and centering based on the user’s location or search area.

#### US-3.3: Multi-Criteria Filtered Search & 'For You' Feed

- **As a** Volunteer,
- **I want to** filter causes by keywords, category, and required skills, as well as view a 'For You' prioritized feed,
- **So that** I can find specific opportunities aligned with my exact schedule and skills.
- **Acceptance Criteria:**
  1. Search bar supports text query over cause title and description.
  2. Filters allow selecting categories (e.g., Environment, Animals) and skill tags.
  3. 'For You' section displays upcoming initiatives matching the volunteer’s selected profile interests.

---

### Epic 4: Application Pipeline & QR Attendance Check-in

#### US-4.1: Application Submission with Supply Contribution

- **As a** Volunteer,
- **I want to** apply to a cause and indicate which required supply items (if any) I can bring,
- **So that** the organization knows I want to participate and what materials I can contribute.
- **Acceptance Criteria:**
  1. Upon applying (via match or cause detail), the volunteer can check items from the cause’s supply wishlist they pledge to bring (e.g., '[x] Bringing 1 Shovel').
  2. Application is created in PENDING state and appears in the organizer’s applicant queue.
  3. Volunteer can withdraw/cancel a PENDING application at any time.

#### US-4.2: Applicant Screening & Decisioning

- **As an** Organizer,
- **I want to** review pending applicant profiles (including skills, medical center, clothing size, and pledged supplies) and accept or reject them,
- **So that** I can assemble the most suitable and prepared team of volunteers.
- **Acceptance Criteria:**
  1. Organizer can view applicant profile summary and pledged supplies.
  2. Organizer can click 'Accept' (transitions state to ACCEPTED and increments accepted count) or 'Reject' (transitions state to REJECTED).
  3. If the cause reaches full quota, remaining pending applications are notified or blocked from further acceptance.

#### US-4.3: QR Code Attendance Check-in

- **As an** Organizer and an accepted Volunteer,
- **We want to** generate and scan an on-site event QR code,
- **So that** volunteer physical attendance is verified securely and instantly.
- **Acceptance Criteria:**
  1. Organizer dashboard provides a unique dynamic QR code for the cause on the event day.
  2. Volunteer uses the in-app camera QR scanner to scan the organizer’s QR code.
  3. The backend endpoint validates that the volunteer holds ACCEPTED status for that cause and creates an Attendance record with ttended: true and timestamp.
  4. The volunteer’s profile increments their 'Completed Causes' counter upon verified check-in.
  5. The system prevents duplicate attendance check-ins for the same user and cause.

---

## 4. Non-Functional Requirements (NFRs)

- **NFR-01 (Security & Auth):** Passwords securely hashed with bcrypt (salt rounds >= 10). Stateless JWT authentication with role authorization guards on NestJS endpoints (VOLUNTEER, ORGANIZER, ADMIN).
- **NFR-02 (Responsiveness & Mobile Usability):** Responsive mobile-first UI optimized for touch gestures (swipe cards) and HTML5 camera API access for QR scanning across mobile web browsers.
- **NFR-03 (Performance & Concurrency):** Database transactions used for quota decrement and acceptance to eliminate race conditions. API endpoints response time < 200ms under standard test load.
- **NFR-04 (Data Integrity):** Relational cascade and foreign key constraints enforcing clean state transitions (PENDING -> ACCEPTED/REJECTED -> ATTENDED).

---

## 5. Success Metrics

- **Match-to-Application Conversion:** > 30% of swipe interactions convert to submitted applications.
- **Attendance Verification Rate:** > 80% of accepted volunteers verified on-site via QR scan.
- **Organizer Turnaround Time:** Applications reviewed within < 48 hours.
- **Platform Integrity:** 100% of active organization accounts reviewed by system administrators.
