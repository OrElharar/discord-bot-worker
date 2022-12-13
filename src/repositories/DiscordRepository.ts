import pgClient from "../storage/postgresAdapter";
import {EntityRepository} from "./EntityRepository";
import {IClientRequestData} from "../models/ClientRequestData";
import * as userTrackingQueries from "../helpers/postgresQueriesHelper/userTracking";
export class DiscordRepository extends EntityRepository{
    static async addUserTracking(data: IClientRequestData): Promise<void>{
        const insertUserTrackingQuery = userTrackingQueries.getInsertUseTrackingQuery();
        const values = [data.userId, data.discordChannelId, data.status];
        await pgClient.callDbCmd(insertUserTrackingQuery, values);
    }
}
