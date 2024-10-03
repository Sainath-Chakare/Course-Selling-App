let {Router} = require("express");
const userRouter = Router();
const {User, Purchase, Course} = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {userAuth} = require("../middleware/user");
const {signupValidation} = require("../middleware/signup");
const {signinValidation} = require("../middleware/signin");

userRouter.get("/signup",(req,res)=>{
    let admintoken = req.cookies.admintoken;
    let usertoken = req.cookies.usertoken;
    res.render("signup.ejs",{role:"user",usertoken,admintoken});
})

userRouter.get("/signin",(req,res)=>{
    let admintoken = req.cookies.admintoken;
    let usertoken = req.cookies.usertoken;
    res.render("signin.ejs",{role:"user",usertoken,admintoken});
})

userRouter.post("/signup", signupValidation, async (req,res)=>{
    let {email,password,firstName,lastName} = req.body;
    const alreadyExists = await User.findOne({email});
    if(alreadyExists){
        return res.json({message:"Email already Exists"});
    }
    try{
        let hashedPassword = await bcrypt.hash(password,5);
        await User.create({email,password: hashedPassword,firstName,lastName});
        return res.redirect("/api/v1/user/signin");
        // return res.json({message:"User has signed up"});
    }catch(err){
        res.json({message: err.message});
    }
})

userRouter.post("/signin", signinValidation, async (req,res)=>{
    let {email,password} = req.body;
    try{
        let user = await User.findOne({email});
        if(!user){return res.json({message: "No such user exists"})};
        let compare = await bcrypt.compare(password,user.password);
        if(compare){
            const token = jwt.sign({userId: user._id},process.env.JWT_TOKEN_USER);
            res.cookie('usertoken', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
            return res.redirect("/api/v1/course/preview");
            // res.json({token,message:"User has successfully signed in"});
        }else{
            res.json({message:"Failed to signin. Enter correct details or signup first"});
            return;
        }
    }catch(err){
        res.json({message:err.message});
    }
})

userRouter.post("/logout", userAuth, (req,res) =>{
    res.clearCookie('usertoken');
    res.redirect("/api/v1/course/preview");
})

// Show all purchases of the user
userRouter.get("/purchases",userAuth, async (req,res)=>{
    let userId = req.userId;
    try{
        // let purchases = await Purchase.find({userId}).populate('courseId','userId'); 
        // let courseTitles = purchases.map((purchase) => purchase.courseId.title);
        // res.json(courseTitles);

        // let purchases = await Purchase.find({userId});
        // let courseData = await Course.find({_id:{$in: purchases.map((purchase) => purchase.courseId)}}).select('title price');
        // res.json(courseData);

        let purchases = await Purchase.find({userId});
        let courses = await Course.find({_id:{$in: purchases.map((purchase) => purchase.courseId)}});
        let usertoken = req.cookies.usertoken;
        let admintoken = req.cookies.admintoken;
        res.render("purchases.ejs",{courses,usertoken,admintoken});
    }catch(err){
        res.json({message:err.message});
    }
})

module.exports = {userRouter};