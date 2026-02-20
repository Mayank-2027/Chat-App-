import User from "../models/user.model.js"
import bcrypt from "bcrypt"
import {generateToken} from "../lib/utils.js"
import cloudinary from "../lib/cloudinary.js"

//to signup
export const signup = async (req,res)=>{
    const {fullName,email,password}=req.body;

       try{ 
        if(!fullName || !email || !password){
           return res.status(400).json({message:"All fields are required"})
        }
        if(password.length < 6){
           return res.status(400).json({message:"Password must be at least 6 characters"})
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({success:false,message:"User already exist"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt)

        const newUser = new User({
            fullName,
            email,
            password:hashPassword,
        });
        if(newUser){
            generateToken(newUser._id,res);
            await newUser.save();

            res.status(201).json({
             _id:newUser._id,
             fullName:newUser.fullName,
             email:newUser.email,
             profilePic :newUser.profilePic
            });
            
        }else{
            return res.status(400).json({success:false,message:"invalid user"})
        }
       }catch(error){
        console.log("Error in signup Controller",error.message);
        res.status(500).json({message : "Internal Server Error"});

       }};
    
      
//To login
export const login=async(req,res)=>{
    const {email,password}=req.body;
        try{
            const user = await User.findOne({email});
            if(!user){
                return res.status(400).json({message:"Invalid Credential"});
            }
            const isPasswordCorrect= await bcrypt.compare(password,user.password);
            if(!isPasswordCorrect){
                return res.status(400).json({message : "Invalid Credential"})
            }

            generateToken(user._id,res);
            res.status(200).json({
                _id:user._id,
                fullName:user.fullName,
             email:user.email,
             profilePic :user.profilePic

            })
        }catch(error){
            console.log("Error in logic Controller ",error.message);
            res.status(500).json({success :false,message : "Internal Server Error"})
        }
    }
    

    
// to logout profile
export const logout= (req,res)=>{
        try{
            res.cookie("jwt","",{maxAge :0});
            res.status(200).json({message:"Logged Out Successfully"});
        }catch(error){
            res.status(500).json({message:"Internal server error"});
            console.log("Error in logout controller",error.message)
        }
    }

    // to upload profile pic
 export const updateProfile = async(req,res)=>{
    try{
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({message:"Profile Pic is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updateUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true}).select("-password");

        res.status(200).json(updateUser);
    }catch(error){
        console.log("Error in Update Profile",error.message);
        res.status(500).json({message:"Error in adding Profile Pic"});

    }
   }

   //TO check after reloading
export const checkAuth=(req,res)=>{
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log('Error in checkAuth controller',error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}
