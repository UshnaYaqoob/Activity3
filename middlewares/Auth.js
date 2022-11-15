const Auth = (req, res, next) => {
    if (!req.session.admin) {
        return res.redirect("/signIn");
    }
    next();
};


module.exports=Auth;