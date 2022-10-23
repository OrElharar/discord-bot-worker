const { Client, IntentsBitField } = require('discord.js');

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

module.exports = {};