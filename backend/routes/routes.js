const userController = require('../controllers/usersController')
const chatController = require('../controllers/chatController')
const groupController = require('../controllers/groupController')
const authenticationMiddleware = require('../middlewares/authenticate')

const {Router} = require('express')
const router = Router()

router.post('/signup', userController.postSignup)
router.post('/login', userController.postLogin)
router.post('/forgot-password', userController.postForgotPassword)

router.get('/get-contacts', authenticationMiddleware.authenticate, chatController.getContacts)
router.get('/get-user-id/:secretId', chatController.getUserId)

router.post('/send-message', authenticationMiddleware.authenticate, authenticationMiddleware.decodeUsers, chatController.postSendMessage) 
router.post('/get-messages', authenticationMiddleware.authenticate, authenticationMiddleware.decodeUsers, chatController.getAllMessagesBetweenUsers) 
router.get('/get-myUser', authenticationMiddleware.authenticate, userController.getMyUser) 

router.post('/create-group/:group', authenticationMiddleware.authenticate, groupController.createGroup)

module.exports = router