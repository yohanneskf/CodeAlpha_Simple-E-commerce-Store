const { Product, User } = require('./server/models');
const sequelize = require('./server/config/database');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });

    // Create Admin
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'adminpassword',
      role: 'admin'
    });

    const products = [
      {
        name: 'Premium Wireless Headphones',
        description: 'High-quality noise-canceling headphones with 40h battery life.',
        price: 8500,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
        stock: 15,
        category: 'Electronics'
      },
      {
        name: 'Modern Smart Watch',
        description: 'Keep track of your fitness and notifications with this sleek watch.',
        price: 4200,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        stock: 20,
        category: 'Electronics'
      },
      {
        name: 'Leather Messenger Bag',
        description: 'Handcrafted genuine leather bag for the modern professional.',
        price: 3800,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
        stock: 10,
        category: 'Accessories'
      },
      {
        name: 'Minimalist Coffee Mug',
        description: 'Ceramic matte finish mug for your perfect morning brew.',
        price: 450,
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80',
        stock: 50,
        category: 'Home'
      },
      {
        name: 'Professional Camera Lens',
        description: '50mm f/1.8 prime lens for stunning portrait photography.',
        price: 12500,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
        stock: 5,
        category: 'Electronics'
      },
      {
        name: 'Retro Bluetooth Speaker',
        description: 'Vintage design with modern sound technology.',
        price: 2900,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80',
        stock: 12,
        category: 'Electronics'
      }
    ];

    await Product.bulkCreate(products);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seed();
