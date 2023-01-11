var express = require("express");
var router = express.Router();
const { viewSignin, actionSignin, actionSignout } = require("./controller");

router.get("/", viewSignin);
router.post("/", actionSignin);
router.get("/logout", actionSignout);

module.exports = router;
