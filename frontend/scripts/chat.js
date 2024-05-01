
let message = document.getElementById('message')
let send = document.getElementById('send')
let newChat = document.getElementById('new-chat')
let contactsContainer = document.getElementById('user-list')

send.addEventListener('click', sendMessage)
contactsContainer.addEventListener('click', selectUserChat)
window.addEventListener('DOMContentLoaded', generateContacts)

let URL = 'http://localhost:3000'




// Fetches the number of registered users from DB. Then a function called createContact is passed that generates the list of contacts in left band
async function generateContacts() {
    let token = localStorage.getItem('token')
    let user = await axios.get(`${URL}/get-contacts`, { headers: { 'Authorization': token } })
    let { contacts } = user.data
    for (let contact of contacts) {
        createContact(contact)
    }
}




// Selects a user, id has emailID stored for identification. Gets the actual ID's token of selectd user and saves it. Loads chat window and then all the chats
async function selectUserChat(e) {
    let userID = e.target.tagName === 'IMG' || e.target.tagName === 'H3' ? e.target.parentElement.id : e.target.id;
    let trueID = await axios.get(`${URL}/get-id/${userID}`)
    const { token } = trueID.data   // user2 token
    const user1Token = localStorage.getItem('token')  // user1 token
    const { name } = trueID.data
    localStorage.setItem('user2', token)
    await loadUserChatWindow(name)
    console.log('chat window loaded')
    loadUserChats(user1Token, token)
}




// Fetches all chats. Then runs a function to manipulate DOM for each data element 
async function loadUserChats(user1Token, user2Token){
    let obj = {
        user1:user1Token,
        user2:user2Token
    }
    console.log(obj)
    let messages = await axios.post(`${URL}/get-messages`, obj, { headers: { 'Authorization': user1Token } })
    console.log('showing messages')
    console.log(messages)
    let user = await axios.get(`${URL}/get-myUser`, { headers: { 'Authorization': obj.user1 } })
    myId = user.data

    for( let data of messages.data){
        createChats(data, myId)
        //console.log(data)
    }
}




// Creates the chat DOM for the chat data passed. This functionw will be passed to another function that fetches all chats
function createChats(data, myId){
    let list = document.getElementById('chats-list')
    let li = document.createElement('li')
    li.innerHTML = data.message
    console.log('now showing createChat')
    console.log(myId, data.sender, data.message)
    if(myId === data.sender){
        li.className = 'my-chat chat-window'
    }
    else{
        li.className = 'others-chat chat-window'
    }
    list.appendChild(li)

}




// Removes existing chat window and loads the chat window of selected user. Returns a promise
async function loadUserChatWindow(name) {
    return new Promise((resolve, reject) => {
        let chatWindowDiv = document.getElementById('chat-box')
        if (chatWindowDiv.children[0]) {
            chatWindowDiv.removeChild(chatWindowDiv.children[0])
        }
        let ul = document.createElement('ul')
        ul.id = 'chats-list'
        ul.className = 'chats-list'
        chatWindowDiv.appendChild(ul)
        let titleContainer = document.getElementById('title-container')
        titleContainer.children[1].innerHTML = `${name}`
        resolve()
    })
}




// Creates the contact person UI and appends it to the left band contact list container
function createContact(contacts) {
    let li = document.createElement('li')
    li.className = 'list-user'
    li.id = contacts.email

    let img = document.createElement('img')
    img.className = 'user-dp'
    img.alt = 'DP'
    img.src = './../img.png'
    li.appendChild(img)

    let name = document.createElement('h3')
    name.innerHTML = `${contacts.name}`
    name.className = 'user-name'
    li.appendChild(name)

    contactsContainer.appendChild(li)
}




async function sendMessage(e) {
    e.preventDefault()

    let obj = {
        message: message.value,
        user1: localStorage.getItem('token'),
        user2: localStorage.getItem('user2')
    }
    console.log(obj)
    let result = await axios.post(`${URL}/send-message`, obj, { headers: { 'Authorization': obj.user1 } })
    console.log(result.data.details)
    const {myId} = result.data.details
    const {sender} = result.data.details
    let newObj = {...obj, myId, sender}
    message.value=''
    createChats(newObj, myId)
    console.log('now logging newobj')
    console.log(myId, newObj.sender)
    
}




