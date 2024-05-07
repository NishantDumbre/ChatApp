const Users = require('../models/usersModel')
const ForgotPasswordRequest = require('../models/forgotPasswordRequests')
const Sequelize = require('../util/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const Sib = require('sib-api-v3-sdk');



function generateToken(id, name) {
    return jwt.sign({ userId: id, name }, process.env.TOKEN_SECRET_KEY)
}


exports.postSignup = async (req, res, next) => {
    const { name, email, phone, password } = req.body;

    let failed = [];
    const phoneExists = await Users.findAll({ where: { phone } });
    if (phoneExists.length) {
        const err = { error: 'phone', message: 'Phone number already registered' }
        failed.push(err)
    }
    const emailExists = await Users.findAll({ where: { email } });
    if (emailExists.length) {
        const err = { error: 'email', message: 'Email already registered' }
        failed.push(err)
    }
    if (password.length < 8) {
        failed.push({ error: 'password', message: 'Password length less than 8 characters' });
    }

    if (!failed.length) {
        bcrypt.hash(password, 10, async (err, hash) => {
            console.log(err, 'this is error');
            const t = await Sequelize.transaction();
            try {
                await Users.create({
                    name,
                    email,
                    phone,
                    password: hash,
                    secretId: uuidv4()
                }, { transaction: t });
                await t.commit();
                res.status(201).json({ success: true });
            } catch (error) {
                await t.rollback();
                res.status(500).json({ success: false, message: 'Please try again' });
            }
        });
    } else {
        res.status(200).json({ success: false, failed });
    }
}




exports.postLogin = async (req, res, next) => {
    try {
        let { email, password } = req.body
        const result = await Users.findOne({ where: { email } })
        console.log(result)
        let failed = []

        if (!result) {
            console.log('result block')
            failed.push({ error: 'email', message: 'User not found' })
            res.status(200).json({ success: false, failed })
        }
        else {
            let fetchedPassword = result.dataValues.password
            bcrypt.compare(password, fetchedPassword, async (err, bcryptResult) => {
                if (err) {
                    throw new Error({ error: 'bcryptError', message: 'Something went wrong' })
                }
                if (bcryptResult === false) {
                    failed.push({ error: 'password', message: 'Password is wrong' })
                    return res.status(200).json({ success: false, failed })
                }
                else {
                    res.status(200).json({ success: true, token: generateToken(result.dataValues.id, result.dataValues.name), id: result.dataValues.id })
                }
            })
        }
    } catch (error) {
        console.log('error block')
        return res.status(400).json(error)
    }
}




exports.postForgotPassword = async (req, res, next) => {
    try {
        //const t = await Sequelize.transaction()
        const { email } = req.body
        let failed = []

        const user = await Users.findOne({ where: { email } })
        if (!user) {
            failed.push({ error: 'email', message: 'User not found' })
            res.status(200).json({ success: false, failed })
        }
        else {
            console.log(user)
            let request = await user.createForgotPasswordRequest({
                id: uuidv4(),
                email
            })
            const client = Sib.ApiClient.instance;
            const apiKey = client.authentications['api-key'];
            apiKey.apiKey = process.env.SENDINBLUE_KEY;
            const tranEmailApi = new Sib.TransactionalEmailsApi();
            const sender = { email: 'nishant.dumbre@gmail.com' };
            const receiver = [{ email }];
            await tranEmailApi.sendTransacEmail({
                sender,
                to: receiver,
                subject: 'Forgot password Sharpener Chat App',
                textContent: `Following is the link to reset password: http://localhost:3000/password/reset-password/${request.id}`
            });
            //await t.commit()
            res.json({ success: true });
        }
    } catch (error) {
        //await t.rollback()
        console.error('Error sending email:', error);
        res.status(400).json({ success: false });
    }

}



exports.getMyUser = async(req,res,next) =>{
    console.log(req.user)
    res.json(req.user.id)
}