const { Client, IntentsBitField } = require('discord.js');
const axios = require('axios');
const ApiResponse = require("../models/ApiResponse");

const client = new Client({ intents: [IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent] });
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});


client.on("messageCreate", (msg)=>{
    if(msg.content === "PING")
       msg.channel.send("PONG");
})

client.login(process.env.DISCORD_BOT_TOKEN)

module.exports.createChannel = async(channelName)=>{
    try{
        client.actions.ChannelCreate()
        const guild = await client.guilds.fetch('guild_id');
        const response = guild.channels.create(channelName);
        console.log({response});
        return {response: new ApiResponse(true)}
    }catch (err){
        console.log({err})
        return {err}
    }
}

module.exports.sendMessage = async(message)=>{
    try{
        const res = await axios.post(process.env.DISCORD_WEBHOOK_URL, {content: message});
        console.log(res)
    }catch (err){
        return {err}
    }
}

