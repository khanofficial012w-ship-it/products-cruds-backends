const express = require("express");
const { createProduct } = require("../controllers/category.controller");
const router = express.Router();

router.post("/create", createProduct);

module.exports = router;
