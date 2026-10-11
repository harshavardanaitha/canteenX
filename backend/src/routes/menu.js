const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { emitAvailabilityChange } = require('../services/socket');

const router = express.Router();

// GET MENU CATEGORIES & ITEMS
router.get('/', async (req, res) => {
  try {
    const canteenId = req.query.canteen_id || 'cnt_main';

    const categories = await db.query(
      `SELECT * FROM menu_categories WHERE canteen_id = $1 AND is_active = 1 ORDER BY display_order ASC`,
      [canteenId]
    );

    const items = await db.query(
      `SELECT m.*, c.name as category_name
       FROM menu_items m
       JOIN menu_categories c ON m.category_id = c.id
       WHERE m.canteen_id = $1
       ORDER BY m.is_popular DESC, m.name ASC`,
      [canteenId]
    );

    res.json({ categories, items });
  } catch (error) {
    console.error('[Menu Fetch Error]:', error);
    res.status(500).json({ error: 'Error fetching menu items.' });
  }
});

// UPDATE AVAILABILITY STATUS (Staff / Manager)
router.patch('/:id/availability', authenticateToken, requireRole('CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN'), async (req, res) => {
  try {
    const { availability_status, available_quantity } = req.body;
    const itemId = req.params.id;

    if (!['AVAILABLE', 'LOW_STOCK', 'SOLD_OUT', 'TEMPORARILY_UNAVAILABLE'].includes(availability_status)) {
      return res.status(400).json({ error: 'Invalid availability status.' });
    }

    const currentItems = await db.query('SELECT canteen_id, name FROM menu_items WHERE id = $1', [itemId]);
    if (currentItems.length === 0) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    const canteenId = currentItems[0].canteen_id;
    const qty = available_quantity !== undefined ? available_quantity : (availability_status === 'SOLD_OUT' ? 0 : 50);

    await db.query(
      `UPDATE menu_items SET availability_status = $1, available_quantity = $2 WHERE id = $3`,
      [availability_status, qty, itemId]
    );

    // Broadcast real-time availability change
    emitAvailabilityChange(canteenId, {
      itemId,
      name: currentItems[0].name,
      availability_status,
      available_quantity: qty
    });

    res.json({ message: 'Menu item availability updated.', itemId, availability_status, available_quantity: qty });
  } catch (error) {
    console.error('[Update Availability Error]:', error);
    res.status(500).json({ error: 'Error updating item availability.' });
  }
});

// ADD NEW MENU ITEM (Manager / Staff / Admin)
router.post('/', authenticateToken, requireRole('CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const {
      canteen_id, category_id, category_name, name, description,
      price, image_url, is_veg, calories, prep_time_mins, available_quantity
    } = req.body;

    const itemPrice = price !== undefined ? price : base_price;
    if (!canteen_id || !name || itemPrice === undefined || itemPrice === null || itemPrice === '') {
      return res.status(400).json({ error: 'Canteen ID, Name, and Price are required.' });
    }

    let finalCategoryId = category_id;

    // If no category_id is provided, try finding or creating from category_name
    if (!finalCategoryId && category_name) {
      const existingCat = await db.query(
        'SELECT id FROM menu_categories WHERE canteen_id = $1 AND LOWER(name) = LOWER($2)',
        [canteen_id, category_name]
      );
      if (existingCat.length > 0) {
        finalCategoryId = existingCat[0].id;
      } else {
        finalCategoryId = 'cat_' + Date.now();
        await db.query(
          `INSERT INTO menu_categories (id, canteen_id, name, display_order, is_active)
           VALUES ($1, $2, $3, 99, 1)`,
          [finalCategoryId, canteen_id, category_name]
        );
      }
    } else if (!finalCategoryId) {
      // Find first available category in canteen
      const defaultCat = await db.query('SELECT id FROM menu_categories WHERE canteen_id = $1 LIMIT 1', [canteen_id]);
      finalCategoryId = defaultCat[0]?.id || 'cat_default';
    }

    const itemId = 'itm_' + Date.now();
    const qty = available_quantity !== undefined ? parseInt(available_quantity) : 50;
    const isVegVal = (is_veg === 1 || is_veg === true || is_veg === '1') ? 1 : 0;
    const defaultImage = isVegVal
      ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'
      : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500';

    await db.query(
      `INSERT INTO menu_items (id, canteen_id, category_id, name, description, price, image_url, is_veg, calories, prep_time_mins, availability_status, available_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'AVAILABLE', $11)`,
      [
        itemId,
        canteen_id,
        finalCategoryId,
        name,
        description || '',
        parseFloat(itemPrice),
        image_url || defaultImage,
        isVegVal,
        parseInt(calories || 250),
        parseInt(prep_time_mins || 10),
        qty
      ]
    );

    res.status(201).json({
      message: 'Menu item created successfully.',
      item: {
        id: itemId,
        canteen_id,
        category_id: finalCategoryId,
        name,
        price: parseFloat(itemPrice),
        is_veg: isVegVal,
        available_quantity: qty
      }
    });
  } catch (error) {
    console.error('[Add Menu Item Error]:', error);
    res.status(500).json({ error: 'Error creating menu item.' });
  }
});

// DELETE MENU ITEM (Manager / Admin)
router.delete('/:id', authenticateToken, requireRole('CANTEEN_MANAGER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const itemId = req.params.id;
    await db.query('DELETE FROM menu_items WHERE id = $1', [itemId]);
    res.json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (error) {
    console.error('[Delete Menu Item Error]:', error);
    res.status(500).json({ error: 'Error deleting menu item.' });
  }
});

// UPDATE MENU ITEM (Manager / Admin)
router.put('/:id', authenticateToken, requireRole('CANTEEN_MANAGER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const itemId = req.params.id;
    const { name, price, description, is_veg, prep_time_mins, available_quantity, image_url } = req.body;

    await db.query(
      `UPDATE menu_items
       SET name = COALESCE($1, name),
           price = COALESCE($2, price),
           description = COALESCE($3, description),
           is_veg = COALESCE($4, is_veg),
           prep_time_mins = COALESCE($5, prep_time_mins),
           available_quantity = COALESCE($6, available_quantity),
           image_url = COALESCE($7, image_url)
       WHERE id = $8`,
      [name, price, description, is_veg, prep_time_mins, available_quantity, image_url, itemId]
    );

    res.json({ success: true, message: 'Menu item updated successfully.' });
  } catch (error) {
    console.error('[Update Menu Item Error]:', error);
    res.status(500).json({ error: 'Error updating menu item.' });
  }
});

module.exports = router;
