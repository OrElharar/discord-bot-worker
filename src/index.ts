import {Client, GatewayIntentBits, IntentsBitField, ChannelType, GuildMember, Collection} from 'discord.js';
import {Constants} from "./helpers/constantsHelper";


const client = new Client({ intents: [IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        GatewayIntentBits.GuildMembers] });


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}, Ready to go`);
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const channels = {};
    guild.channels.cache.filter(channel => ChannelType[channel.type] === "GuildVoice").forEach((channel)=>{
        const memberIds = [];
        const members = Array.from(channel.members as Collection<string, GuildMember>);
        for (const [memberId, _value ] of members)
            memberIds.push(memberId)
        channels[channel.id] = {id: channel.id, name: channel.name, memberIds}
    });
    console.log({channels})
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
