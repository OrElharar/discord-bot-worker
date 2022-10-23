module.exports.getInsertUserQuery = ()=>{
    return `insert into hyperactive_users (id, name, password, role_id) values ($1, $2, $3, $4)
            RETURNING id, name, role_id as "roleId" ;`
}