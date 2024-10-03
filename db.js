const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    firstName:{type:String, required:true},
    lastName:{type:String, required:true}
})

const courseSchema = new Schema({
    title:{type:String, required:true, unique:true},
    description:{type:String, required:true},
    imageUrl:{type:String},
    price:{type:Number, required:true},
    creatorId:{type:ObjectId, ref:'Admin'}
})

const adminSchema = new Schema({
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    firstName:{type:String, required:true},
    lastName:{type:String, required:true}
})

const purchaseSchema = new Schema({
    courseId:{type:ObjectId, ref:'Course'},
    userId:{type:ObjectId, ref:'User'}
})


const User = mongoose.model('User',userSchema);
const Course = mongoose.model('Course',courseSchema);
const Admin = mongoose.model('Admin',adminSchema);
const Purchase = mongoose.model('Purchase',purchaseSchema);


module.exports = {User,Course,Admin,Purchase};