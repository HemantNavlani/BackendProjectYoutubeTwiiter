import mongoose from 'mongoose'
import { Video } from '../models/video.model.js'
import { ApiError } from '../utils/ApiError.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {Like} from '../models/like.model.js'
import {Comment} from '../models/comment.model.js'

const getAllVideos = async(req,res)=>{

}

const publishAVideo = async(req,res)=>{
    // const {videoFile,thumbnail,title,description,duration,views,isPublished,owner}
    const {title,description} = req.body;

    if (!title) throw new ApiError(400,'Title is required !!');
    if (!description) throw new ApiError(400,'Description is required !!');

    const videoFileLocalPath = req.files?.videoFile[0].path;
    const thumbnailFileLocalPath = req.files?.thumbnail[0].path;

    if (!thumbnailFileLocalPath) throw new ApiError(400,"Thumbnail File is required !!")
    if (!videoFileLocalPath) throw new ApiError(400,"Video File is required !!");

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailFileLocalPath)

    if (!videoFile) throw new ApiError(400,"Video file not found");
    if (!thumbnail) throw new ApiError(400,"Thumbnail not found");

    const video = await Video.create({
        videoFile:{
            url: videoFile.url,
            public_id:videoFile.public_id
        },
        title,
        description,
        thumbnail,
        duration:videoFile.duration,
        owner: req.user?._id,
        isPublished:false
    })

    const videoUploaded = Video.findById(video._id);
    if (!videoUploaded) throw new ApiError(500,"Video upload failed Try again");
    return res.status(200).json(new ApiResponse(200,video,"Video uploaded successfully"))
}

const getVideoById = async(req,res)=>{

}
const updateVideo = async(req,res)=>{
    const {title, description} = req.body;
    const videoId = req.params;
    if (!title && !description) throw new ApiError(400,"Title or description is required");
    
    const video = Video.findById(videoId);
    if (!video) throw new ApiError(404,'Can not find video');
    if (video.owner !== req.user?._id) throw new ApiError(400,"You can't update video only its owner can");

    const thumbnailToDelete = video.thumbnail.public_id;

    const thumbnailLocalPath = req.file?.path
    if (!thumbnailLocalPath) throw new ApiError(400,"Thumbnail is required");

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail) throw new ApiError(400,'Thumbnail not found');

    const updatedVideo = Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description,
                thumbnail:{
                    public_id:thumbnail.public_id,
                    url : thumbnail.url,
                }
            }
        },
        {
            new:true
        }
    )

    if (!updateVideo) throw new ApiError(500,"Failed to update video, try again");

    if (updateVideo) deleteFromCloudinary(thumbnailToDelete);
    return res
    .status(200)
    .json(new ApiResponse(200,updateVideo,"Video updated successfully"));
}
const deleteVideo = async(req,res)=>{
    const {videoId} = req.params;

    const video = Video.findById(videoId);
    if (!video) throw new ApiError(404,"Video not found");

    if (req.user?._id !== video.owner) throw new ApiError(400,"You can't delete, you are not the owner");


    const videoDeleted = await Video.findByIdAndDelete(video?._id);
    if (!videoDeleted) throw new ApiError(500,'Failed to delete the video try again');

    await deleteFromCloudinary(video.thumbnail.public_id)
    await deleteFromCloudinary(video.videoFile.public_id);

    await Like.deleteMany({
        video : videoId
    })
    await Comment.deleteMany({
        video : videoId
    })

    return res.status(200).json(new ApiResponse(200,videoDeleted,"Video Deleted Successfully"))
}
const toggelPublishStatus = async(req,res)=>{

}
export {
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    publishAVideo,
    toggelPublishStatus
}