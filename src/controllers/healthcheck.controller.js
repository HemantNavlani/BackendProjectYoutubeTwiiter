import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js';
const healthCheck = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,{message:"Everything is fine"},"OK"));
})
export {healthCheck}