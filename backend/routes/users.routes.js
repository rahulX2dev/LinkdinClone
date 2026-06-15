import { Router } from "express";
import { register, 
        login, 
        uploadProfilePicture, 
        updateUserProfile, 
        getUserAndProfile, 
        updateProfileData, 
        getAllUsersProfiles, 
        downloadProfile, 
        sendConnectionRequest, 
        getMyConnectionsRequests,
        whatAreMyConnection,
        acceptConnectionRequest } from "../controllers/user.controllers.js";
import multer from 'multer';

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });
router.route("/update_profile_picture")
    .post(upload.single('profile_picture'), uploadProfilePicture);



router.route('/register').post(register);
router.route('/login').post(login);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile); // To be implemented
router.route("/update_profile_data").post(updateProfileData); // To be implemented   
router.route("/user/get_all_user_profile").get(getAllUsersProfiles); // To be implemented
router.route("/user/download_resume").get(downloadProfile); // To be implemented
router.route("/user/send_connection_request").post(sendConnectionRequest); // To be implemented
router.route("/user/getMyConnectionsRequests").get(getMyConnectionsRequests); // To be implemented
router.route("/user/user_connection_requesct").get(whatAreMyConnection); // To be implemented
router.route("/user/accept_Connection_Request").get(acceptConnectionRequest); // To be implemented

export default router;