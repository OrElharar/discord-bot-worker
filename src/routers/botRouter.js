const express = require("express");
const discordApiHelper = require("../helpers/discordApiHelper");
require("../helpers/discordBotHelper");
// const auth = require("../middleware/auth");

const router = new express.Router();

router.post("/create-channel", async(req,res, next)=>{
    const {err, response} = await discordApiHelper.sendCreateChannelMsg(req.body.channelName);
    if(err != null)
        return next(err);
    return res.status(200).send({ data: response });
});

router.post("/move-member", async(req,res, next)=>{
    const {err, response} = await discordApiHelper.sendCMoveMemberMsg(req.body.channelName, req.body.userId);
    if(err != null)
        return next(err);
    return res.status(200).send({ data: response });
});

router.post("/play-audio", async(req,res, next)=>{
    const {err, response} = await discordApiHelper.sendBotPlayAudio(req.body.channelName, req.body.url);
    if(err != null)
        return next(err);
    return res.status(200).send({ data: response });
});

router.post("/add-message", async(req,res, next)=>{
    const {err, response} = await discordApiHelper.sendMessage(req.body.message);
    if(err != null)
        return next(err);
    return res.status(200).send({ data: response });
});


module.exports = router;
