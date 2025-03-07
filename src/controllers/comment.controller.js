import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import { Video } from '../models/video.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Comment } from '../models/comment.model.js';
import { Like } from '../models/like.model.js';
const getVideoComments = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query  
    
    const video = await Video.findById(videoId)
    if (!video) throw new ApiError(404,"Video not found");

    const commentAggregate = Comment.aggregate([
        {
            $match:{
                video : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"likes"
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes",
                },
                owner:{
                    $first:"$owner"
                },
                isLiked:{
                    $cond:{
                        if :{$in:[req.user?._id,"$likes.likedBy"]},
                        then:true,
                        else :false,
                    }
                }
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                content:1,
                createdAt:1,
                updatedAt:1,
                likesCount:1,
                owner:{
                    username:1,
                    fullname:1,
                    "avatar.url":1,
                },
                isLiked:1,
            }
        }
    ])

    const options = {
        page:parseInt(page,10),
        limit:parseInt(limit,10)
    }
    const comments = await Comment.aggregatePaginate(
        commentAggregate,
        options
    )
    return res.status(200).json(new ApiResponse(200,comments,"All comments fetched successfully"))
})
const addComment = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    const {content} = req.body;
    if (!content) throw new ApiError(400,"Comment content is required");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404,"Video not found");
    
    const comment = await Comment.create({
        content,
        video,
        owner : req.user?._id
    })
    if (!comment) throw new ApiError(500,"Comment creation failed try again");
    return res.status(200).json(new ApiResponse(200,comment,"Comment Added Successfully"));
})

const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    
    const comment = await Comment.findById(commentId)
    if (!comment) throw new ApiError(404,"Comment not found");

    if (comment.owner.toString()!==req.user?._id.toString()) throw new ApiError(400,"Only owner can delete the comment");

    await Comment.findByIdAndDelete(comment?._id);
    await Like.deleteMany({
        comment:commentId,
        likedBy:req.user?._id
    })
    return res.status(200).json(new ApiResponse(200,comment,"Comment deleted successfully"))
})
const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
    const {content} = req.body;
    if (!content) throw new ApiError(400,"Content is required");

    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404,"Comment not found");

    if (comment.owner.toString()!==req.user?._id.toString()) throw new ApiError(400,"Only owner can update the comment");
    const updatedComment = await Comment.findByIdAndUpdate(
        comment?._id, 
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )
    if (!updatedComment) throw new ApiError(500,"Comment not updated try again");
    return res.status(200).json(new ApiResponse(200,updatedComment,"Comment updated successfully"))
})
export {
    getVideoComments,
    addComment,
    deleteComment,
    updateComment
}