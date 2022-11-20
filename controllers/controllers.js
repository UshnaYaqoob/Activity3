const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const Auth = require("../middlewares/auth.js");
router.use(cookieParser());
const pdf = require("html-pdf");
const fs = require("fs");
const options = { format: "A4" };
const nodemailer = require("nodemailer");
const path = require("path");


//transporter
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.email",
    service: "gmail",
    auth: {
      user: "petsworld0290@gmail.com",
      pass: "zvrsrmzvoqiftdig",
    },
  });


//data base connection
const mysql = require("mysql");

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
})


//function for generating code
const generteReport = (req, res) => {

    const Query = `SELECT * FROM products`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
        // res.send(result);
        res.render("report",
            {
                data: result
            },
            function (err, html) {
                pdf
                    .create(html, options)
                    .toFile("PDF/productDetail.pdf", function (err, result) {
                        if (err) return console.log(err);
                        else {
                            var allusersPdf = fs.readFileSync("PDF/productDetail.pdf");
                            res.header("content-type", "application/pdf");
                            res.send(allusersPdf);
                            transporter.sendMail
                                ({
                                    from: '"Ushna Yaqoob" <petsworld0290@gmail.com>',
                                    to: "ushnayaqoob753@gmail.com",
                                    subject: "Products Report",
                                    text: "Hello world?",
                                    html: `<h1>Products Report</h1>
                                       <p>This is Products Report!</p>`,
                                    attachments: [
                                        {
                                            filename: 'productDetail.pdf',
                                            path: path.join(__dirname, "../PDF/productDetail.pdf")
                                        }]
                                });

                        }
                    })

            })
    });
}
//function for sign in
const signin =(req, res) => {

    const UserName = req.body.uname;
    const Password = req.body.psw;
    const Role = req.body.role;

    let TableName = "";
    Role == "admin" ? TableName = "ADMIN" : TableName = "USER";

    console.log(Role, " ", UserName, " ", Password, " ", TableName);

    const Query = `SELECT UserName, Password FROM ${TableName} WHERE UserName = '${UserName}' AND Password = '${Password}'`;
    connection.query(Query, function (err, result, fields) {
        if (err) throw err;
        if (result.length > 0) {

            if (Role == "admin") {
                const admin = { username: UserName, password: Password };
                req.session.admin = admin;
                res.cookie("CurrentRole", "Admin");
                res.redirect("/view");
            }
            else if (Role == "user") {
                const user = { username: UserName, password: Password };
                req.session.user = user;
                res.cookie("CurrentRole", "User");
                res.redirect("/userView");
            }

        }
        else {
            res.send("Invalid Name or password");
        }
    })
}
//function for signup
const signup=(req, res) => {

    const username = req.body.username;
    const Email = req.body.email;
    const password = req.body.password;

    const user = {UserName:username, Email:Email,Password:password};
    req.session.newUser = user;

    const code = "f200209";

    req.session.code = code;

    let mail = transporter.sendMail({
        from: '"Ushna Yaqoob" <petsworld0290@gmail>',
        to: `${Email}`,
        subject: "Verification Code",
        text: "Hello world?",
        html: `<h1>PetsWorld Verification Code!</h1>
               <p><b>Your Code is : ${code}</b></p>`
    });
    res.render("codeVerify");
}
//function for code verification
const codeverification=(req, res) => {
    const Code = req.body.code;
   
    if (Code.toString() == req.session.code.toString()) {
        res.redirect(307,"/RegisterUser");
    }
    else {
        req.session.code = null;
        res.send("Wrong Verification Code!\nTry To SignUp Again...");
    }


}
//password change Request
const changerequest=(req, res) => {

  
    const Email = req.body.email;
    

    const user = {Email:Email};
    req.session.newUser = user;

    const code = "200190";

    req.session.code = code;

    let mail = transporter.sendMail({
        from: '"Ushna" <petsworld0290@gmail>',
        to: `${Email}`,
        subject: "Password updation Verification Code",
        text: "Hello world?",
        html: `<h1>PetsWorld Verification Code!</h1>
               <p><b>Your Code is : ${code}</b></p>`
    });
    res.render("updatepassword");
};
//update password
const updatepassword=(req,res)=>
{
    const username = req.body.username;
    const code1 = req.body.code;
    const password = req.body.password;
    const user = {UserName:username,Password:password};
    req.session.newUser = user;

    const code = "200190";

    req.session.code = code;
    const Query = `SELECT * from admin WHERE UserName = '${username}'`;
    connection.query(Query, function (err, result, fields) {
        if (err) throw err;
        if (result.length > 0) {
            if (code1!=code){
                res.send('Invalid Verification Code')
            }
        
            else{
                const Query1 = `UPDATE admin SET password = '${password}' WHERE username = '${username}'`;
                connection.query(Query1, function (err, result) {
                    if (err) throw err;
                    res.redirect("/signIn");
                })
            }
           
        }
        else{
            res.send('Wrong details')
        }
    })
}


//register user as Admin
const register=(req, res) => {

    const data = req.session.newUser;

    const username = data.UserName;
    const Email = data.Email;
    const password = data.Password;

    const Query = `INSERT INTO ADMIN VALUES('${username}','${password}')`;
    connection.query(Query, function (err, result) {
        if (err) throw err;
        res.redirect("/signIn");
    })

}
//admin view
const adminview=(req, res) => {
    const dataCountQuery = "SELECT COUNT(*) FROM products";
    connection.query(dataCountQuery, function (err, result) {
        if (err) throw err;

        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.query.page ? req.query.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 4;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount / dataPerPages);

        // console.log(dataCount, "\n", pageNo, "\n",dataPerPages, "\n",startLimit, "\n",totalPages, "\n");

        const Query = `SELECT * FROM products LIMIT ${startLimit}, ${dataPerPages}`;
        connection.query(Query, function (err, result) {
            if (err) throw err;
            // res.send(result);
            res.render("view",
                {
                    data: result,
                    pages: totalPages,
                    CurrentPage: pageNo,
                    lastPage: totalPages
                }
            );
        })
    });
}
//user view
const userview= (req, res) => {
    const dataCountQuery = "SELECT COUNT(*) FROM products";
    connection.query(dataCountQuery, function (err, result) {
        if (err) throw err;

        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.query.page ? req.query.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 2;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount / dataPerPages);

        // console.log(dataCount, "\n", pageNo, "\n",dataPerPages, "\n",startLimit, "\n",totalPages, "\n");

        const Query = `SELECT * FROM products LIMIT ${startLimit}, ${dataPerPages}`;
        connection.query(Query, function (err, result) {
            if (err) throw err;
            // res.send(result);
            res.render("userview",
                {
                    data: result,
                    pages: totalPages,
                    CurrentPage: pageNo,
                    lastPage: totalPages
                }
            );
        })
    });
}
//horizontal view
const horizontal= (req, res) => {
    const dataCountQuery = "SELECT COUNT(*) FROM products";
    connection.query(dataCountQuery, function (err, result) {
        if (err) throw err;

        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.query.page ? req.query.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 4;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount / dataPerPages);

        // console.log(dataCount, "\n", pageNo, "\n",dataPerPages, "\n",startLimit, "\n",totalPages, "\n");

        const Query = `SELECT * FROM products LIMIT ${startLimit}, ${dataPerPages}`;
        connection.query(Query, function (err, result) {
            if (err) throw err;
            // res.send(result);
            res.render("horizontal",
                {
                    data: result,
                    pages: totalPages,
                    CurrentPage: pageNo,
                    lastPage: totalPages
                }
            );
        })
    });
}
//table view
const table =(req, res) => {

    const dataCountQuery = "SELECT COUNT(*) FROM products";
    connection.query(dataCountQuery, function (err, result) {
        if (err) throw err;

        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.query.page ? req.query.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 4;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount / dataPerPages);

        // console.log(dataCount, "\n", pageNo, "\n",dataPerPages, "\n",startLimit, "\n",totalPages, "\n");

        const Query = `SELECT * FROM products LIMIT ${startLimit}, ${dataPerPages}`;
        connection.query(Query, function (err, result) {
            if (err) throw err;
            // res.send(result);
            res.render("Table",
                {
                    data: result,
                    pages: totalPages,
                    CurrentPage: pageNo,
                    lastPage: totalPages
                }
            );
        })
    });
}
//search
const search=(req, res) => {
    const username = req.body.sname;
    const dataCountQuery = `SELECT COUNT(*) FROM products where Name like '%${username}%'`;
    connection.query(dataCountQuery, function (err, result) {
        if (err) throw err;

        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.query.page ? req.query.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 4;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount / dataPerPages);

        const Query = `SELECT * FROM products where name like '%${username}%' LIMIT ${startLimit}, ${dataPerPages}`;
        connection.query(Query, function (err, result) {
            if (err) throw err;
            // res.send(result);
            res.render("view",
                {
                    data: result,
                    pages: totalPages,
                    CurrentPage: pageNo,
                    lastPage: totalPages
                }
            );
        })
    });
}

const add =(req, res) => {

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
    res.redirect("view");
})
}
//update
const selection_update= (req, res) => {
  const id = req.params.id;
  const Query = `SELECT * from Products WHERE pid = '${id}'`;
  connection.query(Query, function (err, result) {
      if (err) throw err;
      res.render("update", { data: result });
  })
}
const update=(req, res) => {

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
    res.redirect("/view");
}) 
}

const sort=(req, res) => {

    const dataCountQuery = "SELECT COUNT(*) FROM products";
    connection.query(dataCountQuery, function (err, result) {
        if (err) throw err;

        let sorting = req.params.sorting;
        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.params.page ? req.params.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 4;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount / dataPerPages);

        const Query = `SELECT * FROM products ORDER BY user_id ${sorting} LIMIT ${startLimit}, ${dataPerPages} `;
        connection.query(Query, function (err, result) {
            if (err) throw err;
            res.render("view", {
                data: result,
                pages: totalPages,
                CurrentPage: pageNo,
                lastPage: totalPages
            });
        })
    })
}
//sorting according to catagoery
const cat_sort=(req, res) => {

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
          res.render("view", {
              data: result,
              pages: totalPages,
              CurrentPage: pageNo,
              lastPage: totalPages
          });
      })
  })
}
//deletion
const deletetion=(req, res) => {
  const id = req.params.id;
  const Query = `DELETE FROM PRODUCTS WHERE pid = '${id}'`;
  connection.query(Query, function (err, result) {
      if (err) throw err;
      res.redirect("/view");
  })
}

module.exports = {
    generteReport,
    signin,
    signup,
    codeverification,
    register,
    changerequest,
    updatepassword,
    adminview,
    userview,
    horizontal,
    table,
    search,
    add,
    update,
    sort,
    cat_sort,
    deletetion,
    selection_update
}