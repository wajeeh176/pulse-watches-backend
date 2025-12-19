const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
dotenv.config();

const data = [
  {
    title: 'Casino Royale Watch',
    slug: 'casino-royale-watch',
    price: 2900,
    countInStock: 10,
    images: ['casino.png'],
    brand: 'Casino',
    category: 'Men',
    description: 'Classic rubber strap, 40mm case with analog display.',
  },
  {
    title: 'Citizen Quartz Classic',
    slug: 'citizen-quartz-classic',
    price: 3350,
    countInStock: 5,
    images: ['citizen.png'],
    brand: 'Citizen',
    category: 'Men',
    description: 'Precision chronograph, stainless steel, water resistant.',
  },
  {
    title: 'Citizen Regal Gold',
    slug: 'citizen-regal-gold',
    price: 3350,
    countInStock: 4,
    images: ['regal.png'],
    brand: 'Citizen',
    category: 'Men',
    description: 'Luxury gold-tone watch with automatic movement.',
  },
  {
    title: 'Rolex Quartz Luxury Timepiece',
    slug: 'rolex-quartz-luxury-timepiece',
    price: 9800,
    countInStock: 6,
    images: ['rolex.png'],
    brand: 'Rolex',
    category: 'Women',
    description: 'Minimal and elegant design, perfect for daily wear.',
  },
  {
    title: 'Seastar Dynamic Orbit',
    slug: 'seastar-dynamic-orbit',
    price: 4000,
    countInStock: 8,
    images: ['seastar.png'],
    brand: 'SeaStar',
    category: 'Women',
    description: 'Rotating Dial',
  },
  {
    title: 'Tissot PRX Black Steel',
    slug: 'tissot-prx-black-steel',
    price: 9500,
    countInStock: 12,
    images: ['tissot.png'],
    brand: 'Tissot',
    category: 'Unisex',
    description: 'Textured black dial with sleek silver-tone hands and markers.',
  },
  {
    title: 'Forrad Classic Black',
    slug: 'forrad-classic-black',
    price: 2650,
    countInStock: 3,
    images: ['forrad.png'],
    brand: 'Forrad',
    category: 'Men',
    description: 'Comfortable black leather strap with contrast stitching.',
  },
  {
    title: 'Patek Philippe Emerald Horizon',
    slug: 'patek-philippe-emarld-horizon',
    price: 8700,
    countInStock: 9,
    images: ['patek.png'],
    brand: 'Patek Philippe',
    category: 'Women',
    description: 'Distinctive green textured dial with luminous hands and hour markers',
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Product.deleteMany({});
    await Product.insertMany(data);
    console.log('✅ Database successfully seeded with 8 products.');
    process.exit(0);
  })
  .catch((err) => console.error(err));
