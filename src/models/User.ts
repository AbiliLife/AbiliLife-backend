export interface User {
  uid: string;
  email: string;
  phone: string;
  fullName: string;
  passwordHash?: string; // Optional for security - not included in responses
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  disabilityType?: string;
  accessibilityPreferences?: AccessibilityPreferences;
  emergencyContact?: EmergencyContact;
  isCaregiver?: boolean;
  careRecipients?: string[]; // Array of user IDs for caregiver mode
}

export interface AccessibilityPreferences {
  needsRamp: boolean;
  needsAssistiveDevice: boolean;
  needsSignLanguage: boolean;
  mobilityAid?: 'wheelchair' | 'walker' | 'crutches' | 'none';
  communicationPreference?: 'voice' | 'text' | 'sign_language';
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface CreateUserRequest {
  email: string;
  phone: string;
  fullName: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPRequest {
  phone: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Partial<User>;
  token?: string;
}
