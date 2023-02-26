import {DiscordRepository} from "../studentcher-shared-utils/repositories/DiscordRepository";
import pgClient from "../storage/postgresAdapter";
export default new DiscordRepository(pgClient)
