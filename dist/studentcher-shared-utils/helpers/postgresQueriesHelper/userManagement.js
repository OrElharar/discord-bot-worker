"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsertUserActivityVideoStatusQuery = exports.getInsertUserActivityQuery = exports.getSelectPersonalZoneQuery = exports.getDeleteUsersQuery = exports.getUpdateUserQuery = exports.getSelectIsUserPermissionAllowedQuery = exports.getSelectIsRoleIdValid = exports.getInsertUserQuery = exports.getSelectRolesDataQuery = exports.getSelectUsersQuery = exports.getSelectUserDataQuery = exports.getSelectUserPermissionsQuery = void 0;
function getSelectUserPermissionsQuery() {
    return `select json_build_object(  'userManagementEnabled', user_management_enabled, 
                                    'activityManagementEnabled', activity_management_enabled,
                                     'studyPlanManagementEnabled', plan_management_enabled)  as "userPermissions"
            from roles r 
            join users u on u.id = $1 and u.role_id = r.id ;`;
}
exports.getSelectUserPermissionsQuery = getSelectUserPermissionsQuery;
function getSelectUserDataQuery() {
    return `select id, name, phone_number, date_of_birth, profile_picture_url as "phoneNumber", role_id as "roleId"
            from users where id = $1 ;`;
}
exports.getSelectUserDataQuery = getSelectUserDataQuery;
function getSelectUsersQuery() {
    return `WITH RECURSIVE traverse AS (
               SELECT role_id as id FROM users
               WHERE id = $1
               UNION ALL
               SELECT managed_role_id as id  FROM roles_hierarchy
               INNER JOIN traverse
               ON traverse.id = roles_hierarchy.responsible_role_id
            )
            select u.id, name, phone_number as "phoneNumber", role_id as "roleId", discord_user_id as "discordUserId"
            from users u 
            join traverse t on t.id = u.role_id `;
}
exports.getSelectUsersQuery = getSelectUsersQuery;
function getSelectRolesDataQuery() {
    return `WITH RECURSIVE traverse AS (
               SELECT role_id as id FROM users
               WHERE id = $1
               UNION ALL
               SELECT managed_role_id as id  FROM roles_hierarchy
               INNER JOIN traverse
               ON traverse.id = roles_hierarchy.responsible_role_id
            )
            SELECT rd.id, rd.name, rd.managed_roles as "managedRolesIds" 
            from roles_data rd join traverse t on t.id = rd.id ;  `;
}
exports.getSelectRolesDataQuery = getSelectRolesDataQuery;
function getInsertUserQuery() {
    return `insert into users (id, name, password, phone_number, role_id, discord_user_id) 
            values ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, phone_number as "phoneNumber", role_id as "roleId" ;`;
}
exports.getInsertUserQuery = getInsertUserQuery;
function getSelectIsRoleIdValid() {
    return `WITH RECURSIVE traverse AS (
               SELECT role_id as id FROM users
               WHERE id = $1
               UNION ALL
               SELECT managed_role_id as id  FROM roles_hierarchy
               INNER JOIN traverse
               ON traverse.id = roles_hierarchy.responsible_role_id
            ), traverse_agg as (
                select array_agg(id) as id_list from traverse )
            SELECT $2 = any(id_list) as "isRoleAccessible" FROM traverse_agg ; `;
}
exports.getSelectIsRoleIdValid = getSelectIsRoleIdValid;
function getSelectIsUserPermissionAllowedQuery(permissionField) {
    return `select count(users.id)::int > 0 as "isUserPermissionAllowed"
             from users
             join roles on users.role_id = roles.id
             where users.id = $1 and
             roles.${permissionField} = true`;
}
exports.getSelectIsUserPermissionAllowedQuery = getSelectIsUserPermissionAllowedQuery;
function getUpdateUserQuery() {
    return `UPDATE users SET 
                phone_number             = COALESCE($2, phone_number),
                name                     = COALESCE($3, name),
                role_id                  = COALESCE($4, role_id),
                password                 = COALESCE($5, password),
                discord_user_id          = COALESCE($6, discord_user_id)                 
                WHERE id = $1 
            RETURNING id, name, phone_number as "phoneNumber", role_id as "roleId" `;
}
exports.getUpdateUserQuery = getUpdateUserQuery;
function getDeleteUsersQuery() {
    return `delete from users where id = any($1)
            RETURNING id, name, phone_number as "phoneNumber", role_id as "roleId" `;
}
exports.getDeleteUsersQuery = getDeleteUsersQuery;
function getSelectPersonalZoneQuery() {
    return `select u.id as "userId", u.name as "userName", r.name as "roleName", p.name as "planName", p.id as "planId",
            current_activity as "currentActivity", is_plan_finished as "isPlanFinished", last_video_seen_index as "lastVideoSeenIndex"
            from users u 
            join roles r on u.id = $1 and u.role_id = r.id
            left join user_current_activity(array[$1]) uca on u.id = uca.user_id  
            left join plans p on uca.plan_id = p.id ; `;
}
exports.getSelectPersonalZoneQuery = getSelectPersonalZoneQuery;
function getInsertUserActivityQuery() {
    return `insert into user_activity_history (user_id, plan_id, activity_id, started_at, ended_at)  
            select $1, $2, $3, now(), CASE when $4 = true then now() else null END 
            on conflict (user_id, plan_id, activity_id) do update set 
                ended_at = EXCLUDED.ended_at;`;
}
exports.getInsertUserActivityQuery = getInsertUserActivityQuery;
function getInsertUserActivityVideoStatusQuery() {
    return `insert into user_activity_video_status_history ( user_id, plan_id, activity_id, video_index, is_completed  )  
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING user_id as "userId", plan_id as "planId", activity_id as "activityId", video_index as "videoIndex", is_completed as "isCompleted" ;`;
}
exports.getInsertUserActivityVideoStatusQuery = getInsertUserActivityVideoStatusQuery;
//# sourceMappingURL=userManagement.js.map