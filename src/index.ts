import {Client, GatewayIntentBits, IntentsBitField} from 'discord.js';
import {DiscordBot} from "./helpers/DiscordBot";

const client = new Client({ intents: [IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        GatewayIntentBits.GuildMembers,
        IntentsBitField.Flags.GuildVoiceStates] });


const bot = new DiscordBot(client);
bot.run();
