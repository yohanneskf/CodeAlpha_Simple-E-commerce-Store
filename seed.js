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
        name: 'Artisan Jebena (Large)',
        description: 'Traditional handmade clay pot, fired in traditional kilns to ensure the perfect heat retention required for authentic "Buna" flavor.',
        price: 1450,
        image: 'https://images.unsplash.com/photo-1594494024039-df071d64388e?w=800&q=80',
        stock: 15,
        category: 'Handmade Ceramic',
        rating: 4.9,
        reviews: 124,
        badge: 'BestSeller'
      },
      {
        name: 'Modern Habesha Kemis',
        description: 'Elite hand-spun cotton dress with intricate embroidery. Each thread represents centuries of Ethiopian craftsmanship.',
        price: 8900,
        image: 'https://images.unsplash.com/photo-1590033062325-17730e25603d?w=800&q=80',
        stock: 8,
        category: 'Hand-spun Cotton',
        rating: 5.0,
        reviews: 86
      },
      {
        name: 'Authentic Berbere Blend',
        description: 'Sun-dried peppers from Gojjam, blended with 12 organic spices for the perfect balance of heat and flavor.',
        price: 450,
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
        stock: 50,
        category: 'Organic Spices',
        rating: 4.8,
        reviews: 210
      },
      {
        name: 'Gonderine Filigree Cross',
        description: 'Exquisite silver pendant handcrafted in Gonder using the ancient filigree technique.',
        price: 3200,
        image: 'https://images.unsplash.com/photo-1611085583191-a3b1a620e44a?w=800&q=80',
        stock: 5,
        category: 'Silver Jewelry',
        rating: 4.9,
        reviews: 45,
        badge: 'Limited'
      },
      {
        name: 'Sidama A-Grade Green Beans (1kg)',
        description: 'Direct from Ethiopian farmers. Single-origin, high-altitude coffee beans with floral notes.',
        price: 450,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
        stock: 100,
        category: 'Coffee Beans',
        rating: 4.7,
        reviews: 320
      },
      {
        name: 'Ebony Clay Gini Burner',
        description: 'Traditionally used for roasting coffee during the ceremony. Sleek obsidian-like finish.',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1578326457399-3b34dbbf23b8?w=800&q=80',
        stock: 20,
        category: 'Incense',
        rating: 4.6,
        reviews: 58
      }
    ];

    await Product.bulkCreate(products);

    console.log('Database seeded successfully with HabeshaMart products!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seed();
