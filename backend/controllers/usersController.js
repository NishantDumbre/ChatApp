const Users = require('../models/usersModel')
const bcrypt = require('bcrypt')


exports.signup = async (req,res,next) =>{
    const {name, email, phone, password} = req.body
    let failed = []

    const phoneExists = await Users.findAll({where:{phone}})
    console.log(phoneExists)

    const emailExists = await Users.findAll({where:{email}})
    console.log(emailExists)

    if(password.length < 8){
        failed.push('password')
    }


    if(!failed.length){
        bcrypt.hash(password, 10, async (err,hash)=>{
            console.log(err, 'this is erropr')
            await Users.create({
                name,
                email,
                phone,
                password: hash
            })
        })
        res.status(201).json({success:true})
    }
    else{
        res.status(400).json({success:false})
    }
}