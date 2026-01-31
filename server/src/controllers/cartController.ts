import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import pool from '../config/database.js';

export const getCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const [rows] = await pool.query(
    'SELECT * FROM carts WHERE user_id = ? AND deleted_at IS NULL',
    [userId]
  );

  res.json({ success: true, data: rows });
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { productVariantId, quantity } = req.body;

  await pool.query(
    `INSERT INTO carts (user_id, product_variant_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [userId, productVariantId, quantity]
  );

  res.status(201).json({ success: true, message: 'Item added to cart' });
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await pool.query(
    'UPDATE carts SET deleted_at = NOW() WHERE id = ?',
    [id]
  );

  res.json({ success: true, message: 'Item removed from cart' });
};
