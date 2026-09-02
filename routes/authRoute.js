var express = require('express');
const {signUp, signIn, signOut, refreshToken} = require("../controllers/authController")

var router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signOut", signOut);

router.post("/refresh", refreshToken)

module.exports = router;