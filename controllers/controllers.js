/*const mysql = require("mysql");
const util = require("util");
const pdf = require("html-pdf");
const fs = require("fs");
const options = { format: "A4" };


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
exports.pagging = (req, res) => {
    const dataCountQuery = "SELECT COUNT(*) FROM products";
    connection.query(dataCountQuery, (err, result, fields) => {

          if(err) throw err;  
          let dataCount = result[0]["COUNT(*)"];
          let pageNo = req.query.page ? req.query.page : 1;
          let dataPerPages = req.query.data ? req.query.data : 3;
          let startLimit = (pageNo - 1) * dataPerPages;
          let totalPages = Math.ceil(dataCount/dataPerPages);
  
      //res.send(`${movieCount}`);
      let selectQuery = `SELECT * FROM movietable 
    LIMIT ${startLimit}, ${moviesPerPage}`;
      connection.query(selectQuery, (err, product, fields) => {
        if (!err)
          res.render("Products/product", {
            product,
            title: "product",
            dataCount,
            dataPerPages,  
            data: result,
            pages: totalPages,
            CurrentPage: pageNo,
            lastPage: totalPages       
               
          });
        else console.log(err);
      });
    });
  };
 
 
  exports.getMovie = (req, res) => {
    mysqlConnection.query(
      "SELECT * FROM `movietable` WHERE `MovieId` = " + req.query.id,
      (err, movie, fields) => {
        if (!err) {
          if (Object.keys(movie).length > 0)
            res.render("movies/movieDetails", { movie, title: "Movies" });
          else res.send("Not found required movie");
        } else console.log(err);
      }
    );
  };
router.post("/SignIn", (req, res) => {

    const UserName = req.body.username;
    const Password = req.body.password;


    const Query = `SELECT UserName, Password FROM users WHERE UserName = '${UserName}' AND Password = '${Password}'`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
            res.redirect("/product");
    
    })
});
router.post('/signup', (req, res) => {


    const name = req.body.username;
    const Email = req.body.email;
    const password = req.body.password;

    const Query = `INSERT INTO users VALUES('${name}','${password}')`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
        res.redirect("/product");
    })

});
outer.get('/product', (req, res) => {
    const Query = "SELECT * from Products";
    connection.query(Query, function (err, result) {
        if (err) throw err;


        res.render("Products/product", { data: result });
    })
});
router.post('/add', upload.single("img"), (req, res) => {

    if (!req.file) {
        return req.statusCode(404).send("No File Recieved!");
    }

    const pid = req.body.pid;
    const Name = req.body.Name;
    const price = req.body.price;
    const img = req.file.originalname;

    const Query = `INSERT INTO PRODUCTS  ( pid, Name, price, img) VALUES ('${pid}','${Name}','${price}','${img}' )`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
        res.redirect("Products/product");
    })
});
router.get("/product/:id", (req, res) => {
    const id = req.params.id;
    const Query = `DELETE FROM PRODUCTS WHERE pid = '${id}'`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
        res.redirect("Products/product");
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
    const img = req.file.originalname;

    const Query = `UPDATE PRODUCTS SET Name = '${Name}', price = '${price}', img = '${img}' WHERE pid = '${pid}'`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
        res.redirect("Products/product");
    }) 
});
*/