const userController = require('../controllers/usersController')

const {Router} = require('express')
const router = Router()

router.post('/signup', userController.postSignup)
router.post('/login', userController.postLogin)

router.post('/forgot-password', userController.postForgotPassword)


module.exports = router