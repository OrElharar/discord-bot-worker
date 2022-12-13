export function getInsertUseTrackingQuery(){
    return `insert into user_tracking_history (user_id, discord_channel_id, status) values ($1, $2, $3);`
}
