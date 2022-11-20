const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const multer = require("multer");
const Auth = require("../middlewares/auth.js");
const functions = require("../controllers/controllers");
//images storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, "./public/images") },
    filename: function (req, file, cb) { cb(null, file.originalname) }
})
const upload = multer({ storage: storage });
//for getting data from encrypted sent data
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());





//routing pages
router.get("/", (req, res) => { res.render("home"); });

router.get("/report", functions.generteReport);

router.get("/signIn", (req, res) => { res.render("signIn"); });
router.post("/signIn", functions.signin);

router.get("/signUp", (req, res) => { res.render("signUp"); });

router.post("/signUp",functions.signup);
router.get("/changerequest", (req, res) => { res.render("changerequest"); });
router.post("/changerequest",functions.changerequest);
router.get("/updatepassword", (req, res) => { res.render("updatepassword"); });
router.post("/updatepassword",functions.updatepassword);

router.post("/codeVerify",functions.codeverification );


router.post("/RegisterUser",functions.register);



//fetching details from database to show user
router.get("/view", Auth, functions.adminview);
//routing for userview
router.get("/userview",functions.userview);

//horizontal view
router.get("/horizontal",functions.horizontal);
//table view
router.get("/Table",functions.table);
//search
router.get("/search", (req, res) => { res.render("search"); });
router.post('/search', functions.search);

router.get("/add", (req, res) => { res.render("add"); });

//saving data in database
router.post('/add', Auth, upload.single("img"), functions.add);
//deletion
router.get("/view/:id", Auth,functions.deletetion );
//updations
router.get("/update/:id", Auth,functions.selection_update);
router.post("/update/:id", Auth, upload.single("img"),functions.update );

//filtering

router.get("/view/Sorting/:sorting/:page", functions.sort);

router.get("/view/description:dept/:page", functions.cat_sort);

module.exports = router;