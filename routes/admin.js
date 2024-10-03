const {Router} = require("express");
const adminRouter = Router();
const {Admin, Course} = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {adminAuth} = require("../middleware/admin");
const {signupValidation} = require("../middleware/signup");
const {signinValidation} = require("../middleware/signin");

adminRouter.get("/options",(req,res)=>{
    let admintoken = req.cookies.admintoken;
    let usertoken = req.cookies.usertoken;
    res.render("admin-options",{admintoken,usertoken});
})

adminRouter.get("/signup",(req,res)=>{
    let admintoken = req.cookies.admintoken;
    let usertoken = req.cookies.usertoken;
    res.render("signup.ejs",{role:"admin",admintoken, usertoken});
})

adminRouter.get("/signin",(req,res)=>{
    let admintoken = req.cookies.admintoken;
    let usertoken = req.cookies.usertoken;
    res.render("signin.ejs",{role:"admin",admintoken,usertoken});
})

adminRouter.post("/signup", signupValidation, async (req,res)=>{
    if(req.cookies.usertoken) res.clearCookie('usertoken');
    let {email,password,firstName,lastName} = req.body;
    const alreadyExists = await Admin.findOne({email});
    if(alreadyExists){
        return res.json({message:"Email already Exists"});
    }
    try{
        let hashedPassword = await bcrypt.hash(password,5);
        await Admin.create({email,password: hashedPassword,firstName,lastName});
        return res.redirect("/api/v1/admin/signin");
        // return res.json({message:"Admin has signed up"});
    }catch(err){
        res.json({message: err.message});
    }
})

adminRouter.post("/signin", signinValidation, async (req,res)=>{
    if(req.cookies.usertoken) res.clearCookie('usertoken');
    let {email,password} = req.body;
    try{
        const admin = await Admin.findOne({email});
        if(!admin) res.json({message:"No such admin exists"})
        let compare = await bcrypt.compare(password,admin.password);
        if(compare){
            let token = jwt.sign({adminId:admin._id},process.env.JWT_TOKEN_ADMIN);
            res.cookie('admintoken',token,{httpOnly:true,maxAge:24*60*60*1000});
            return res.redirect("/api/v1/admin/course/bulk");
            // localStorage.setItem("admintoken",token);
            // return res.json({token,message:"Admin has successfully signed in"});
        }else{
            return res.json({message:"Failed to signin. Enter correct details or signup first"});
        }
    }catch(err){
        res.json({message: err.message});
    }
})

adminRouter.use(adminAuth);

adminRouter.post("/logout", (req,res) =>{
    res.clearCookie('admintoken');
    res.redirect("/api/v1/course/preview");
})

adminRouter.get("/course",async (req,res)=>{
    let usertoken = req.cookies.usertoken;
    let admintoken = req.cookies.admintoken;
    res.render("new.ejs",{usertoken,admintoken});
})

// Add a new Course
adminRouter.post("/course",async (req,res)=>{
    let {title,description,imageUrl,price} = req.body;
    try{
        const course = await Course.create({title,description,imageUrl,price,creatorId:req.adminId});
        // res.json({message: "New Course has been added", courseId: course._id});
        res.redirect("/api/v1/admin/course/bulk");
    }catch(err){
        res.json({message: err.message});
    }
})

// Get all Courses
adminRouter.get("/course/bulk",async (req,res)=>{
    try{
        let courses = await Course.find({creatorId:req.adminId});
        // res.json(courses);
        let usertoken = req.cookies.usertoken;
        let admintoken = req.cookies.admintoken;
        res.render("allcourses.ejs",{courses,usertoken,admintoken});
    }catch(err){
        res.json({message:err.message});
    }
})

adminRouter.get("/course/:courseId", async (req,res)=>{
    let {courseId} = req.params;
    try{
        let course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({message: "Course not found"});
        }
        let usertoken = req.cookies.usertoken;
        let admintoken = req.cookies.admintoken;
        res.render("edit.ejs",{course,usertoken,admintoken});
    }catch(err){
        res.json({message:err.message});
    }
})

// Edit any Course
adminRouter.put("/course/:courseId",async (req,res)=>{
    let {courseId} = req.params;
    let {title,description,imageUrl,price} = req.body;
    try{
        let result = await Course.updateOne(
            {_id:courseId,creatorId:req.adminId},
            {title,description,imageUrl,price}
        );
        // res.json({message: "Course Details has been updated", courseId})
        res.redirect("/api/v1/admin/course/bulk");
    }catch(err){
        res.json({message:err.message});
    }
})

module.exports = {adminRouter};