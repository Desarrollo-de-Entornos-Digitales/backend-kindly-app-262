// Authentication / Users / Roles
export * from './http/user-not-found.exception';
export * from './http/role-not-found.exception';
export * from './http/user-already-exists.exception';
export * from './http/invalid-credentials.exception';
export * from './http/user-inactive.exception';

// Tokens / JWT
export * from './http/token-expired.exception';
export * from './http/invalid-token.exception';
export * from './http/token-missing.exception';

// Causes / Organizations
export * from './http/cause-not-found.exception';
export * from './http/cause-quota-full.exception';
export * from './http/cause-not-available.exception';
export * from './http/organizer-not-found.exception';
export * from './http/organization-not-verified.exception';

// Participation / Attendance
export * from './http/submission-not-found.exception';
export * from './http/duplicate-submission.exception';
export * from './http/volunteer-not-accepted.exception';
export * from './http/duplicate-attendance.exception';
