import Profile from "../models/profile.models.js";
import User from "../models/user.models.js";
import Post from "../models/post.models.js";

// Health check
export const activeCheck = async (req, res) => {
  return res.status(200).json({ message: "RUNNING" });
};

// Create post
export const createPost = async (req, res) => {
  const { token, body } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const post = new Post({
      userId: user._id,
      body: body,
      media: req.file ? req.file.filename : "",
      fileType: req.file ? req.file.mimetype : ""
    });

    await post.save();

    return res.status(200).json({ message: "Post Created" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Server error" });
  }
};


//get posts 

export const getAllPosts = async(res, req) => {
    try{
        const posts = await Post.find().populate('userId', 'name username email profilePicture')
        return res.json({posts})
    }
    catch(err){
        return res.status(500).json({message: err.message});
    }
}


export const deletePost  =  async (req, res) => {
  const {token , post_Id} = eeq.body;
  try{
    const user = await User.findOne({token: token}).select("_id");

    if(!user){
      return res.status(404).json({message: "User Not Found"});
    }

    const post = await Post.findOne({_id: post_Id});
    if(!post){
      return res.status(404).json({message: "Post Not Found"});
    }
    if(post.userId.toString() != user._id.toString()){
      return res.status(401).json({message:"Unauthorized"});
    }
    await Post.deletPost({_id: post_Id});
    return res.json({message:"post deleted"});
  }

catch(err){
        return res.status(500).json({message: err.message}).select("_id");
        
    }
}


export const commentPost =  async(req, res)=>{
  const {token , post_Id, commentBody} = req.body;
  try{
    const user = await User.findOne({token: token});
    if(!user){
      return res.status(404).json({message: "User Not Found"});
    }
    const post = await Post.findOne({
      _id: post_Id
    })
    if(!post){
      return res.status(404).json({message: "Post Not Found"});
    }

    const comment = await new Comment({
      userId: user._id,
      postId: post_Id,
      comment: commentBody
    });

    await comment.save();
    return res.status(200).json({message: "Comment Added"});


  }catch(err){
     return res.status(500).json({message: err.message});
  }

}

// ➤ Get all comments for a post
export const getCommentsByPost = async (req, res) => {
  const {post_Id} = req.body;
  try {
    const post = await post.find({ _id: post_Id })
    if(!post){
      return res.status(404).json({message: "Post Not Found"});
    }


    return res.status(200).json({ comments: post.comments });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ➤ Delete comment (soft delete)
export const deleteComment = async (req, res) => {
  const { token, commentId } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const comment = await Comment.findOne({"_id": commentId});
    if (!comment) return res.status(404).json({ message: "Comment Not Found" });
    if (comment.userId.toString() != user._id.toString()){
      return res.status(403).json({ message: "Not authorized" });
    }
    await Comment.deleteOne({"_id": commentId });

    return res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


//increment liks 

export const increment_likes = async (req, res) =>{

  const {post_Id} = req.body;
  try{
    const post =  await Post.findOne({_id: post_Id});
    if(!post){
      return res.status(404).json({message: "Post Not Found"});
    }
    post.likes = post.likes + 1;
    await post.save();

    return res.json({message: "likes incremented"});
    

  }catch(err){
    return res.status(500).json({ message: err.message });
  }
}
