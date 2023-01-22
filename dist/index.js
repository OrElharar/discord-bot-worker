"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const DiscordBot_1 = require("./helpers/DiscordBot");
const client = new discord_js_1.Client({ intents: [discord_js_1.IntentsBitField.Flags.Guilds,
        discord_js_1.IntentsBitField.Flags.GuildMessages,
        discord_js_1.IntentsBitField.Flags.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.IntentsBitField.Flags.GuildVoiceStates] });
const bot = new DiscordBot_1.DiscordBot(client);
bot.run();
//# sourceMappingURL=index.js.map