
let message = document.getElementById('message')
let send = document.getElementById('send')
let newChat = document.getElementById('new-chat')
let contactsContainer = document.getElementById('user-list')
let addMembersList = document.getElementById('search-members')
let createGroupUsers = document.getElementById('group-user-holder')
let createGroupButton = document.getElementById('add-user')


send.addEventListener('click', sendMessage)
contactsContainer.addEventListener('click', selectUserChat)
addMembersList.addEventListener('change', addMember)
createGroupUsers.addEventListener('click', removeCreateGroupUsers)
createGroupButton.addEventListener('click', createNewGroup)
window.addEventListener('DOMContentLoaded', generateContacts)


const URL = 'http://localhost:3000'





// Fetches the number of registered users from DB. Then a function called createContact is passed that generates the list of contacts in left band
async function generateContacts() {
    let token = localStorage.getItem('token')
    let userAndGroups = await axios.get(`${URL}/get-contacts`, { headers: { 'Authorization': token } })
    let { contacts } = userAndGroups.data
    let { groups } = userAndGroups.data
    for (let group of groups) {
        createContact(group, type='group')
    }
    for (let contact of contacts) {
        createContact(contact, type='user')
    }
}




// Selects a user, id has emailID stored for identification. Gets the actual ID's token of selectd user and saves it. Loads chat window and then all the chats
async function selectUserChat(e) {
    const mainElement = e.target.tagName === 'IMG' || e.target.tagName === 'H3' ? e.target.parentElement : e.target;
    const type = mainElement.classList.contains('list-user') ? 'user' : 'group'
        
    const trueID = await axios.get(`${URL}/get-${type}-id/${mainElement.id}`)    
        console.log(trueID)
    const { token } = trueID.data   // user2 token
    const user1Token = localStorage.getItem('token')  // user1 token
    const { name } = trueID.data     // user2 name
    localStorage.setItem('user2', token)
    console.log(name)
    // await loadUserChatWindow(name)
    // console.log('chat window loaded')
    // loadUserChats(user1Token, token)
}




// Fetches all chats. Then runs a function to manipulate DOM for each data element 
async function loadUserChats(user1Token, user2Token) {
    return new Promise(async (resolve, reject) => {
        let obj = {
            user1: user1Token,
            user2: user2Token
        }
        console.log(obj)
        let messages = await axios.post(`${URL}/get-messages`, obj, { headers: { 'Authorization': user1Token } })
        console.log('showing messages')
        console.log(messages)
        let user = await axios.get(`${URL}/get-myUser`, { headers: { 'Authorization': obj.user1 } })
        myId = user.data

        for (let data of messages.data) {
            createChats(data, myId)
        }
        resolve()
    })
}




// Creates the chat DOM for the chat data passed. This functionw will be passed to another function that fetches all chats
function createChats(data, myId) {
    let list = document.getElementById('chats-list')
    let li = document.createElement('li')
    li.innerHTML = data.message
    console.log('now showing createChat')
    console.log(myId, data.sender, data.message)
    if (myId == data.sender) {
        li.className = 'my-chat chat-window'
    }
    else {
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
    
    const typeClass = type == 'user' ? 'user' : 'group'
    
    let li = document.createElement('li')
    li.className = `list-${typeClass}`
    li.id = contacts.secretId

    let img = document.createElement('img')
    img.className = 'user-dp'
    img.alt = 'DP'
    img.src = './../img.png'
    li.appendChild(img)

    let name = document.createElement('h3')
    name.innerHTML = `${contacts.name}`
    name.className = `${typeClass}-name`
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
    socket.emit('send-message', message.value)
    let result = await axios.post(`${URL}/send-message`, obj, { headers: { 'Authorization': obj.user1 } })
    console.log(result.data.details)
    const { myId } = result.data.details
    const { sender } = result.data.details
    let newObj = { ...obj, myId, sender }
    message.value = ''
    createChats(newObj, myId)
    console.log('now logging newobj')
    console.log(myId, newObj.sender)

}



async function getContacts() {
    let token = localStorage.getItem('token')
    let user = await axios.get(`${URL}/get-contacts`, { headers: { 'Authorization': token } })
    let { contacts } = user.data
    console.log(contacts)

    while (addMembersList.options.length > 0) {
        addMembersList.remove(0);
    }

    let option = document.createElement('option')
    option.innerHTML = "Choose users"
    option.name = "Choose users"
    addMembersList.appendChild(option)

    for (let contact of contacts) {
        let option = document.createElement('option')
        option.innerHTML = contact.name
        option.name = contact.email
        option.id = contact.email
        option.value = contact.name
        addMembersList.appendChild(option)
    }

}




function addMember(e) {
    let selectedIndex = e.target.selectedIndex;
    let selectedOption = e.target.options[selectedIndex];

    let li = document.createElement('li')
    li.id = `${selectedOption.id}`

    let button = document.createElement('button')
    button.innerHTML = 'delete'
    button.className = 'delete'
    let p = document.createElement('p')
    p.innerHTML = selectedOption.value

    li.appendChild(p)
    li.appendChild(button)
    selectedOption.remove()
    createGroupUsers.appendChild(li)
}



function removeCreateGroupUsers(e) {
    if (e.target.classList.contains('delete')) {
        let parentEle = e.target.parentElement
        let siblingEle = e.target.previousElementSibling
        let option = document.createElement('option')
        option.innerHTML = siblingEle.innerHTML
        option.name = parentEle.id
        option.id = parentEle.id
        addMembersList.appendChild(option)
        parentEle.remove()
    }
}



async function createNewGroup(e) {
    e.preventDefault()
    let groupName = document.getElementById('group-name').value
    console.log(groupName)
    let users = createGroupUsers.getElementsByTagName('li');
    if (groupName == '' || users.length < 1) {
        alert('please fill all fields')
    }
    else {
        let arrUsers = []
        for (let i = 0; i < users.length; i++) {
            arrUsers.push(users[i].id)
        }
        let token = localStorage.getItem('token')
        console.log(groupName)
        let group = await axios.post(`${URL}/create-group/${groupName}`, arrUsers, { headers: { 'Authorization': token } })
        console.log(group.data.admin)
        console.log(group.data.members)
    }

}





// Create group modal code
var createGroupScreen = document.getElementById('modal');
var createGroup = document.getElementById("new-group");
var groupSpan = document.getElementsByClassName("close")[0];

createGroup.onclick = function () {
    createGroupScreen.style.display = "block";
    getContacts()
}

groupSpan.onclick = function () {
    createGroupScreen.style.display = "none";
    while (createGroupUsers.firstChild) {
        createGroupUsers.removeChild(createGroupUsers.firstChild);
    }
}

window.onclick = function (event) {
    if (event.target == modal) {
        createGroupScreen.style.display = "none";
        while (createGroupUsers.firstChild) {
            createGroupUsers.removeChild(createGroupUsers.firstChild);
        }
    }
}
