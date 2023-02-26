import {RolesRepository} from "../studentcher-shared-utils/repositories/RolesRepository";
import pgClient from "../storage/postgresAdapter";

export default new RolesRepository(pgClient);
