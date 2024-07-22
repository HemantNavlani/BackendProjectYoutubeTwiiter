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
    
})
const getPlaylistsById = asyncHandler(async(req,res)=>{
    
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