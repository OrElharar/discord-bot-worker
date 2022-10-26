const { Client, IntentsBitField, GatewayIntentBits} = require('discord.js');
const  globals = require("../helpers/globalsHelper");

const client = new Client({ intents: [IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        GatewayIntentBits.GuildMembers] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}, Ready to go`);
    console.log(client.users);
});

client.on("error", (err)=>{
    console.log(`Discord Error: ${err.message}`);
})

client.on("messageCreate", async (msg)=>{
    try {
        console.log(msg.content) //For debugging
        msg.content = isJsonValid(msg.content) ? JSON.parse(msg.content) : msg.content;
        if (msg.content === "PING")
            msg.channel.send("PONG")
        // if(msg.author.id !== process.env.DISCORD_WEBHOOK_USER_ID) // Uncomment when debugging is done
        //     return
        if (msg.content.type === globals.CREATE_NEW_CHANNEL_MSG) {
            const channel = await msg.guild.channels.create({
                name: msg.content.data.channelName,
                type: 2
            });
            console.log(`Created channel ${channel.name} successfully`)
        }
        if(msg.content.type === "$move"){
            const discordUserId = msg.content.data.userId.slice(2, -1);
            const member= msg.guild.members.cache.get(discordUserId)
            if(member == null) {
                console.log({err: "Member was not mentioned"});
                return;
            }
            const channelId = msg.guild.channels.cache.find(channel => channel.name === msg.content.data.channelName);
            const res = await member.voice.setChannel(channelId);
            console.log({channelId:channelId.id})
        }

    }catch(err){
        console.log({errMessage: err.message});
    }
})



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
            console.log("login to Discord bot Failed, trying again...", err)
            login().then()
        })
}

login().then(()=> console.log("Login successfully to Discord bot"))
