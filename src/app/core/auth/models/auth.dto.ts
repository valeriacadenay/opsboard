/**
 * Auth DTOs
 */

export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  mfaRequired: boolean;
}

export interface MfaVerificationDTO {
  code: string;
}
