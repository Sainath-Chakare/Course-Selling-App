const {z} = require("zod");
const dotenv = require("dotenv");
dotenv.config();

module.exports.signupValidation = (req,res,next) =>{
    const schema = z.object({
        email: z.string().email(),
        password: z.string(),
        firstName: z.string(),
        lastName: z.string()
    })
    let {success, error} = schema.safeParse(req.body);
    if(success){
        next();
    }else{
        return res.json({message: error.issues});
    }
}