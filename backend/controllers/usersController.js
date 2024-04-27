const Users = require('../models/usersModel')
const bcrypt = require('bcrypt')
const Sequelize = require('../util/database')

exports.signup = async (req, res, next) => {
    const { name, email, phone, password } = req.body;
    console.log(req.body);
    let failed = [];

    const phoneExists = await Users.findAll({ where: { phone } });
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',phoneExists)
    if(phoneExists.length){
        const err = {error:'phone', message:'Phone number already registered'}
        failed.push(err)
    }

    const emailExists = await Users.findAll({ where: { email } });
    if(emailExists.length){
        const err = {error:'email', message:'Email already registered'}
        failed.push(err)
    }

    if (password.length < 8) {
        failed.push({error:'password', message:'Password length less than 8 characters'});
    }

    console.log(failed, 'faileddddddddddddddddddd')
    if (!failed.length) {
        bcrypt.hash(password, 10, async (err, hash) => {
            console.log(err, 'this is error');
            const t = await Sequelize.transaction();
            try {
                await Users.create({
                    name,
                    email,
                    phone,
                    password: hash
                }, { transaction: t });
                await t.commit();
                res.status(201).json({ success: true });
            } catch (error) {
                await t.rollback();
                res.status(500).json({ success: false, message:'Please try again'});
            }
        });
    } else {
        res.status(200).json({ success: false, failed });
    }
}
