// require('dotenv').config({path:'./env'});
//This can be used but it disturbs the consitency of our code so we will use other approach

import dotenv from "dotenv"
dotenv.config({path:'./env'})



import connectDB from "./db/index.js";

connectDB();






/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from 'express'
const app = new express();
(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on('error',(err)=>{
            console.log('Error',err);
            throw err
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("Error",error);
        throw error
    }
})()
*/