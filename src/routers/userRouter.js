const express = require('express');
const userManagementHelper = require("../helpers/userManagementHelper");
const authenticationHelper = require("../helpers/authenticationHelper");

const router = new express.Router();


router.post("/users", async (req, res, next) => {
    const data = { ...req.body };
    try {
        const {err, response} = await userManagementHelper.addUser(data)
        if(err != null)
            return next(err)
        res.status(201).send({ data: response });
    } catch (err) {
        return res.status(400).send({
            status: 400,
            message: err.message
        })
    }
});

router.get("/users", async (req, res) => {
        res.status(200).send();
});


module.exports = router