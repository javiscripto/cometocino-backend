const productService = require("../services/product.service");

async function listProducts(req, res) {
  const products = await productService.listProducts();
  return res.json({ data: products });
}

async function getProduct(req, res) {
  const product = await productService.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: "Pizza no encontrada" });
  return res.json({ data: product });
}

async function createProduct(req, res) {
  const product = await productService.createProduct(req.body);
  return res.status(201).json({ data: product });
}

async function updateProduct(req, res) {
  const product = await productService.updateProduct(req.params.id, req.body);
  if (!product) return res.status(404).json({ error: "Pizza no encontrada" });
  return res.json({ data: product });
}

async function deleteProduct(req, res) {
  const product = await productService.deleteProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Pizza no encontrada" });
  return res.status(204).send();
}

async function showCreateForm(req, res) {
  const products = await productService.listProducts();
  return res.render("products/new", {
    products,
    values: {},
    error: null,
    created: req.query.created === "1",
  });
}

async function submitCreateForm(req, res) {
  try {
    await productService.createProduct({
      name: req.body.name,
      salePrice: req.body.salePrice,
      productionCost: req.body.productionCost,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
    });
    return res.redirect(303, "/admin/products/new?created=1");
  } catch (error) {
    const products = await productService.listProducts();
    return res.status(400).render("products/new", {
      products,
      values: req.body,
      error: error.message,
      created: false,
    });
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  showCreateForm,
  submitCreateForm,
};
