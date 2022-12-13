import { IClientRequestData } from "src/models/ClientRequestData";
import { CustomError } from "src/models/CustomError";
import { ServiceResponse } from "src/models/ServiceResponse";
import {DiscordRepository} from "../repositories/DiscordRepository";
import {Validations} from "../helpers/ValidationsHelper";

export abstract class DiscordService{
    static async addUserTracking(data: IClientRequestData) : Promise<ServiceResponse>{
        try {
            const {result, message} = Validations.areFieldsProvided(["name"], data);
            if(!result)
                return {err: new CustomError(message)}
            await DiscordRepository.addUserTracking(data)
        //     data.userId, data.discordChannelId, data.status
        }catch (err){
            return {err}
        }
    }
}
