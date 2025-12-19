const Product = require('../models/Product');
const NodeCache = require('node-cache');

// Initialize cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

exports.getProducts = async (req, res) => {
  try {
    // Check if we have a cached response
    const cacheKey = 'all_products';
    const cachedProducts = cache.get(cacheKey);
    
    if (cachedProducts) {
      // Set cache header
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(cachedProducts);
    }
    
    // Implement pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    
    // Implement filtering
    const filter = {};
    if (req.query.category) filter.category = new RegExp(req.query.category, 'i');
    if (req.query.brand) filter.brand = new RegExp(req.query.brand, 'i');
    
    // Implement sorting
    const sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') ? req.query.sort.substring(1) : req.query.sort;
      sort[sortField] = req.query.sort.startsWith('-') ? -1 : 1;
    }
    
    // Execute query with pagination
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Store in cache (store as array for consistency)
    cache.set(cacheKey, products);
    
    // Set cache header
    res.set('Cache-Control', 'public, max-age=300');
    
    // Always return products as an array for client compatibility
    res.json(products || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const slug = req.params.slug;
    
    // Check cache first
    const cacheKey = `product_${slug}`;
    const cachedProduct = cache.get(cacheKey);
    
    if (cachedProduct) {
      // Set cache header
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(cachedProduct);
    }
    
    // If not in cache, fetch from database
    const product = await Product.findOne({ slug }).lean();
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Store in cache
    cache.set(cacheKey, product);
    
    // Set cache header
    res.set('Cache-Control', 'public, max-age=300');
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    // Invalidate cache
    cache.del('all_products');
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Invalidate cache
    cache.del('all_products');
    cache.del(`product_${product.slug}`);
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    // Invalidate cache
    cache.del('all_products');
    cache.del(`product_${product.slug}`);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
