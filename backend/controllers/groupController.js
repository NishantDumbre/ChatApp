const Sequelize = require('../util/database')
const Users = require('../models/usersModel')
const ForgotPasswordRequest = require('../models/forgotPasswordRequests')
const Messages = require('../models/messagesModel')
const Groups = require('../models/groupModel')


const { Op } = require('sequelize');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');



function generateToken(id, name) {
    return jwt.sign({ groupId: id, name }, process.env.TOKEN_SECRET_KEY)
}


exports.createGroup = async (req, res, next) => {
    const t = await Sequelize.transaction();

    try {
        const groupName = req.params.group
        const admin = []
        const members = []

        const group = await Groups.create({
            name: groupName,
            secretId: uuidv4()
        }, { transaction: t });


        const currentUser = await Users.findOne({ where: { email: req.user.email } });
        let { secretId, email, name } = currentUser.dataValues
        admin.push({ secretId, email, name })
        await group.addUser(currentUser, { through: { role: 'admin' }, transaction: t });

        for (let data of req.body) {
            let user = await Users.findOne({ where: { email: data } })
            let { secretId, name } = user.dataValues
            members.push({ secretId, name })
            await group.addUser(user, { transaction: t });
        }

        t.commit()
        res.status(200).json({ success: true, admin, members, name:groupName, secretId:group.secretId })
    } catch (error) {
        await t.rollback()
        console.log(error)
    }


}


exports.getGroupId = async (req, res, next) => {
    try {
        const { secretId } = req.params
        console.log(secretId)
        let group = await Groups.findOne({ where: { secretId } })
        console.log(group)
        res.status(200).json({ success: true, token: generateToken(group.dataValues.id, group.dataValues.name), name:group.dataValues.name})
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error getting ID' })
    }
}




exports.postSendMessage = async (req,res,next) =>{
    const t = await Sequelize.transaction();
    try {
        const {message, category} = req.body
    const {user, group} = req
    
    const sendMessage = await Messages.create({
        message,
        user1:user.id,
        groupId:group.id,
        sender: user.id,
        category
    }, {transaction:t})
    console.log(sendMessage)
    const details = {myId: user.id, sender: user.id}
    await t.commit()
    res.status(201).json({success:true, details})
    } catch (error) {
        await t.rollback
        res.status(400).json(error)
    }
}




exports.getGroupMessages = async (req,res,next) =>{

}