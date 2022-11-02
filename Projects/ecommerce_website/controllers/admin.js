const Product = require("../models/product");
const mongoose = require("mongoose");

const cloudinary = require("../util/cloudinary");
const upload = require("../util/multer");

const { validationResult } = require("express-validator/check");

const fileHelper = require("../util/file");
const { CURSOR_FLAGS } = require("mongodb");

exports.AdminProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((data) => {
      res.render("admin/products", {
        prods: data,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAddProductPage = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/edit-product", {
    pageTitle: "Admin - Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProductPage = async (req, res, next) => {
  const errors = validationResult(req);
  const image = req.file;
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Admin - Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: req.body.title,
        price: req.body.price,
        details: req.body.details,
      },
      errorMessage: "Attached File is not an Image",
      validationErrors: [],
    });
  }
  // console.log(req.file);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Admin - Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: errors.array()[0].msg,
      hasError: true,
      product: {
        title: req.body.title,
        price: req.body.price,
        details: req.body.details,
      },
      validationErrors: errors.array(),
    });
  }

  const imageUrl = image.path;
  console.log("ImageUrl is: " + imageUrl);

  try {
    const imageSaverResult = await cloudinary.uploader.upload(imageUrl);
    // console.log(result);
    const product = new Product({
      title: req.body.title,
      imageUrl: imageSaverResult.secure_url,
      cloudinary_id: imageSaverResult.public_id,
      price: req.body.price,
      details: req.body.details,
      userId: req.user,
      rating: 0, // the mongoose will pick the userId automatically
    });
    const productSaver = product.save();
    console.log("Product creation complete");
    res.redirect("/admin/products");
    fileHelper.deleletFile(imageUrl);
  } catch (err) {
    console.log(err);
    // res.redirect('/500');
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditProductPage = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    console.log("no edit mode found");
    return res.redirect("/");
  }
  const productId = req.params.productId;
  Product.findById(productId)
    .then((products) => {
      let product = products;
      if (!product) {
        console.log("no product found");
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Admin - Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        hasError: false,
        product: product,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = async (req, res, next) => {
  const errors = validationResult(req);
  const image = req.file;
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Admin - Edit Product",
      path: "/admin/edit-product",
      editing: true,
      errorMessage: errors.array()[0].msg,
      hasError: true,
      product: {
        title: req.body.title,
        price: req.body.price,
        details: req.body.details,
        _id: req.body.productId,
      },
      validationErrors: errors.array(),
    });
  }
  try {
    const product = await Product.findById(req.body.productId);
    if (product.userId.toString() !== req.user._id.toString()) {
      console.log("UserId mismatch!");
      return res.redirect("/");
    }
    product.title = req.body.title;
    if (image) {
      const imageDeleteResult = await cloudinary.uploader.destroy(
        product.cloudinary_id
      );
      // console.log(imageDeleteResult);
      const imageUrl = image.path;
      const imageSaverResult = await cloudinary.uploader.upload(imageUrl);
      // console.log(imageSaverResult);
      product.imageUrl = imageSaverResult.secure_url;
      product.cloudinary_id = imageSaverResult.public_id;
    }
    product.price = req.body.price;
    product.details = req.body.details;
    await product.save();
    console.log("Product with id: " + req.body.productId + " was updated");
    res.redirect("/admin/products");
    fileHelper.deleletFile(image.path);
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  // Product.findById(prodId)
  //   .then((product) => {
  //     if (!product) {
  //       return next(new Error("No product found to delete!"));
  //     }
  //     fileHelper.deleletFile(product.imageUrl);
  //     return Product.deleteOne({
  //       _id: prodId,
  //       userId: req.user._id,
  //     });
  //   })
  //   .then((result) => {
  //     console.log("Product with id:" + prodId + " has been deleted");
  //     // console.log(result);
  //     res.status(200).json({ message: "Success!" });
  //   })
  //   .catch((err) => {
  //     res.status(500).json({ message: "Deleting Product Failed!" });
  //   });

  const prodId = req.params.productId;
  try {
    let product = await Product.findById(prodId);
    if (!product) {
      return next(new Error("No product found to delete!"));
    }
    await cloudinary.uploader.destroy(product.cloudinary_id);
    let productDeleteResponse = await Product.deleteOne({
      _id: prodId,
      userId: req.user._id,
    });
    console.log("Product with id:" + prodId + " has been deleted");
    // console.log(productDeleteResponse);
    res.status(200).json({ message: "Success!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Deleting Product Failed!" });
  }
};
