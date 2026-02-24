import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
const ACCESS_TOKEN_EXPIRY = "24h";
const REFRESH_TOKEN_EXPIRY = "15d";

export interface TokenPayload {
  userId: number;
  exp?: number;
  iat?: number;
  tokenType?: string;
}

export const createAccessToken = (userId: number): string => {
  const payload: TokenPayload = {
    userId,
    tokenType: "access",
  };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const createRefreshToken = (userId: number): string => {
  const payload: TokenPayload = {
    userId,
    tokenType: "refresh",
  };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
