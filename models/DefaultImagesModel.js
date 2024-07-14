import { Schema, model } from "mongoose";


const DefaultImagesSchem = new Schema({
    imgUrl: {
        type: String,
        default:null
    }
},{
    timestamps:true
})


export default model("DefaultProfileImages", DefaultImagesSchem)