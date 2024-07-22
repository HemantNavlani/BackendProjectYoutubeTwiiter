import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Like } from '../models/like.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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

    const like = await Like.create({
        video:videoId,
        likedBy:req.user?._id
    })
    return res.status(200).json(new ApiResponse(200,like,"Video Liked successfully"))
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
    const like = await Like.create({
        comment : commentId,
        likedBy: req.user?._id
    })
    return res.status(200).json(new ApiResponse(200,like,"Comment liked successfully"));
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
    const like = await Like.create({
        tweet:tweetId,
        likedBy:req.user?._id
    })
    return res.status(200).json(new ApiResponse(200,like,"Tweet liked successfully"))
})
const getLikedVideos = asyncHandler(async(req,res)=>{
    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"likedVideo",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"ownerDetails"
                        }
                    },
                    {
                        $unwind:"$ownerDetails"
                    }
                ]
            }
        },{
            $unwind:"$likedVideo"
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                _id:0,
                likedVideo:{
                    _id:1,
                    "videoFile.url":1,
                    "thumbnail.url":1,
                    owner:1,
                    title:1,
                    description:1,
                    createdAt:1,
                    isPublished:1,
                    ownerDetails:{
                        username:1,
                        fullname:1,
                        "avatar.url":1,
                    }
                }
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,likedVideos,"liked videos fetched successfully"))
})
export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}