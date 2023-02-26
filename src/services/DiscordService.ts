import {DiscordService} from "../studentcher-shared-utils/services/DiscordService";
import discordRepository from "../repositories/DiscordRepository";

export default new DiscordService(discordRepository)
