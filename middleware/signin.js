const {z} = require("zod");
const dotenv = require("dotenv");
dotenv.config();

module.exports.signinValidation = (req,res,next) =>{
    const schema = z.object({
        email: z.string().email(),
        password: z.string(),
    })
    let {success, error} = schema.safeParse(req.body);
    if(success){
        next();
    }else{
        return res.json({message: error.issues});
    }
}