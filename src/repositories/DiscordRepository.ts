import pgClient from "../storage/postgresAdapter";
import {EntityRepository} from "./EntityRepository";
import * as userTrackingQueries from "../helpers/postgresQueriesHelper/userTracking";

type UserDiscordDataType = {
    userId: string,
    discordUserId: string
}

type UserTrackingType = {
    userId: string,
    discordChannelId: string,
    status: string
}
export class DiscordRepository extends EntityRepository{

    static async getUsersDiscordData(): Promise<UserDiscordDataType[]>{
        const selectUsersDiscordDataQuery = userTrackingQueries.getSelectUsersDiscordDataQuery();
        const values = [];
        const response = await pgClient.callDbCmd(selectUsersDiscordDataQuery, values);
        return response.rows as UserDiscordDataType[]
    }
    static async addUsersTracking(usersTrackingList: UserTrackingType[]): Promise<void>{
        const insertUserTrackingQueriesBucket = [];
        const insertUserTrackingValuesBucket = [];

        const insertUserTrackingQuery = userTrackingQueries.getInsertUserTrackingQuery();
        usersTrackingList.forEach((data)=>{
            insertUserTrackingQueriesBucket.push(insertUserTrackingQuery);
            insertUserTrackingValuesBucket.push([data.userId, data.discordChannelId, data.status]);
        })

        await pgClient.callDbTransaction(insertUserTrackingQueriesBucket, insertUserTrackingValuesBucket);
    }
}
