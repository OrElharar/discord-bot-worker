"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const discord_js_1 = require("discord.js");
const DiscordBot_1 = require("./helpers/DiscordBot");
const Logger_1 = __importDefault(require("./helpers/Logger"));
const studentcher_shared_utils_1 = require("./studentcher-shared-utils");
const client = new discord_js_1.Client({ intents: [discord_js_1.IntentsBitField.Flags.Guilds,
        discord_js_1.IntentsBitField.Flags.GuildMessages,
        discord_js_1.IntentsBitField.Flags.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.IntentsBitField.Flags.GuildVoiceStates] });
const bot = new DiscordBot_1.DiscordBot(client);
bot.run();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/", studentcher_shared_utils_1.healthCheckMiddleware);
app.use((0, studentcher_shared_utils_1.errorsHandler)(Logger_1.default));
exports.default = app;
//# sourceMappingURL=app.js.map