import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { config } from '../config';

interface TokenPayload extends JWTPayload {
  id: string;
  email: string;
  rol: string;
}

export const generateToken = async (payload: TokenPayload): Promise<string> => {
  const secret = new TextEncoder().encode(config.jwt.secret);
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(config.jwt.expiresIn)
    .sign(secret);
  
  return jwt;
};

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  try {
    const secret = new TextEncoder().encode(config.jwt.secret);
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch (error) {
    throw new Error('Token inválido');
  }
}; 