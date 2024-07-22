import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT,upload.none())

router.route('/v/:videoId').post(addComment).get(getVideoComments);
router.route('/c/:commentId').delete(deleteComment).patch(updateComment)
export default router