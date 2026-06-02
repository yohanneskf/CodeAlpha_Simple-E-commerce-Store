const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product } = require('../models');
const { authenticate } = require('../middleware/auth');
const axios = require('axios');
require('dotenv').config();

// Create Order (Checkout)
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user.userId;
    const tx_ref = `tx-${Date.now()}-${userId.substring(0, 5)}`;

    const order = await Order.create({
      userId,
      totalAmount,
      tx_ref,
      status: 'pending'
    });

    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      });
    }

    // Chapa Payment Initialization
    try {
      const chapaResponse = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
        amount: totalAmount,
        currency: 'ETB',
        email: req.user.email || 'customer@example.com', // In real app, get from User record
        first_name: req.user.username,
        tx_ref,
        callback_url: `${process.env.BASE_URL}/api/orders/verify/${tx_ref}`,
        return_url: `${process.env.BASE_URL}/payment-status.html?tx_ref=${tx_ref}`,
        "customization[title]": "E-commerce Payment",
        "customization[description]": `Payment for order #${order.id.substring(0,8)}`
      }, {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
        }
      });

      if (chapaResponse.data.status === 'success') {
        res.status(201).json({ 
          order, 
          checkoutUrl: chapaResponse.data.data.checkout_url 
        });
      } else {
        res.status(400).json({ message: 'Chapa initialization failed', error: chapaResponse.data });
      }
    } catch (chapaErr) {
      console.error('Chapa Error:', chapaErr.response?.data || chapaErr.message);
      res.status(500).json({ 
        message: 'Order created but payment failed to initialize', 
        order,
        error: chapaErr.response?.data || chapaErr.message 
      });
    }

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Verify Payment (Callback or Manual Check)
router.get('/verify/:tx_ref', async (req, res) => {
  try {
    const { tx_ref } = req.params;
    const order = await Order.findOne({ where: { tx_ref } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify with Chapa
    const verifyResponse = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
      }
    });

    if (verifyResponse.data.status === 'success' && verifyResponse.data.data.status === 'success') {
      order.status = 'paid';
      order.paymentStatus = 'paid';
      await order.save();
      
      // Update stock (optional but good practice)
      const items = await OrderItem.findAll({ where: { orderId: order.id } });
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }

      res.status(200).json({ status: 'success', message: 'Payment verified' });
    } else {
      res.status(400).json({ status: 'failed', message: 'Payment verification failed' });
    }

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get User Orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.findAll({ 
      where: { userId: req.user.userId },
      include: [{ model: OrderItem, as: 'items', include: [Product] }]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
