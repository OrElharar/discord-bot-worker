const CustomError = require("../models/CustomError");
const BotInstructions = require("../models/BotInstructions");
const globals = require("./globalsHelper");
const axios = require("axios");
const ApiResponse = require("../models/ApiResponse");

module.exports.sendCreateChannelMsg = async(channelName)=>{
    try{
        if (channelName == null)
            return {err: new CustomError("Channel's name must be provided")}
        const msg = new BotInstructions(globals.CREATE_NEW_CHANNEL_MSG, { channelName })
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {content: JSON.stringify(msg)});
        return {response: new ApiResponse(true)}
    }catch (err){
        return {err}
    }
}


module.exports.sendCMoveMemberMsg = async(channelName, userId)=>{
    try{
        if (userId == null)
            return {err: new CustomError("User's id must be provided")}
        const msg = new BotInstructions("$move", { channelName, userId })
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {content: JSON.stringify(msg)});
        return {response: new ApiResponse(true)}
    }catch (err){
        return {err}
    }
}

module.exports.sendBotPlayAudio = async(channelName, url)=>{
    try{
        if (url == null)
            return {err: new CustomError("URL must be provided")}
        const msg = new BotInstructions("$play", { channelName, url })
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {content: JSON.stringify(msg)});
        return {response: new ApiResponse(true)}
    }catch (err){
        return {err}
    }
}

module.exports.sendMessage = async(message)=>{
    try{
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {content: message});
        return {response: new ApiResponse(true)}
    }catch (err){
        return {err}
    }
}
