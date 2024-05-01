const jwt = require('jsonwebtoken')
const Users = require('../models/usersModel')


exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        const tokenData = jwt.verify(token, process.env.TOKEN_SECRET_KEY)
        let result = await Users.findByPk(tokenData.userId)
        req.user = result.dataValues
        console.log(`Authenticated ${req.user.name}`)
        next()
    } 
    catch (error) {
        res.status(401).json({success:'Not authenticated'})
    }
}



exports.decodeUsers = async (req, res, next) => {
    try {
        const token = req.body.user2
        const tokenData = jwt.verify(token, process.env.TOKEN_SECRET_KEY)
        let result = await Users.findByPk(tokenData.userId)
        req.user2 = result.dataValues
        console.log(`Authenticated ${req.user2.name}`)
        next()
    } 
    catch (error) {
        res.status(401).json({success:'2nd user not found'})
    }
}