const {Router} = require("express");
const courseRouter = Router();
const {Course, Purchase} = require("../db");
const {userAuth} = require("../middleware/user");
const jwt = require("jsonwebtoken");

// Show all available courses
courseRouter.get("/preview", async (req,res)=>{
    try{
        let courses = await Course.find({});
        // res.json(courses);
        let purchasedIds = [];
        let usertoken = req.cookies.usertoken;
        let admintoken = req.cookies.admintoken;
        if(usertoken){
            try{
                let decodedData = jwt.verify(usertoken,process.env.JWT_TOKEN_USER);
                req.userId = decodedData.userId;
                let purchases = await Purchase.find({userId: req.userId});
                purchasedIds = purchases.map((purchase) => purchase.courseId.toString());
            }catch(err){
                res.json({message: err.message});
            }
        }
        res.render("preview.ejs",{usertoken,admintoken,courses,purchasedIds});
    }catch(err){
        res.json({message:err.message});
    }
})

// Purchase a course
courseRouter.post("/purchase/:courseId", userAuth, async (req,res)=>{
    let userId = req.userId;
    let {courseId} = req.params;
    try{
        const bought = await Purchase.findOne({userId,courseId});
        if(bought){
            return res.json({message:"You have already bought this course",courseId});
        }else{
            await Purchase.create({userId,courseId});
            // res.json({message:"You have successfully bought this course",courseId});
            res.redirect("/api/v1/user/purchases");
        }
    }catch(err){
        res.json({message:err.message});
    }
})

module.exports = {courseRouter};