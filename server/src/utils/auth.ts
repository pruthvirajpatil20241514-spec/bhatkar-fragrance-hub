import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string): Promise<string> => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
  return bcrypt.hash(password, rounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (userId: number, email: string, role: string): string => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRY || '1h' }
  );
};

export const generateRefreshToken = (userId: number, email: string, role: string): string => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
