import Profile from "../models/profile.models.js";
import User from "../models/user.models.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import ConnectionRequest from "../models/connections.model.js";
import { error } from "console";

const convertUserDataToPD = (userData) => {
    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(16).toString('hex') + '.pdf';
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.image(`uploads/${userData.userId.profilePicture}`, { align:"center",  width: 50 });

   doc.fontSize(14).text(`name : ${userData.userId.name}`);
    doc.fontSize(14).text(`email : ${userData.userId.email}`);  
    doc.fontSize(14).text(`username : ${userData.userId.username}`);
    doc.fontSize(14).text(`bio : ${userData.userId.username}`);
    doc.fontSize(14).text(`current_position : ${userData.current_position}`);
    doc.fontSize(14).text("pastWork :")
    userData.pastWork.forEach((work, index) => {
        doc.fontSize(12).text(`${index + 1}. Company: ${work.company}, Position: ${work.position}, Years: ${work.years}`);
    });
    doc.end();
    return outputPath;



}




export const register = async (req, res) => {
  // Registration logic here
  try {
    const { name, username, email, password, profilePicture } = req.body;
    // Validate input
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
      profilePicture,
    });
    await newUser.save();
    // Create user profile
    const profile = new Profile({ userId: newUser._id });
    await profile.save();

    return res.json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

export const login = async (req, res) => {
  // Login logic here
    try {
        const{email, password} = req.body
        if(!email || !password){
            return res.status(400).json({message: "All fields are required"})
        }
        const user = await User.findOne({
            email
        });
        if(!user){
            return res.status(400).json({message: "Invalid credentials"})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid credentials"})
        }
        const token = crypto.randomBytes(32).toString('hex');
        await User.updateOne({_id: user._id}, {token});
        return res.json({token});

    }catch (error) {
        return res.status(500).json({message: error.message || "Server error"})
    }
        
    }   

    export const uploadProfilePicture = async (req, res) => {
        const {token} = req.body;

        try{
            const user = await User.findOne({token : token});
            if(!user){
                return res.status(400).json({message: "Invalid token"})
            }
            user.profilePicture = req.file.filename;
            await user.save();
            return res.json({message: "Profile picture updated successfully"});
        }catch (error) {
            return res.status(500).json({message: error.message || "Server error"})
        }
    }

    export const updateUserProfile = async (req, res) => {
        try{
            const {token, ...newUserData} = req.body;
            const user = await User.findOne({token : token});
            if(!user){
                return res.status(400).json({message: "Invalid token"})
            }
            const {username, email} = newUserData;
            const existingUser = await User.findOne({$or: [{username}, {email}], });
            if(existingUser){
                if(existingUser || String(existingUser._id) !== String(user._id )){
                return res.status(400).json({message: "User already exists with this username or email"})
                }
            }
            Object.assign(user, newUserData);
            await user.save();
            return res.json({message: "Profile updated successfully"}); 

        }catch (error) {
            return res.status(500).json({message: error.message || "Server error"})
        }           
    }


    export const getUserAndProfile = async (req, res) => {
        try{
            const {token} = req.body;
            const user = await User.findOne({token : token});
            if(!user){
                return res.status(404).json({message: "Invalid token"})
            }
            const userprofile = await Profile.findOne({userId: user._id})
                .populate('userId', 'name email username profilePicture ');  
            return res.json({ userprofile});                     
        }catch (error) {
            return res.status(500).json({message: error.message || "Server error"})
        }


    }   


    export const updateProfileData = async (req, res) => {
        try{
            const {token, ...newProfileData} = req.body;    
            const userProfile = await User.findOne({token : token});
            if(!userProfile){
                return res.status(404).json({message: "Invalid token"})

            }
            const profile_to_update= await Profile.findOne({userId: userProfile._id});
            if(!profile_to_update){
                return res.status(400).json({message: "Profile not found"})
            }
            Object.assign(profile_to_update, newProfileData);
            await profile_to_update.save();
            return res.json({message: "Profile updated successfully"}); 






        }catch (error) {
            return res.status(500).json({message: error.message || "Server error"})
        }
    }

export const getAllUsersProfiles = async (req, res) => {
    try{
        const profiles = await Profile.find()
            .populate('userId', 'name email username profilePicture');  
        return res.json({profiles});                     
    }catch (error) {
        return res.status(500).json({message: error.message || "Server error"})
    }
}

 export const downloadProfile = async (req, res) => {
    // To be implemented
    const user_id = req.query.user_id;

    const userProfile = await Profile.findOne({userId: user_id}).populate('userId', 'name email username profilePicture');

    let outputPath = await convertUserDataToPD(userProfile);

    return res.json({message: outputPath});

 } 

 export const sendConnectionRequest = async (req, res) => {
    // To be implemented
    const {token, connectionI} = req.body;
    try{
        const user = await User.findOne({token: token});
        if(!user){
            return res.status(404).json({message: "Invalid token"});
        }
        const connectionUser = await User.findById(connectionI);
        if(!connectionUser){
            return res.status(404).json({message: "User not found"});
        }

        const existingRequest = await connectionUser.findOne({userId: user._id, connectionId: connectionI});
        if(existingRequest){
            return res.status(400).json({message: "Connection request already sent"});
        }
        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionI
        });
        await request.save();
        return res.json({message: "Connection request sent successfully"});

    }catch (error){
        return res.status(500).json({message: error.message || "Server error"});
    }
    }

export const getMyConnectionsRequests = async (req, res) => {
    const {token} = req.body;
    try{
        const user = await User.findOne({token: token});
        if(!user){
            return res.status(404).json({message: "Invalid token"});
        }
        const connections =  await ConnectionRequest.find({userId: user._id}).populate('connectionId', 'name username email profilePicture');


}
catch (error){
        return res.status(500).json({message: error.message || "Server error"});
    }
}

export const  whatAreMyConnection = async(req, res) =>{
    try{
        const user = await User.findOne({token });
        if(!user){
            return res.status(404).json({message: "User Not Found" });
        } 
        const connections = await ConnectionRequest.find({connectionId: user._id})
        .populate('userId', 'name username email profilePicture');

        return res.json(connections);

    }catch{
         return res.status(500).json({message: error.message || "Server error"});

    }
}

export const acceptConnectionRequest =  async(req , res) =>{

    const {token, requestId, action_type} = req.body;

    try{
        const user = await User.findOne({token});
        if(!user){
            return res.status(404).json({message: "User Not Found" });
        } 
        const connection = await ConnectionsRequest.findOne({_id: requestId});
        if(!connection){
            return res.status(404).json({message: "connection Not Found" });
        } 
        if(action_type){
            connection.status_accepted = true;
        }
        else{
            connection.status_accepted = false;
        }

        await connection.save();
        return res.json({message: "Request Updated"});


    }catch{
        return res.status(500).json({message: error.message});
    }
}  













