const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports.userAuth = (req,res,next) =>{
    // let token = req.headers.token;
    let token = req.cookies.usertoken;
    if(!token){
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    try{
        let decodedData = jwt.verify(token,process.env.JWT_TOKEN_USER);
        req.userId = decodedData.userId;
        next();
    }catch(err){
        return res.json({message:err.message});
    }
}