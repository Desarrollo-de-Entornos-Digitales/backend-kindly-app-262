export interface JwtPayload {
    sub: number;
    email: string;
    username: string;
    role: string;
    iat?: number; //the date it was issued
    exp?: number; //expiration
}
