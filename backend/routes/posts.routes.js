import { Router } from "express";
import { activeCheck, createPost, getAllPosts, deletePost,commentPost, getCommentsByPost , deleteComment, increment_likes } from "../controllers/post.controllers.js";
import multer from "multer";

const router = Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
router.route("/").get(activeCheck);



router.route("/post").post(upload.single("media"), createPost);
router.route("/posts").get(getAllPosts);
router.route("/delete_post").post(deletePost);
router.route("/comment_post").post(commentPost);
router.route("/get_comment").get(getCommentsByPost);
router.route("/delete_comment").delete(deleteComment);
router.route("/increment_post_likes").post(increment_likes);

export default router;
