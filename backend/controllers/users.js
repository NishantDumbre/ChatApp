const Users = require('../models/users')
//const ForgotPasswordRequest = require('../models/forgot-password-request')
const Sequelize = require('../utils/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const Sib = require('sib-api-v3-sdk');



function generateToken(id, name) {
    return jwt.sign({ userId: id, name }, process.env.TOKEN_SECRET_KEY)
}


exports.postSignup = async (req, res, next) => {
    const { name, email, phone, password } = req.body;

    let errors = [];
    const phoneExists = await Users.findAll({ where: { phone } });
    if (phoneExists.length) {
        const err = { errorType: 'phone', message: 'Phone number already registered' };
        errors.push(err);
    }
    const emailExists = await Users.findAll({ where: { email } });
    if (emailExists.length) {
        const err = { errorType: 'email', message: 'Email already registered' };
        errors.push(err);
    }
    if (password.length < 8) {
        errors.push({ errorType: 'password', message: 'Password length less than 8 characters' });
    }

    if (!errors.length) {
        try {
            const hash = await bcrypt.hash(password, 10);
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
                res.status(500).json({ success: false, errors: [{ errorType: 'serverError', message: 'Internal server error' }] });
            }
        } catch (error) {
            console.error('Error hashing password:', error);
            res.status(500).json({ success: false, errors: [{ errorType: 'serverError', message: 'Internal server error' }] });
        }
    } else {
        res.status(401).json({ success: false, errors });
    }
}





exports.postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ where: { email } });

        // user doesn't exist
        if (!user) {
            return res.status(404).json({ success: false, errors: { errorType: 'email', message: 'User not found' } });
        }

        const bcryptResult = await bcrypt.compare(password, user.dataValues.password);
        // wrong password
        if (!bcryptResult) {
            return res.status(401).json({ success: false, errors: { errorType: 'password', message: 'Password is wrong' } });
        }
        // Successful login
        return res.status(200).json({ success: true, token: generateToken(user.dataValues.id, user.dataValues.name), id: user.dataValues.id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, errors: { errorType: 'serverError', message: 'Internal server error' } });
    }
};




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

