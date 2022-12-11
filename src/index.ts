import {Client, GatewayIntentBits, IntentsBitField} from 'discord.js';
import {Constants} from "./helpers/constantsHelper";

// type MsgContentType = {
//     type: string,
//     data: any
// }

const client = new Client({ intents: [IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        GatewayIntentBits.GuildMembers] });

// const client = new Client({ intents: ["Guilds", "GuildMessages", "DirectMessages", "MessageContent", "GuildMembers"] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}, Ready to go`);
    const guilds = client.guilds.cache;
    guilds.forEach((guild)=> console.log(guild.name, guild.id))
    const guild = client.guilds.cache.get('1033744515019849820');
    // Get the list of channels
    const channels = guild.channels.cache
    channels.forEach(channel => {
        // Get the channel ID
        const channelId = channel.id;
        // Get the channel name
        const channelName = channel.name;
        // Get the members in the channel (if it's a text or voice channel)
        const members = channel.members;
        console.log({channelId, channelName})
        // const membersId = channel.members.map((member)=> member.id);
        // console.log({channel: {id: channelId, name: channelName, membersId}})
    });
});

client.on("error", (err)=>{
    console.log(`Discord Error: ${err.message}`);
})

client.on("messageCreate", async (msg )=>{
    try {
        console.log(msg)
        const content = isJsonValid(msg.content) ? JSON.parse(msg.content) : msg.content;
        if (msg.content === "PING")
            msg.channel.send("PONG")
        // if(msg.author.id !== process.env.DISCORD_WEBHOOK_USER_ID) // Uncomment when debugging is done
        //     return
        // @ts-ignore
        // if(typeof msg !== "MsgContentType" )
        //     return;

        if (content.type === Constants.CREATE_NEW_CHANNEL_MSG) {
            const channel = await msg.guild.channels.create({
                name: content.data.channelName,
                type: 2
            });
            console.log(`Created channel ${channel.name} successfully`)
        }
        if(content.type === "$move"){
            console.log(content.data)
            const discordUserId = content.data.userId.slice(2, -1);
            const member= msg.guild.members.cache.get(discordUserId)
            if(member == null) {
                console.log({err: "Member was not mentioned"});
                return;
            }
            const channelId = msg.guild.channels.cache.find(channel => channel.name === content.data.channelName);
            if(channelId == null)
                return;
            await member.voice.setChannel(channelId.id);
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
