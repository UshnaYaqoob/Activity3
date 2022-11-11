const express= require('express');
const router = express.Router();
const mysql = require("mysql");
const bodyParser = require("body-parser");//when you submit form and sending encrypted data and you want to retrieve data from that encrypted form for this we use body parser,e.g post method
const multer = require("multer");//
//const pdf=require("html-pdf");
//const fs =require("fs");
//const { application } = require('express');
//const options={format:"A4"};

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, "./public/images") },
    filename: function (req, file, cb) { cb(null, file.originalname) }
})
const upload = multer({ storage: storage });

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "web_programming"
});

connection.connect(function (err) {
    if (err) {
        console.log("Database Connection Failed!");
        throw err;
    }
    else {
        console.log("Database Connected!");
    }
});

router.get("/", (req, res) => { res.render("Home"); });
router.get("/SignIn", (req, res) => { res.render("SignIn"); });
//retreving data from database

router.post("/SignIn", (req, res) => {

    const UserName = req.body.username;
    const Password = req.body.password;


    const Query = `SELECT UserName, Password FROM users WHERE UserName = '${UserName}' AND Password = '${Password}'`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
            res.redirect("product");
    
    })
});

router.get("/signup", (req, res) => { res.render("signup"); });
//send data to data base 
router.post('/signup', (req, res) => {


    const name = req.body.username;
    const Email = req.body.email;
    const password = req.body.password;

    const Query = `INSERT INTO users VALUES('${name}','${password}')`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
        res.redirect("product");
    })

});

//fetching details from database to show user
/*router.get('/product', (req, res) => {
    const Query = "SELECT * from Products";
    connection.query(Query, function (err, result) {
        if (err) throw err;


        res.render("Products/product", { data: result });
    })
});*/

router.get("/add", (req, res) => { res.render("add"); });
//saving data in database
router.post('/add', upload.single("img"), (req, res) => {

    if (!req.file) {
        return req.statusCode(404).send("No File Recieved!");
    }

    const pid = req.body.pid;
    const Name = req.body.Name;
    const price = req.body.price;
    const img = req.file.originalname;
  const des=req.body.Description;
    const Query = `INSERT INTO PRODUCTS  ( pid, Name, price, img,Description) VALUES ('${pid}','${Name}','${price}','${img}', '${des}')`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
        res.redirect("product");
    })
});

//deleting from database
router.get("/product/:id", (req, res) => {
    const id = req.params.id;
    const Query = `DELETE FROM PRODUCTS WHERE pid = '${id}'`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
        res.redirect("/product");
    })
});

router.get("/update/:id", (req, res) => {
    const id = req.params.id;
    const Query = `SELECT * from Products WHERE pid = '${id}'`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
        res.render("update", { data: result });
    })
});

