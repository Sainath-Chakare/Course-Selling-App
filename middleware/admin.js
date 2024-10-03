const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports.adminAuth = (req,res,next) =>{
    // let token = req.headers.token;
    let token = req.cookies.admintoken;
    if(!token){
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    try{
        let decodedData = jwt.verify(token,process.env.JWT_TOKEN_ADMIN);
        req.adminId = decodedData.adminId;
        next();
    }catch(err){
        res.json({message:err.message});
    }
}