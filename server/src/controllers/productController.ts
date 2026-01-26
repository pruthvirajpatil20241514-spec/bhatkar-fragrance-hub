import { Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { ValidationError, NotFoundError, AuthorizationError } from '../utils/errors.js';

// Get all products with pagination and filters
export const getAllProducts = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 12, category, search, sort = 'newest', featured } = req.query;
  const offset = ((parseInt(page as string) || 1) - 1) * parseInt(limit as string);
  const pageLimit = parseInt(limit as string);

  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT p.*, c.name as category_name,
             COUNT(DISTINCT r.id) as review_count,
             AVG(r.rating) as average_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 'approved'
      WHERE p.status = 'active' AND p.deleted_at IS NULL
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE status = "active" AND deleted_at IS NULL';
    const params: any[] = [];

    // Filters
    if (category) {
      query += ' AND c.slug = ?';
      countQuery += ' AND category_id = (SELECT id FROM categories WHERE slug = ?)';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (featured === 'true') {
      query += ' AND p.featured = true';
      countQuery += ' AND featured = true';
    }

    // Sorting
    if (sort === 'price_low') {
      query += ' GROUP BY p.id ORDER BY p.discounted_price ASC';
    } else if (sort === 'price_high') {
      query += ' GROUP BY p.id ORDER BY p.discounted_price DESC';
    } else if (sort === 'rating') {
      query += ' GROUP BY p.id ORDER BY average_rating DESC';
    } else {
      query += ' GROUP BY p.id ORDER BY p.created_at DESC';
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(pageLimit, offset);

    // Get total count
    const [countResult] = await connection.execute(countQuery, params.slice(0, params.length - 2));
    const total = (countResult as any[])[0].total;

    // Get products
    const [products] = await connection.execute(query, params);

    // Get variants for each product
    const productsWithVariants = await Promise.all(
      (products as any[]).map(async (product) => {
        const [variants] = await connection.execute(
          `SELECT id, size_ml, price, discounted_price, stock_quantity 
           FROM product_variants 
           WHERE product_id = ? AND status = 'active' AND deleted_at IS NULL`,
          [product.id]
        );
        return { ...product, variants };
      })
    );

    res.json({
      success: true,
      data: {
        products: productsWithVariants,
        pagination: {
          page: parseInt(page as string) || 1,
          limit: pageLimit,
          total,
          pages: Math.ceil(total / pageLimit),
        },
      },
    });
  } finally {
    connection.release();
  }
};

// Get product by ID with variants and images
export const getProductById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [products] = await connection.execute(
      `SELECT p.*, c.name as category_name,
              COUNT(DISTINCT r.id) as review_count,
              AVG(r.rating) as average_rating
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN reviews r ON p.id = r.product_id AND r.status = 'approved'
       WHERE p.id = ? AND p.deleted_at IS NULL
       GROUP BY p.id`,
      [id]
    );

    if ((products as any[]).length === 0) {
      throw new NotFoundError('Product not found');
    }

    const product = (products as any[])[0];

    // Get variants
    const [variants] = await connection.execute(
      `SELECT id, size_ml, price, discounted_price, discount_percentage, stock_quantity 
       FROM product_variants 
       WHERE product_id = ? AND deleted_at IS NULL`,
      [id]
    );

    // Get images
    const [images] = await connection.execute(
      `SELECT id, image_url, alt_text, is_primary 
       FROM product_images 
       WHERE product_id = ? AND deleted_at IS NULL
       ORDER BY is_primary DESC, display_order ASC`,
      [id]
    );

    // Get reviews
    const [reviews] = await connection.execute(
      `SELECT r.id, r.rating, r.title, r.review_text, r.created_at, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.status = 'approved' AND r.deleted_at IS NULL
       ORDER BY r.created_at DESC
       LIMIT 5`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...product,
        variants,
        images,
        reviews,
      },
    });
  } finally {
    connection.release();
  }
};

// Get featured products
export const getFeaturedProducts = async (req: AuthRequest, res: Response) => {
  const { limit = 8 } = req.query;

  const connection = await pool.getConnection();
  try {
    const [products] = await connection.execute(
      `SELECT p.id, p.name, p.slug, p.base_price, p.discounted_price, 
              p.thumbnail_image, p.rating, p.review_count
       FROM products p
       WHERE p.featured = true AND p.status = 'active' AND p.deleted_at IS NULL
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [parseInt(limit as string)]
    );

    res.json({
      success: true,
      data: products,
    });
  } finally {
    connection.release();
  }
};
