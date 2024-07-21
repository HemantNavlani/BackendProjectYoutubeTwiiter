import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {Tweet} from '../models/tweet.model.js'
import { asyncHandler } from '../utils/asyncHandler.js';
const createTweet = asyncHandler(async(req,res)=>{
    console.log(req.body);
    const {content} = req.body;
    if (!content) throw new ApiError(400,'Content is required');

    const tweet = await Tweet.create({
        content,
        owner:req.user?._id
    })
    if (!tweet) throw new ApiError(500,"Tweet not made try again");

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet made successfully"))
})

const getUserTweets = asyncHandler(async(req,res)=>{
    const {userId} = req.params;

    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"ownerDetails",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            "avatar.url":1,
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likeDetails",
                pipeline:[
                    {
                        $project:{
                            likedBy:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likeDetails",
                },
                ownerDetails:{
                    $first:"$ownerDetails",
                },
                isLiked:{
                    $cond: {
                        if: {$in: [req.user?._id, "$likeDetails.likedBy"]},
                        then: true,
                        else: false
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
                ownerDetails:1,
                likesCount:1,
                createdAt:1,
                isLiked:1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,tweets,"Tweets fetched successfully"));
})

const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) throw new ApiError(404,"Tweet not found");

    if (tweet.owner.toString()!==req.user?._id.toString()) throw new ApiError("400","Only owner can delete its tweet");

    await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet deleted successfully"));
})

const updateTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body;
    const {tweetId} = req.params
    const tweet = await Tweet.findByIdAndUpdate(tweetId);
    if (!tweet) throw new ApiError(400,"Tweet not found");

    if (!content) throw new ApiError(400,"Content is required");

    if (tweet.owner.toString() !== req.user?._id.toString()) throw new ApiError(400,"Only owner can update the tweet")
    const newTweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content
        }
    },{new:true})

    if (!newTweet) throw new ApiError(500,"New Tweet not made try again");
    return res.status(200).json(new ApiResponse(200,newTweet,"New tweet made successfully"))
})

export {
    createTweet,
    getUserTweets,
    deleteTweet,
    updateTweet
}