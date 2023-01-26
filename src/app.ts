import express, {Express} from "express";
import cors from "cors";
import {Client, GatewayIntentBits, IntentsBitField} from 'discord.js';
import {DiscordBot} from "./helpers/DiscordBot";
import logger from "./helpers/Logger";

import {
    healthCheckMiddleware,
    errorsHandler
} from "./studentcher-shared-utils";


const client = new Client({ intents: [IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        GatewayIntentBits.GuildMembers,
        IntentsBitField.Flags.GuildVoiceStates] });


const bot = new DiscordBot(client);
bot.run();




const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/", healthCheckMiddleware);


app.use(errorsHandler(logger));

export default app;
