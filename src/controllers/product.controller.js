const productService = require("../services/product.service");

function parseActive(value) {
  return value === true || value === "true" || value === "on" || value === "1";
}

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
  const { _id, id, createdAt, updatedAt, ...data } = req.body;
  const product = await productService.updateProduct(req.params.id, data);
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
    error: req.query.error || null,
    created: req.query.created === "1",
    updated: req.query.updated === "1",
    deleted: req.query.deleted === "1",
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
      active: parseActive(req.body.active),
    });
    return res.redirect(303, "/admin/products?created=1");
  } catch (error) {
    const products = await productService.listProducts();
    return res.status(400).render("products/new", {
      products,
      values: req.body,
      error: error.message,
      created: false,
      updated: false,
      deleted: false,
    });
  }
}

async function showEditForm(req, res) {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.redirect(
        303,
        "/admin/products?error=" + encodeURIComponent("Pizza no encontrada"),
      );
    }
    return res.render("products/edit", {
      product,
      values: product,
      error: req.query.error || null,
    });
  } catch (error) {
    return res.redirect(
      303,
      "/admin/products?error=" + encodeURIComponent(error.message),
    );
  }
}

async function submitUpdateForm(req, res) {
  try {
    const payload = {
      name: req.body.name,
      salePrice: req.body.salePrice,
      productionCost: req.body.productionCost,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      active: parseActive(req.body.active),
    };

    const product = await productService.updateProduct(req.params.id, payload);
    if (!product) {
      return res.redirect(
        303,
        "/admin/products?error=" + encodeURIComponent("Pizza no encontrada"),
      );
    }
    return res.redirect(303, "/admin/products?updated=1");
  } catch (error) {
    let product = null;
    try {
      product = await productService.getProductById(req.params.id);
    } catch (_) { }

    return res.status(400).render("products/edit", {
      product: product || { _id: req.params.id, ...req.body },
      values: { ...req.body, _id: req.params.id },
      error: error.message,
    });
  }
}

async function submitDeleteProduct(req, res) {
  try {
    await productService.deleteProduct(req.params.id);
    return res.redirect(303, "/admin/products?deleted=1");
  } catch (error) {
    return res.redirect(
      303,
      "/admin/products?error=" + encodeURIComponent(error.message),
    );
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
  showEditForm,
  submitUpdateForm,
  submitDeleteProduct,
};
