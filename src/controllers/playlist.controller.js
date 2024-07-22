import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {Playlist} from '../models/playlist.model.js'
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
       
})
const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    
})
const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
    
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