router.post("/update/:id", upload.single("img"), (req, res) => { 
    if (!req.file) {
        return req.statusCode(404).send("No File Recieved!");
    }

    const pid = req.params.id;
    const Name = req.body.Name;
    const price = req.body.price;
    const des=req.body.Description;
    const img = req.file.originalname;

    const Query = `UPDATE PRODUCTS SET Name = '${Name}', price = '${price}', img = '${img}', Description = '${des}' WHERE pid = '${pid}'`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
        res.redirect("/product");
    }) 
});
//fetching details from database to show user
router.get("/product", (req, res) => {
    const dataCountQuery = "SELECT COUNT(*) FROM products";
    connection.query(dataCountQuery, function(err,result){
        if(err) throw err;

        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.query.page ? req.query.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 4;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount/dataPerPages);

        
        const Query = `SELECT * FROM products LIMIT ${startLimit}, ${dataPerPages}`;
        connection.query(Query, function(err,result){
            if(err) throw err;
            // res.send(result);
            res.render( "product", 
                 {
                    data: result,
                    pages: totalPages,
                    CurrentPage: pageNo,
                    lastPage: totalPages
                 }
            );
        })
    });
});
//search
router.get("/search", (req, res) => { res.render("search"); });
router.post('/search', (req, res) => {
    const username = req.body.sname;
    const dataCountQuery = `SELECT COUNT(*) FROM products where name like '%${username}%'`;
    connection.query(dataCountQuery, function(err,result){
        if(err) throw err;

        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.query.page ? req.query.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 4;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount/dataPerPages);

        // console.log(dataCount, "\n", pageNo, "\n",dataPerPages, "\n",startLimit, "\n",totalPages, "\n");

        const Query = `SELECT * FROM products where  name like '%${username}%' LIMIT ${startLimit}, ${dataPerPages} `;
        connection.query(Query, function(err,result){
            if(err) throw err;
            // res.send(result);
            res.render( "search", 
                 {
                    data: result,
                    pages: totalPages,
                    CurrentPage: pageNo,
                    lastPage: totalPages
                 }
            );
        })
    });
});
//routing for horizontal view
router.get("/horizontal", (req, res) => {
    const dataCountQuery = "SELECT COUNT(*) FROM products";
    connection.query(dataCountQuery, function(err,result){
        if(err) throw err;

        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.query.page ? req.query.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 4;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount/dataPerPages);


        const Query = `SELECT * FROM products LIMIT ${startLimit}, ${dataPerPages}`;
        connection.query(Query, function(err,result){
            if(err) throw err;
            // res.send(result);
            res.render( "horizontal", 
                 {
                    data: result,
                    pages: totalPages,
                    CurrentPage: pageNo,
                    lastPage: totalPages
                 }
            );
        })
    });
});
router.get("/Table", (req, res) => {
 
    const dataCountQuery = "SELECT COUNT(*) FROM products";
    connection.query(dataCountQuery, function(err,result){
        if(err) throw err;

        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.query.page ? req.query.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 4;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount/dataPerPages);

        // console.log(dataCount, "\n", pageNo, "\n",dataPerPages, "\n",startLimit, "\n",totalPages, "\n");

        const Query = `SELECT * FROM products LIMIT ${startLimit}, ${dataPerPages}`;
        connection.query(Query, function(err,result){
            if(err) throw err;
            // res.send(result);
            res.render( "Table", 
                 {
                    data: result,
                    pages: totalPages,
                    CurrentPage: pageNo,
                    lastPage: totalPages
                 }
            );
        })
    });
});
//filter By Catageory
router.get("/product/description/:Description/:page", (req, res) => {

    const dataCountQuery = "SELECT COUNT(*) FROM products";
    connection.query(dataCountQuery, function (err, result) {
        if (err) throw err;

        let description = req.params.Description;
        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.params.page ? req.params.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 4;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount / dataPerPages);

        const Query = `SELECT * FROM products where Description = '${description}' LIMIT ${startLimit}, ${dataPerPages} `;
        connection.query(Query, function (err, result) {
            if (err) throw err;
            res.render("product", {
                data: result,
                pages: totalPages,
                CurrentPage: pageNo,
                lastPage: totalPages
            });
        })
    })
});
//filter 
router.get("/product/Sorting/:sorting/:page", (req, res) => {

    const dataCountQuery = "SELECT COUNT(*) FROM products";
    connection.query(dataCountQuery, function (err, result) {
        if (err) throw err;

        let sorting = req.params.sorting;
        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.params.page ? req.params.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 4;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount / dataPerPages);

        const Query = `SELECT * FROM products ORDER BY pid ${sorting} LIMIT ${startLimit}, ${dataPerPages} `;
        connection.query(Query, function (err, result) {
            if (err) throw err;
            res.render("product", {
                data: result,
                pages: totalPages,
                CurrentPage: pageNo,
                lastPage: totalPages
            });
        })
    })
});
module.exports = router;
/*router.printdata=(req,res)=>{
    let selectquery="select * from products ";
  let totalproducts="select count(*) from products";
    connection.query(selectquery,(err,fields)=>{
        if(!err)
        res.render("products/print",
        {
        
            title:"Product",
        },
        function(err,html){
            pdf.create(html,options)
            .toFile("uploads/products.pdf"),function(err,result){
if(err)return console.log(err);
else{
    var product =fs.readFileSync("uploads/products.pdf")
    res.header("content-type", "application/pdf");
    res.send(product)
}
        }
    })
   
 
}*/

//           :(  :(