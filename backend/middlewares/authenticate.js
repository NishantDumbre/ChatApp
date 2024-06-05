const jwt = require('jsonwebtoken')
const Users = require('../models/users')



exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        const tokenData = jwt.verify(token, process.env.TOKEN_SECRET_KEY)
        const result = await Users.findByPk(tokenData.userId, { attributes: ['id', 'name', 'email'] })
        req.user = result.dataValues
        next()
    }
    catch (error) {
        res.status(401).json({ success: 'Not authenticated' })
    }
}
