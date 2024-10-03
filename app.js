const express = require("express");
const {userRouter} = require("./routes/user.js");
const {courseRouter} = require("./routes/course.js");
const {adminRouter} = require("./routes/admin.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const cookieParser = require('cookie-parser');
dotenv.config();
const app = express();

app.engine('ejs', ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());

app.use("/api/v1/user",userRouter);
app.use("/api/v1/course",courseRouter);
app.use("/api/v1/admin",adminRouter);

async function main(){
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");
        app.listen(3000,()=>{console.log("Listening on port 3000")});
    }catch (error) {
        console.error("Error connecting to the database:", error);
    }
}
main();