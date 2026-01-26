import { Response } from 'express';
import pool from '../config/database.js';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../utils/auth.js';
import { AuthRequest } from '../middleware/auth.js';
import { ValidationError, AuthenticationError, ConflictError } from '../utils/errors.js';

// User Registration
export const registerUser = async (req: AuthRequest, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  // Validation
  if (!email || !password || !firstName || !lastName) {
    throw new ValidationError('Email, password, first name, and last name are required');
  }

  const connection = await pool.getConnection();
  try {
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const [result] = await connection.execute(
      `INSERT INTO users (email, password_hash, first_name, last_name, status, email_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, 'active', false]
    );

    const userId = (result as any).insertId;

    // Generate tokens
    const accessToken = generateAccessToken(userId, email, 'customer');
    const refreshToken = generateRefreshToken(userId, email, 'customer');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId,
        email,
        firstName,
        lastName,
        accessToken,
        refreshToken,
      },
    });
  } finally {
    connection.release();
  }
};

// User Login
export const loginUser = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );

    if ((users as any[]).length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = (users as any[])[0];
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    const accessToken = generateAccessToken(user.id, user.email, 'customer');
    const refreshToken = generateRefreshToken(user.id, user.email, 'customer');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        accessToken,
        refreshToken,
      },
    });
  } finally {
    connection.release();
  }
};

// Admin Login
export const loginAdmin = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const connection = await pool.getConnection();
  try {
    const [admins] = await connection.execute(
      'SELECT id, email, password_hash, first_name, last_name, role FROM admins WHERE email = ? AND deleted_at IS NULL',
      [email]
    );

    if ((admins as any[]).length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const admin = (admins as any[])[0];
    const isPasswordValid = await comparePassword(password, admin.password_hash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await connection.execute(
      'UPDATE admins SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );

    const accessToken = generateAccessToken(admin.id, admin.email, admin.role);
    const refreshToken = generateRefreshToken(admin.id, admin.email, admin.role);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        adminId: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role,
        accessToken,
        refreshToken,
      },
    });
  } finally {
    connection.release();
  }
};

// Refresh Token
export const refreshToken = async (req: AuthRequest, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new ValidationError('Refresh token is required');
  }

  try {
    const decoded = require('../utils/auth.js').verifyRefreshToken(token);

    const accessToken = generateAccessToken(decoded.userId, decoded.email, decoded.role);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken },
    });
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
};

// Get Current User
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AuthenticationError('Not authenticated');
  }

  const connection = await pool.getConnection();
  try {
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, phone, gender, city, state, country FROM users WHERE id = ?',
      [req.user.userId]
    );

    if ((users as any[]).length === 0) {
      throw new ValidationError('User not found');
    }

    const user = (users as any[])[0];

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        gender: user.gender,
        city: user.city,
        state: user.state,
        country: user.country,
      },
    });
  } finally {
    connection.release();
  }
};
