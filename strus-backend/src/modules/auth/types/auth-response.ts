export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthResponse extends TokenResponse {
    profileCompleted: boolean;
}