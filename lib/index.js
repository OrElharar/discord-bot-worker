"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const constantsHelper_1 = require("./helpers/constantsHelper");
// type MsgContentType = {
//     type: string,
//     data: any
// }
// const client = new Client({ intents: [IntentsBitField.Flags.Guilds,
//         IntentsBitField.Flags.GuildMessages,
//         IntentsBitField.Flags.MessageContent,
//         GatewayIntentBits.GuildMembers] });
const client = new discord_js_1.Client({ intents: ["Guilds", "GuildMessages", "DirectMessages", "MessageContent", "GuildMembers"] });
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}, Ready to go`);
    const guilds = client.guilds.cache;
    guilds.forEach((guild) => console.log(guild.name, guild.id));
    const guild = client.guilds.cache.get('1033744515019849820');
    // Get the list of channels
    const channels = guild.channels.cache;
    channels.forEach(channel => {
        // Get the channel ID
        const channelId = channel.id;
        // Get the channel name
        const channelName = channel.name;
        // Get the members in the channel (if it's a text or voice channel)
        const members = channel.members;
        // const membersId = channel.members.map((member)=> member.id);
        // console.log({channel: {id: channelId, name: channelName, membersId}})
    });
});
client.on("error", (err) => {
    console.log(`Discord Error: ${err.message}`);
});
client.on("messageCreate", async (msg) => {
    try {
        const content = isJsonValid(msg.content) ? JSON.parse(msg.content) : msg.content;
        if (msg.content === "PING")
            msg.channel.send("PONG");
        // if(msg.author.id !== process.env.DISCORD_WEBHOOK_USER_ID) // Uncomment when debugging is done
        //     return
        // @ts-ignore
        // if(typeof msg !== "MsgContentType" )
        //     return;
        if (content.type === constantsHelper_1.Constants.CREATE_NEW_CHANNEL_MSG) {
            const channel = await msg.guild.channels.create({
                name: content.data.channelName,
                type: 2
            });
            console.log(`Created channel ${channel.name} successfully`);
        }
        if (content.type === "$move") {
            console.log(content.data);
            const discordUserId = content.data.userId.slice(2, -1);
            const member = msg.guild.members.cache.get(discordUserId);
            if (member == null) {
                console.log({ err: "Member was not mentioned" });
                return;
            }
            const channelId = msg.guild.channels.cache.find(channel => channel.name === content.data.channelName);
            if (channelId == null)
                return;
            await member.voice.setChannel(channelId.id);
            console.log({ channelId: channelId.id });
        }
    }
    catch (err) {
        console.log({ errMessage: err.message });
    }
});
const isJsonValid = (value) => {
    try {
        JSON.parse(value);
        return true;
    }
    catch (err) {
        return false;
    }
};
const login = async () => {
    client.login(process.env.DISCORD_BOT_TOKEN)
        .then()
        .catch((err) => {
        console.log("login to Discord bot Failed, trying again...", err);
        login().then();
    });
};
login().then(() => console.log("Login successfully to Discord bot"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBa0M7QUFDbEMsK0RBQW9EO0FBRXBELDBCQUEwQjtBQUMxQixvQkFBb0I7QUFDcEIsZ0JBQWdCO0FBQ2hCLElBQUk7QUFFSixzRUFBc0U7QUFDdEUsK0NBQStDO0FBQy9DLGdEQUFnRDtBQUNoRCw4Q0FBOEM7QUFFOUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxtQkFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFeEgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO0lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFlLENBQUMsQ0FBQztJQUM1RCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNuQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDM0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDN0QsMkJBQTJCO0lBQzNCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFBO0lBQ3JDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDdkIscUJBQXFCO1FBQ3JCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDN0IsdUJBQXVCO1FBQ3ZC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