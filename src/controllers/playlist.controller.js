import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {Playlist} from '../models/playlist.model.js'
import {Video} from '../models/video.model.js'

const createPlaylist = asyncHandler(async(req,res)=>{
       const {name, description} = req.body;

       if (!name || !description) throw new ApiError(400,"Name and description are required");

       const playlist = await Playlist.create({
              name,
              description,
              owner : req.user?._id
       })
       if (!playlist) throw new ApiError(500,"Playlist not created Try again");

       return res.status(200)
       .json(new ApiResponse(200,playlist,"Playlist made successfully"));
})
const deletePlaylist = asyncHandler(async(req,res)=>{
       const {playlistId} = req.params

       const playlist = await Playlist.findById(playlistId)
       if (!playlist) throw new ApiError(404,"Playlist not found");

       if (req.user?._id.toString() !== playlist.owner.toString()) throw new ApiError(400,"Only owner can delete the playlist");

       await Playlist.findByIdAndDelete(playlist?._id);
       return res.status(200).json(new ApiResponse(200,playlist,"Playlist deleted successfully"));
})
const updatePlaylist = asyncHandler(async(req,res)=>{
       const {name, description} = req.body;
       const {playlistId} = req.params;

       if (!name || !description) throw new ApiError(400,"Name and description are required");
       
       const playlist = await Playlist.findById(playlistId);
       if (!playlist) throw new ApiError(404,"Playlist not found");

       const updatedPlaylist = await Playlist.findByIdAndUpdate(
              playlist?._id,
              {
                     $set:{
                            name,
                            description
                     }
              },
              {
                     new:true
              }
       )
       if (!updatedPlaylist) throw new ApiError(500,"Updation of Playlist failed, try again");
       return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Playlist updated successfully"));
})
const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId, videoId} = req.params;
    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId)

    if (!playlist) throw new ApiError(404,"Playlist not found");
    if (!video) throw new ApiError(404,"Video not found");

    if (playlist.owner.toString()!==req.user?._id.toString()) throw new  ApiError(400,"Only owner can add videos to the playlist");

    const newPlaylist = await Playlist.findByIdAndUpdate(
       playlist?._id,
       {
              $addToSet:{
                     videos:videoId,
              }
       },
       {
              new:true
       }
    )
    if (!newPlaylist) throw new ApiError(500,"Video not added to playlist, try again");

    return res.status(200).json( new ApiResponse(200,newPlaylist,"Video successfully added to the playlist"));
})
const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
    const {videoId,playlistId} = req.params;
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404,"Video not found");
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) throw new ApiError(404,"Playlist not found");

    if (playlist.owner.toString() !== req.user?._id.toString()) throw new ApiError(400,"Only owner of the playlist can remove videos from the playlist");

    const newPlaylist = Playlist.findByIdAndUpdate(
       playlistId,
       {
              $pull:{
                     videos:videoId
              },
       },
       {
              new : true
       }
    )
    if (!newPlaylist) throw new ApiError(500,"Removal of video from playlist failed, try again");
    return res.status(200).json(new ApiResponse(200,newPlaylist,"Video removes successfully"))
})
const getUserPlaylists = asyncHandler(async(req,res)=>{
    const {userId} = req.params;

    const playlists = await Playlist.aggregate([
       {
              $match:{
                     owner : new mongoose.Types.ObjectId(userId)
              }
       },
       {
              $lookup:{
                     from:"videos",
                     localField:"videos",
                     foreignField:"_id",
                     as:"videos"
              }
       },
       {
              $addFields:{
                     totalVideos:{
                            $cond: {
                                   if: { $isArray: "$videos" }, 
                                   then: { $size: "$videos" }, 
                                   else: 0
                            }      
                     },
                     totalViews:{
                            $sum:"$videos.views"
                     }
              }
       },
       {
              $project:{
                     _id:1,
                     name:1,
                     description,
                     totalVideos:1,
                     totalViews:1,
                     updatedAt:1,
              }
       }
    ])

    return res.status(200)
    .json(200,new ApiResponse(200,playlists,"User playlists fetched successfully"))
})
const getPlaylistsById = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404,"Playlist not found");

    const playlistVideos = Playlist.aggregate([
       {
              $match:{
                     _id: new mongoose.Types.ObjectId(playlistId)
              }
       },
       {
              $lookup:{
                     from:"videos",
                     localField:"owner",
                     foreignField:"_id",
                     as:"videos"
              }
       },
       {
              $match:{
                     "videos.isPublished":true
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
              $addFields:{
                     totalVideos:{
                            $cond: {
                                   if: { $isArray: "$videos" }, 
                                   then: { $size: "$videos" }, 
                                   else: 0
                            }      
                     },
                     totalViews:{
                            $sum:"$videos.views"
                     },
                     owner:{
                            $first:$owner
                     }
              }
       },
       {
              $project:{
                     name:1,
                     description:1,
                     createdAt:1,
                     updatedAt:1,
                     totalVideos:1,
                     totalViews:1,
                     videos:{
                            _id:1,
                            "videoFile.url":1,
                            "thumbnail.url":1,
                            title:1,
                            description:1,
                            duration:1,
                            createdAt:1,
                            views:1,
                     },
                     owner:{
                            username : 1,
                            fullname:1,
                            "avatar.url":1,
                     }
              }
       }
    ])
    return res.status(200).json(new ApiResponse(200,playlistVideos,"Playlist videos fetched successfully"))
})

export {
       createPlaylist,
       deletePlaylist,
       updatePlaylist,
       addVideoToPlaylist,
       removeVideoFromPlaylist,
       getUserPlaylists,
       getPlaylistsById,
}