import {Client, GatewayIntentBits, IntentsBitField} from 'discord.js';
import {DiscordEventsHandler} from "./helpers/DiscordEventsHandler";

const client = new Client({ intents: [IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        GatewayIntentBits.GuildMembers] });

client.on('ready', async () => {
    await DiscordEventsHandler.ready(client);
});

client.on("error", (err)=>{
    DiscordEventsHandler.error(err);
})

client.on("messageCreate", async (msg )=>{
    await DiscordEventsHandler.newMessage(msg)
})

const login = async()=>{
    client.login(process.env.DISCORD_BOT_TOKEN)
        .then()
        .catch((err)=> {
            console.log("login to Discord bot Failed, trying again...", err)
            login().then()
        })
}

login().then(()=> console.log("Login successfully to Discord bot"))
