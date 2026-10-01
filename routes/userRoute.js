const express = require("express")
const { authMe, test } = require("../controllers/userController");

var router = express.Router();

router.get("/me", authMe); 


router.get("/test", test); 

module.exports = router;