import { IClientRequestData } from "../models/ClientRequestData";
import { CustomError } from "../models/CustomError";
import { ServiceResponse } from "../models/ServiceResponse";
import {DiscordRepository} from "../repositories/DiscordRepository";
import {Validations} from "../helpers/ValidationsHelper";
import { ApiResponse } from "../models/ApiResponse";
import {Constants} from "../helpers/ConstantsHelper";

export class DiscordService{
    discordRepository: DiscordRepository;

    constructor() {
        this.discordRepository = new DiscordRepository()
    }
    async getUsersDiscordDataIndex() : Promise<ServiceResponse>{
        try {
            const usersData = await this.discordRepository.getUsersDiscordData();
            const usersIndex :Record<string, string> = usersData.filter(({discordUserId})=> discordUserId != null)
                .reduce((allUsers, {userId, discordUserId})=>{
                return {
                    ...allUsers,
                    [discordUserId]: userId,
                }
            }, {})
            return {response: new ApiResponse(true, {usersIndex})}
        }catch (err){
            return {err}
        }
    }
    async addUsersTracking(data: IClientRequestData) : Promise<ServiceResponse>{
        try {
            if(data.usersTracking == null || !Array.isArray(data.usersTracking))
                return {err: new CustomError("usersTracking field must be provided as an array")}
            const usersTrackingList = [];
            data.usersTracking.forEach((userTracking)=>{
                const {result, message} = Validations.areFieldsProvided(["userId", "discordChannelId", "status"], userTracking);
                if(!result)
                    return {err: new CustomError(message)}
                const {userId, discordChannelId, status} = userTracking
                usersTrackingList.push({userId, discordChannelId, status})
            })
            await this.discordRepository.addUsersTracking(usersTrackingList);
            return {response: new ApiResponse(true, {})}
        }catch (err){
            return {err}
        }
    }
}

