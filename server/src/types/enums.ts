// User
export enum UserRole {
  DONOR = "donor",
  ADMIN = "admin",
}

// Blood Groups
export enum BloodGroup {
  A_POS = "A+",
  A_NEG = "A-",
  B_POS = "B+",
  B_NEG = "B-",
  AB_POS = "AB+",
  AB_NEG = "AB-",
  O_POS = "O+",
  O_NEG = "O-",
}

// Blood Request
export enum RequestStatus {
  REQUESTED = "requested",
  ACCEPTED = "accepted",
  COMPLETED = "completed",
  EXPIRED = "expired",
}

export enum Urgency {
  NORMAL = "normal",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum RelationshipToPatient {
  SELF = "self",
  FAMILY = "family",
  FRIEND = "friend",
  GUARDIAN = "guardian",
  OTHER = "other",
}

// Donation History
export enum DonationStatus {
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

// Notifications
export enum NotificationType {
  REQUEST = "request",
  REMINDER = "reminder",
  SYSTEM = "system",
}

//Response History
export enum ResponseStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}