import {AuthorizationService} from "../studentcher-shared-utils/services/AuthorizationService";
import rolesRepository from "../repositories/RolesRepository";
import cloudStorageAdapter from "../storage/CloudStorageAdapter";

export default new AuthorizationService(rolesRepository, cloudStorageAdapter);
