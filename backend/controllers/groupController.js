const Sequelize = require('../util/database')
const Users = require('../models/usersModel')
const ForgotPasswordRequest = require('../models/forgotPasswordRequests')
const Messages = require('../models/messagesModel')
const Groups = require('../models/groupModel')

const { Op } = require('sequelize');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



exports.createGroup = async (req, res, next) => {
    const t = await Sequelize.transaction();

    try {
        const groupName = req.params.group
        const admin = []
        const members = []

        const group = await Groups.create({
            name: groupName
        }, { transaction: t });


        const currentUser = await Users.findOne({ where: { email: req.user.email } });
        let { secretId, email, name } = currentUser.dataValues
        admin.push({ secretId, email, name })
        await group.addUser(currentUser, { through: { role: 'admin' }, transaction: t });

        for (let data of req.body) {
            let user = await Users.findOne({ where: { email: data } })
            let { secretId, email, name } = user.dataValues
            members.push({ secretId, email, name })
            await group.addUser(user, { transaction: t });
        }

        t.commit()
        res.status(200).json({ success: true, admin, members })
    } catch (error) {
        await t.rollback()
        console.log(error)
    }


}


// groupRoutes.js

// Add user(s) to a group with admin role
// router.post('/groups/:groupId/addUsers', async (req, res) => {
//     try {
//         const {groupName} = req.params
//         const arrUsers = req.body;



//         res.json({ message: 'Users added to group with admin role successfully' });
//     } catch (error) {
//         console.error('Error adding users to group:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });
