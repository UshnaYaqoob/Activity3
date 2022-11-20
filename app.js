const express =require('express');
const app=express();
const path =require('path');
const bodypaser=require('body-parser');
const multer=require('multer');
const mysql=require('mysql');
const routes=require('./routes/routes');
const cookieParser = require("cookie-parser");
const session = require('express-session');


 app.set('view engine','ejs');

 app.use(
    session({
        secret: "Ushna Yaqoob ",
        resave: false,
        saveUninitialized: true,
        cookie: { path: "/", httpOnly: true, secure: false, maxAge: 1 * 60 * 60 * 1000 },//session will expire after 1 hour
    })
);
app.use(cookieParser())
  
 const publicPath = path.join(__dirname, "/public");
 app.use(express.static(publicPath));

 app.use("/", routes);

 app.listen(3000, (err)=>{
    if(err) throw err;
    console.log(`Server Listening At Port 3000`);
})