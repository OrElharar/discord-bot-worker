const { Client, IntentsBitField, ChannelType, GuildChannel} = require('discord.js');
const axios = require('axios');
const ApiResponse = require("../models/ApiResponse");
const  globals = require("../helpers/globalsHelper");
const BotInstructions = require("../models/BotInstructions");
const CustomError = require("../models/CustomError");

const client = new Client({ intents: [IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("error", (err)=>{
    console.log(`Discord Error: ${err.message}`);
})

client.on("messageCreate", async (msg)=>{
    msg.content = isJsonValid(msg.content) ? JSON.parse(msg.content) : msg.content;
    if (msg.content === "PING")
        msg.channel.send("PONG")
    if(msg.content.type === globals.CREATE_NEW_CHANNEL_MSG)
        await handleCreateNewChannel(msg);
})


module.exports.sendCreateChannelMsg = async(channelName)=>{
    try{
        if (channelName == null)
            return {err: new CustomError("Channel's name must be provided")}
        const msg = new BotInstructions(globals.CREATE_NEW_CHANNEL_MSG, {channel: {name: channelName}})
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

const handleCreateNewChannel = (message, channelName) =>{
    console.log("In handleCreateNewChannel")
    return new Promise((resolve, reject)=>{
        try{
           message.guild.channels.create({
               name: channelName,
               type: GuildChannel.GuildText
           }).then((channel)=> {
               console.log({channel})
               resolve();
           })
               .catch((err)=> {
                   console.log({err})
                   reject(err)
               });
        }catch(err){
            reject(err);
        }
    })
};



const isJsonValid = (value)=>{
    try{
        JSON.parse(value);
        return true;
    }catch(err){
        return false;
    }
}

const login = async()=>{
    client.login(process.env.DISCORD_BOT_TOKEN)
        .then()
        .catch((err)=> {
            console.log("login to Discord bot Failed")
            login().then()
        })
}

login().then(()=> console.log("Login successfully to Discord bot"))