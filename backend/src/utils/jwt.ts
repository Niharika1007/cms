import jwt from "jsonwebtoken"

const ACCESS_SECRET = process.env.JWT_SECRET || "access_secret"
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret"

export interface TokenPayload {
  userId: string
  role: string
}

export function generateAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" })
}

export function generateRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" })
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload
}

/* OPTIONAL alias if your code uses verifyToken */
export const verifyToken = verifyAccessToken