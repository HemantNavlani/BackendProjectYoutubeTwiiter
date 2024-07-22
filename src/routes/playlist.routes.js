import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import{createPlaylist,deletePlaylist,updatePlaylist,addVideoToPlaylist,removeVideoFromPlaylist,getUserPlaylists,getPlaylistById,} from '../controllers/playlist.controller.js'
const router = Router();

router.use(verifyJWT,upload.none())

router.route('/').post(createPlaylist)
router.route('/:playlistId')
.get(getPlaylistById)
.delete(deletePlaylist)
.patch(updatePlaylist)

router.route('/add/:videoId/:playlistId').patch(addVideoToPlaylist);
router.route('/remove/:videoId/:playlistId').patch(removeVideoFromPlaylist)
router.route('/user/:userId').get(getUserPlaylists)

export default router;