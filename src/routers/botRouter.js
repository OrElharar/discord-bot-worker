const express = require("express");
const discordHelper = require("../helpers/discordHelper");
// const auth = require("../middleware/auth");

const router = new express.Router();

router.post("/create-channel", async(req,res, next)=>{
    const {err, response} = await discordHelper.sendCreateChannelMsg(req.body.channelName);
    if(err != null)
        return next(err);
    return res.status(200).send({ data: response });
});

router.post("/move-member", async(req,res, next)=>{
    const {err, response} = await discordHelper.sendCMoveMemberMsg(req.body.channelName, req.body.userId);
    if(err != null)
        return next(err);
    return res.status(200).send({ data: response });
});

router.post("/add-message", async(req,res, next)=>{
    const {err, response} = await discordHelper.sendMessage(req.body.message);
    if(err != null)
        return next(err);
    return res.status(200).send({ data: response });
});


module.exports = router;
