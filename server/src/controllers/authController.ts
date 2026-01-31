import { Response } from 'express';
import pool from '../config/database.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/auth.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
} from '../utils/errors.js';

/* ============================================================================
   USER REGISTRATION
============================================================================ */

export const registerUser = async (req: AuthRequest, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    throw new ValidationError(
      'Email, password, first name, and last name are required'
    );
  }

  const connection = await pool.getConnection();
  try {
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      throw new ConflictError('Email already registered');
    }

    // Hash password (bcrypt)
    const passwordHash = await hashPassword(password);

    // Insert user
    const [result] = await connection.execute(
      `INSERT INTO users (email, password_hash, first_name, last_name, status, email_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, 'active', false]
    );

    const userId = (result as any).insertId;

    // Generate JWT tokens
    const accessToken = generateAccessToken(userId, email, 'customer');
    const refreshToken = generateRefreshToken(userId, email, 'customer');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: userId,
          email,
          firstName,
          lastName,
          role: 'customer',
        },
        accessToken,
        refreshToken,
      },
    });
  } finally {
    connection.release();
  }
};

/* ============================================================================
   USER LOGIN
============================================================================ */

export const loginUser = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      `SELECT id, email, password_hash, first_name, last_name
       FROM users
       WHERE email = ? AND deleted_at IS NULL`,
      [email]
    );

    if ((users as any[]).length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = (users as any[])[0];

    // Compare bcrypt hash
    const isPasswordValid = await comparePassword(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    const accessToken = generateAccessToken(user.id, user.email, 'customer');
    const refreshToken = generateRefreshToken(user.id, user.email, 'customer');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: 'customer',
        },
        accessToken,
        refreshToken,
      },
    });
  } finally {
    connection.release();
  }
};

/* ============================================================================
   ADMIN LOGIN
============================================================================ */

export const loginAdmin = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const connection = await pool.getConnection();
  try {
    const [admins] = await connection.execute(
      `SELECT id, email, password_hash, first_name, last_name, role
       FROM admins
       WHERE email = ? AND deleted_at IS NULL`,
      [email]
    );

    if ((admins as any[]).length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const admin = (admins as any[])[0];

    const isPasswordValid = await comparePassword(
      password,
      admin.password_hash
    );

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    await connection.execute(
      'UPDATE admins SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );

    const accessToken = generateAccessToken(
      admin.id,
      admin.email,
      admin.role
    );
    const refreshToken = generateRefreshToken(
      admin.id,
      admin.email,
      admin.role
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: admin.id,
          email: admin.email,
          firstName: admin.first_name,
          lastName: admin.last_name,
          role: admin.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } finally {
    connection.release();
  }
};

/* ============================================================================
   REFRESH TOKEN
============================================================================ */

export const refreshToken = async (req: AuthRequest, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new ValidationError('Refresh token is required');
  }

  try {
    const decoded = verifyRefreshToken(token);

    const accessToken = generateAccessToken(
      decoded.userId,
      decoded.email,
      decoded.role
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken },
    });
  } catch {
    throw new AuthenticationError('Invalid refresh token');
  }
};

/* ============================================================================
   GET CURRENT USER
============================================================================ */

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AuthenticationError('Not authenticated');
  }

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      `SELECT id, email, first_name, last_name, phone, gender, city, state, country
       FROM users
       WHERE id = ?`,
      [req.user.userId]
    );

    if ((users as any[]).length === 0) {
      throw new ValidationError('User not found');
    }

    const user = (users as any[])[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          gender: user.gender,
          city: user.city,
          state: user.state,
          country: user.country,
        },
      },
    });
  } finally {
    connection.release();
  }
};
