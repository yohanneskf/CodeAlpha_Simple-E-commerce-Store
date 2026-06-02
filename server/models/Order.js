const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'shipped', 'cancelled'),
    defaultValue: 'pending',
  },
  tx_ref: {
    type: DataTypes.STRING,
    unique: true,
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'unpaid',
  },
});

module.exports = Order;
