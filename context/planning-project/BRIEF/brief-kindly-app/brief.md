---
title: " Product Brief: kindly-app\
status: final
created: 2026-08-28
updated: 2026-08-28
---

# Product Brief: kindly-app

## 1. Executive Summary & Vision
**Kindly-app** is a centralized full-stack web/mobile application (NestJS backend, relational database, and responsive mobile-first frontend) created to bridge the structural disconnect between motivated volunteers and local social, environmental, animal-welfare, and community organizations.

By replacing informal and ephemeral social media posts with an **intelligent matching engine** (interactive swipe cards, geolocation map discovery, interest/skill filtering, and schedule matching), Kindly streamlines cause discovery for volunteers, provides organizations with an operational tool for recruitment, resource/supply coordination, and QR attendance validation, and equips platform administrators with governance and user management controls.

## 2. Problem Statement
- **Information Fragmentation & Informal Channels:** Volunteer calls are scattered across social media networks, leading to outdated listings, lack of verification, and high friction for users trying to join.
- **Expectation, Skills & Material Mismatch:** Volunteers struggle to find causes that fit their geographic proximity, availability, and specific skills, while organizations struggle to communicate specific on-site material/tool requirements.
- **Operational Overhead for Organizations:** Shelters, grassroots groups, and non-profits lack structured systems to publish requirements, manage applicant pipelines, store volunteer field records, and track real event participation.
- **Governance & Trust Gap:** Without centralized administrative oversight, it is difficult to verify legal organizations, moderate content, and manage bad actors.

## 3. Target Audience & Core Roles
1. **The Volunteer (Individual Contributor):**
 - *Goal:* Discover trusted local initiatives aligned with personal causes, submit one-click applications, and track their participation history.
 - *Key Needs:* Gamified discovery (swipe matching, map filters), transparent application status, completed causes history, willingness to bring required supplies (e.g. tools/materials), and emergency/field readiness (clothing size, emergency health center).
2. **The Organization (NGOs, Shelters, Community Collectives):**
 - *Goal:* Increase recruitment visibility, screen candidates efficiently, and coordinate field logistics & required supplies.
 - *Key Needs:* Intuitive cause creation (including required material items/tools), applicant vetting with access to complete profiles, live capacity control (quotas), on-site QR attendance verification, and organizational verification requests.
3. **The Administrator (Platform Governance & Superuser):**
 - *Goal:* Maintain platform security, integrity, and trust across all actors.
 - *Key Needs:* Centralized user directory, ability to enable/disable user accounts, assign roles and permissions, review/approve organization verification documents, and audit platform-wide causes.

## 4. Key Differentiators & Value Proposition
- **Multi-Modal Discovery:** Combines a fast, Tinder-style swipe deck for instant matchmaking with an interactive map and multi-faceted search (cause category, required skills, proximity).
- **End-to-End Operational Lifecycle:** Complete state machine from discovery $\rightarrow$ application $\rightarrow$ organizer screening $\rightarrow$ acceptance $\rightarrow$ community announcement channel $\rightarrow$ on-site QR attendance check-in.
- **In-Cause Supply & Resource Coordination:** Organizations specify item/material needs directly within the cause; volunteers can indicate items they can contribute during application, avoiding chaotic separate marketplaces.
- **Simplified Attendance & Participation Tracking:** Lean binary attendance verification via QR code scan (attended vs. not attended), updating the volunteer’s completed causes count without complex hour logging.
- **Field Readiness & Operational Persistence:** Captures emergency health centers and apparel sizes for field logistics.
- **Comprehensive RBAC & Governance:** Dedicated administrative tier ensuring verified organizations and active account management.

## 5. System Architecture & High-Level Feature Scope (MVP)

### Technical Foundation
- **Frontend:** Responsive Mobile-First Web Application (optimized for touch swipe interactions and camera access for QR scanning).
- **Backend:** Modular NestJS REST API with Role-Based Access Control (VOLUNTEER, ORGANIZER, ADMIN) and file upload support.
- **Database:** Relational persistence (PostgreSQL / SQLite via ORM) capturing entities: Users, Roles/Permissions, Profiles, Organizations, Causes, CauseSupplies, Applications, Attendances, and Announcements.

### Functional Scope Matrix

| Functional Pillar | Volunteer Experience | Organizer Experience | Administrator Experience |
| :--- | :--- | :--- | :--- |
| **Discovery & Matching** | • Swipe card deck (Match / Dismiss)<br>• Geolocation Map with pins<br>• Filtered search (category, skills) | • Cause creation wizard (dates, requirements, quota, needed supplies)<br>• Public cause view | • Global cause moderation and visibility oversight |
| **Application Pipeline** | • 1-tap application via match<br>• Supply check: option to indicate items brought<br>• Real-time status tracking (PENDING, ACCEPTED, REJECTED)<br>• Withdrawal / Cancellation | • Applicant dashboard grouped by cause<br>• Profile inspection (skills, supplies brought, medical, size)<br>• 1-click Accept / Reject | • Audit trail of all applications and status changes |
| **Field Logistics & Execution**| • Camera QR scanner for attendance<br>• Real-time announcement board | • Unique dynamic QR generator & download<br>• Announcement broadcast publisher<br>• Quota counter (e.g. 8/10 filled) | • Global activity log and system health monitoring |
| **Profile & User Governance** | • Personal profile (skills, health center, shirt size, completed causes) | • Organization profile & legal document submission flow | • User management (Enable / Disable accounts)<br>• Role and permission assignment<br>• Organization verification approval |

## 6. Success Metrics & Signals
- **Match-to-Application Conversion:** Percentage of swipe/map interactions resulting in a submitted application.
- **Organizer SLA / Review Time:** Average time to review pending applicants.
- **Attendance Verification Rate:** Percentage of accepted volunteers successfully verified on-site via QR scan.
- **Platform Trust & Verification Ratio:** Percentage of verified organizations approved by administrators.

## 7. Out of Scope (Non-Goals for Initial Release)
- Open peer-to-peer marketplace or detached classified ads board (supplies are tied strictly to causes).
- In-app monetary donations or payment gateways.
- Multi-user peer-to-peer open chat (MVP uses broadcast announcements from organizers).
- Complex clock-in / clock-out or exact fraction-of-hour tracking (simplified to binary event attendance).
- Automated third-party police/government background check APIs (handled via manual document upload and Admin review).
