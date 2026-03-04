const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middlewares/asyncHandler');
const adminAuth = require('../middlewares/adminAuth');
const shipmentController = require('../controllers/shipment.controller');

// Create shipment for an order (admin only)
router.post('/create/:id', adminAuth, asyncHandler(shipmentController.createShipmentForOrder));

module.exports = router;
