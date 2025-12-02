const express = require("express");
const router = express.Router();

const controller = require("../controllers/role.controller");

// router.get("/", controller.index);
router.post("/create", controller.create);
router.get("/", controller.permissions);
router.get("/:id", controller.getById);
router.patch("/update/:id", controller.updatePermissions);

module.exports = router;
