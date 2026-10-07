//product service

const Product = require("../models/product.model");

async function listProducts() {
  return Product.find().sort({ createdAt: -1 });
}
const getProductById = async (id) => {
  return Product.findById(id);
};

const createProduct = async (data) => {
  return Product.create(data);
};

const updateProduct = async (id, data) => {
  return Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

const deleteProduct = async (id) => {
  return Product.findByIdAndDelete(id);
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
