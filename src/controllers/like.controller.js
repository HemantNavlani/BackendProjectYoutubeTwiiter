import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler'
import { Like } from '../models/like.model';
import { ApiResponse } from '../utils/ApiResponse';

const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const alreadyLiked = await Like.findOne({
        video: videoId,
        likedBy:req.user?._id
    })
    if (alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id);
        return res.status(200).json(new ApiResponse(200,{liked:false},"Video like removed successfully"));
    }

    await Like.create({
        video:videoId,
        likedBy:req.user?._id
    })
    return res.status(200).json(new ApiResponse(200,{liked:true},"Video Liked successfully"))
})
const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
    
    const alreadyLiked = await Like.findOne({
        comment:commentId,
        likedBy:req.user?._id
    })
    if (alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id);
        return res.status(200).json(new ApiResponse(200,{likes:false},"comment like removed successfully"));
    }
    await Like.create({
        comment : commentId,
        likedBy:req.user?._id
    })
    return res.status(200).json(new ApiResponse(200,{like:true},"Comment liked successfully"));
})
const toggleTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;

    const alreadyLiked = await Like.findOne({
        tweet:tweetId,
        likedBy:req.user?._id
    })

    if (alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id);
        return res.status(200).json(new ApiResponse(200,{like:false},"Tweet like removed successfully"))
    }
    await Like.create({
        tweet:tweetId,
        likedBy:req.user?._id
    })
    return res.status(200).json(new ApiResponse(200,{like:true},"Tweet liked successfully"))
})
const getLikedVideos = asyncHandler(async(req,res)=>{
    
})
export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}