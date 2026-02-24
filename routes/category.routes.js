const express = require("express");
const { createCategory } = require("../controllers/category.controller");
const router = express.Router();

router.post("/create", createCategory);

module.exports = router;
