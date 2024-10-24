const asyncHandler = require("express-async-handler");
const Brand = require("../models/brandModel");
const validateMongodbId = require("../utils/validateMongodbId");
const Product = require("../models/productModel");
const { genderBrandFilter } = require("../helperfns");

//get a brand
const getBrand = asyncHandler(async (req, res) => {
  const { brand } = req?.query;
  const brandSelected = await Brand.findOne({ brand, isDeleted: false }).lean();
  await genderBrandFilter("brand", brandSelected, req, res);
});

//get Brand Page in admin side
const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find().lean();
  res.render("admin/brand", {
    admin: true,
    brands,
    adminInfo: req?.user,
    __active: "brands",
  });
});

//add Brands
const getAddBrand = asyncHandler(async (req, res) => {
  res.render("admin/addBrand", { admin: true, adminInfo: req.user });
});

//add Brands
const addBrand = asyncHandler(async (req, res) => {
  const existBrand = await Brand.findOne({
    brand: new RegExp("^" + req?.body?.brand + "$", "i"),
  });
  if (existBrand) {
    req.flash("error_msg", `${req.body?.brand} already exists!`);
    return res.redirect("/admin/add-brand");
  }
  const brands = await Brand.create(req?.body);
  req.flash("success_msg", `${req?.body?.brand} added successfully!`);
  res.redirect("add-brand");
});

//display edit brand page
const getEditBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  const brand = await Brand.findById(id).lean();
  res.render("admin/editBrand", { admin: true, brand, adminInfo: req?.user });
});

const editBrand = asyncHandler(async (req, res) => {
  const { brandId } = req.body; // Extract brand ID from request body

  // Validate brandId before proceeding
  validateMongodbId(brandId); // Ensure brandId is a valid MongoDB ID format

  // Attempt to update the brand
  const result = await Brand.updateOne({ _id: brandId }, req.body);

  // Check if the brand was found and updated
  if (result.modifiedCount === 0) {
    req.flash("error_msg", "Brand not found or no changes made!"); // Flash error message
    return res.redirect("/admin/brands"); // Redirect to brands page
  }

  req.flash("success_msg", "Brand edited successfully!"); // Flash success message
  res.redirect("/admin/brands"); // Redirect to brands page
});

//delete Brand
const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  const brand = await Brand.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!brand) {
    req.flash("error_msg", "Brand is not found!");
    return res.redirect("/admin/brands");
  }
  await Product.updateMany(
    { brand, isDeleted: false },
    { $set: { isDeletedBy: true } }
  );
  req.flash("success_msg", "Brand deleted successfully!");
  res.redirect("/admin/brands");
});

const restoreBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);

  const brand = await Brand.findByIdAndUpdate(
    id,
    { isDeleted: false },
    { new: true }
  );
  const products = await Product.find({ brand: brand?._id, isDeleted: false })
    .populate({ path: "category", match: { isDeleted: false } })
    .exec();

  // Update isDeletedBy field for the fetched products
  products?.forEach(async (product) => {
    if (product?.category && product?.category?.isDeleted === false) {
      product.isDeletedBy = false;
      await product.save();
    }
  });
  req.flash("success_msg", "Brand restored successfully!");
  res.redirect("/admin/categories");
});

module.exports = {
  getBrand,
  getAllBrands,
  getAddBrand,
  addBrand,
  deleteBrand,
  editBrand,
  getEditBrand,
  restoreBrand,
};
