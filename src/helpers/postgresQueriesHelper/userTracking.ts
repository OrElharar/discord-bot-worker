export function getInsertUserTrackingQuery(){
    return `insert into user_tracking_history (user_id, discord_channel_id, status) values ($1, $2, $3);`
}

export function getSelectUsersDiscordDataQuery(){
    return `select id as "userId", discord_user_id as "discordUserId" from users`
}
