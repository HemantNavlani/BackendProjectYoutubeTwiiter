import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        //file has been uploaded successfully
        // console.log('file has been uploaded successfully',response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)//remove the locally saved temporary file as upload operation got failed
        return null;
    }
}

const deleteFromCloudinary = async (url) => {
    try {
        const parts = url.split('/');
        const lastPart = parts.pop(); // Get the last part of the URL
        const publicId = lastPart.split('.')[0]; // Split by '.' and take the first part
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.log(("Error:", error));
    }
  };
export {uploadOnCloudinary,deleteFromCloudinary}