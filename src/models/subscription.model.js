import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{//one who is subscribing
        type:mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    channel:{//one to whom 'subscriber' is subscribing
        type:mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
},{timestamps:true})


export const Subscription = mongoose.model("Subscription",subscriptionSchema)