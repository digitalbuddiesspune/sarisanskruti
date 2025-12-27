import { Product } from '../models/product.js';

const CATEGORY_GROUPS = {
  'Designer Sarees': [
    'Party Wear Saree',
    'Wedding Sarees',
    'Festive Sarees',
    'Bollywood Style Sarees',
    'Heavy Embroidered Sarees'
  ]
};

export const getProducts = async (req, res) => {
  try {
    // Accept either `subcategory` (preferred) or `category` query param
    const rawCategory = (req.query.subcategory || req.query.category || '').toString();
    // normalize slug-like values (e.g., "soft-silk" -> "soft silk") and trim
    const category = rawCategory.replace(/-/g, ' ').trim();
    let query = {};

    if (category) {
      // Try multiple ways to match the category or subcategory fields
      const re = new RegExp(category, 'i');
      const orConditions = [
        { 'category.name': { $regex: re } },
        { 'category': { $regex: re } },
        { 'category.slug': { $regex: re } },
        { 'subcategory': { $regex: re } },
        { 'tags': { $regex: re } }
      ];

      if (CATEGORY_GROUPS[category]) {
        CATEGORY_GROUPS[category].forEach((sub) => {
          orConditions.push({ category: { $regex: new RegExp(sub, 'i') } });
        });
      }

      query = { $or: orConditions };
    }

    // Execute the query with lean() for faster performance (returns plain JS objects)
    let products = await Product.find(query).lean();

    // Process image URLs to ensure they're absolute (only if needed)
    products = products.map(product => {
      // Calculate price if not already present
      if (!product.price && product.mrp && product.discountPercent) {
        product.price = Math.round(product.mrp - (product.mrp * product.discountPercent / 100));
      }
      
      // Images are already in the correct format (image1, image2, image3), no need to process
      return product;
    });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Error fetching products', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    // Use lean() for faster performance
    let product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate price if not already present
    if (!product.price && product.mrp && product.discountPercent) {
      product.price = Math.round(product.mrp - (product.mrp * product.discountPercent / 100));
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      message: 'Error fetching product', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
