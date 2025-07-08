const mongoose=require("mongoose");
const validator=require("validator");
const jwt=require("jsonwebtoken");
const bcrypt = require("bcrypt");


const userSchema=mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:4,
        maxLength:50
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String,
        lowercase:true,
        required:true,
        unique:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invaild email address :"+value)
            }
        }
        
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter a strong password :"+ value)
            }
        }
    },
    age:{
        type:Number,
        min:18
    },
    gender:{
        type:String,
        lowercase:true,
        enum:{
            values:["male","female","other"],
            message:`{VALUE} is not a valid gender type`,
        },
        // validate(value){
        //     if(!["male","female","others"].includes(value)){
        //         throw new Error("gender data is not valid");
        //     }
        // },
        
    },
        photoUrl: {
        type: String,
        default: "https://geographyandyou.com/images/user-profile.png",
       validate(value) {
  const isURL = validator.isURL(value);
  const isBase64 = value.startsWith("data:image/");

  if (!isURL && !isBase64) {
    throw new Error("Invalid Photo URL. Must be an image URL or base64 image.");
  }
}

        },

    about:{
        type:String,
        default:"Hi there! I'm new to this platform and thrilled to start my journey here. I'm passionate about learning, growing, and connecting with people who share similar interests and values. Whether it's collaborating on exciting projects, exchanging ideas, or simply making new friends, I'm always open to meaningful conversations. Let’s connect and inspire each other!"
    }, 
    skills:{
        type:[String]
    }
},{
    timestamps:true,
})



userSchema.methods.getJWT=async function (){
    const user=this;
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return token;
}

userSchema.methods.validatePassword=async function (passwordInputByUser){
    const user=this;
    const passwordHash=user.password;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser,passwordHash);
    return isPasswordValid;
}

const User =mongoose.model("User",userSchema);

module.exports = User;