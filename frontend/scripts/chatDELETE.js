
let message = document.getElementById('message')
let send = document.getElementById('send')
let newChat = document.getElementById('new-chat')
let contactsContainer = document.getElementById('user-list')
let addMembersList = document.getElementById('search-members')
let createGroupUsers = document.getElementById('group-user-holder')
let groupUserDetails = document.getElementById('group-user-details')
let createGroupButton = document.getElementById('add-user')
let groupUsersDetailsContainer = document.getElementById('group-user-details-container')


send.addEventListener('click', sendMessage)
contactsContainer.addEventListener('click', openContactChat)
addMembersList.addEventListener('change', addMember)
createGroupUsers.addEventListener('click', removeCreateGroupUsers)
createGroupButton.addEventListener('click', createNewGroup)
groupUserDetails.addEventListener('click', deleteGroupMember)
window.addEventListener('DOMContentLoaded', generateLeftPanelContactList)


const URL = 'http://localhost:3000'





// Fetches the number of registered users and groups from DB. Then a function called createContactUI is passed that generates the list of contacts in left band
async function generateLeftPanelContactList() {
    let token = localStorage.getItem('token')
    let userAndGroups = await axios.get(`${URL}/get-contacts`, { headers: { 'Authorization': token } })
    let { contacts } = userAndGroups.data
    let { groups } = userAndGroups.data
    for (let group of groups) {
        createContactUI(group, type = 'group')
    }
    for (let contact of contacts) {
        createContactUI(contact, type = 'user')
    }
}




// Selects a user or groups, id has the uuid stored for identification. Gets the actual ID's token of selectd user and saves it. Loads chat window and then all the chats. Appending the category in class on send button. Will be used to send message to either a group or a user
async function openContactChat(e) {
    const mainElement = e.target.tagName === 'IMG' || e.target.tagName === 'H3' ? e.target.parentElement : e.target;
    const type = mainElement.classList.contains('list-user') ? 'user' : 'group'
    send.classList = type == 'user' ? 'button user' : 'button group'
    chatWindowBanner.classList = type == 'user' ? 'title-container' : 'title-container group'

    const trueID = await axios.get(`${URL}/get-${type}-id/${mainElement.id}`)    // gets the 2nd user or group's token
    const user2Token = trueID.data.token       // user2 or group token
    const user1Token = localStorage.getItem('token')        // user1, that is my token
    const { name } = trueID.data        // user2 or group name
    localStorage.setItem('user2', user2Token)
    console.log(name)
    await loadUserChatWindow(name)
    console.log('chat window loaded')
    fetchContactChats(user1Token, user2Token, type)
}




// Fetches all chats for A User. Then runs a function to manipulate DOM for each data element 
async function fetchContactChats(user1Token, user2Token, type) {
    return new Promise(async (resolve, reject) => {
        let obj = {
            user1: user1Token,
            user2: user2Token
        }
        console.log(obj)
        let messages = await axios.post(`${URL}/get-${type}-messages`, obj, { headers: { 'Authorization': user1Token } })
        let user = await axios.get(`${URL}/get-myUser`, { headers: { 'Authorization': obj.user1 } })
        myId = user.data

        for (let data of messages.data) {
            createAndLoadMessages(data, myId)
        }
        resolve()
    })
}




// Creates the chat DOM for the chat data passed. This functionw will be passed to another function that fetches all chats. Used for both users and groups
function createAndLoadMessages(data, myId) {
    let list = document.getElementById('chats-list')
    let li = document.createElement('li')
    if (myId == data.sender) {
        li.className = 'my-chat chat-window'
    }
    else {
        if (data.Sender.name) {
            let name = document.createElement('h4')
            name.innerHTML = data.Sender.name
            li.appendChild(name)
            console.log('>>>>>>>><<>M<<<<<<<<<<<')
            console.log(li)
        }
        li.className = 'others-chat chat-window'
    }
    let p = document.createElement('p')
    p.innerHTML = data.message
    li.appendChild(p)
    console.log('now showing createChat')
    console.log(li)

    list.appendChild(li)

}




// Removes existing chat window and loads the chat window of selected user or groups. Returns a promise
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




// Creates the contact person UI and appends it to the left band contact list container. Used for both users and groups
function createContactUI(contacts) {

    const typeClass = type == 'user' ? 'user' : 'group'

    let li = document.createElement('li')
    li.className = `list-${typeClass}`
    li.id = contacts.secretId

    let img = document.createElement('img')
    img.className = 'user-dp'
    // img.alt = 'DP'
    // img.src = './../img.png'
    li.appendChild(img)

    let name = document.createElement('h3')
    name.innerHTML = `${contacts.name}`
    name.className = `${typeClass}-name`
    li.appendChild(name)

    contactsContainer.appendChild(li)
}



// Used to send message
async function sendMessage(e) {
    e.preventDefault()
    let category = send.classList.contains('user') ? 'user' : 'group'

    let obj = {
        message: message.value,
        user1: localStorage.getItem('token'),  //sender
        user2: localStorage.getItem('user2'),   // receiver , group
        category
    }
    console.log(obj)
    let result = await axios.post(`${URL}/send-${category}-message`, obj, { headers: { 'Authorization': obj.user1 } })
    console.log(result.data.details)
    const { myId } = result.data.details
    const { sender } = result.data.details
    let newObj = { ...obj, myId, sender }
    message.value = ''
    createAndLoadMessages(newObj, myId)
    console.log('now logging newobj')
    console.log(myId, newObj.sender)

}



// Used in Create Group button. Loads the list of available users to add to the group
async function getCreateGroupContacts() {
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




// Used in Create Group functionality. Selects members to add in a group
function addMember(e) {
    let selectedIndex = e.target.selectedIndex;     // gets the index of the selected option
    let selectedOption = e.target.options[selectedIndex];      // gets the selected option

    let li = document.createElement('li')
    li.id = `${selectedOption.id}`

    let button = document.createElement('button')
    button.innerHTML = 'delete'
    button.className = 'delete'
    let p = document.createElement('p')
    p.innerHTML = selectedOption.value

    li.appendChild(p)
    li.appendChild(button)
    selectedOption.remove()     // removes the option from the select list since we are adding it to our selected users
    createGroupUsers.appendChild(li)
}



// Used in Create Group functionality. Removes the selected user from the create group list and makes it available to select again
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




// Creates a new group and appends the DOM to the left contacts list
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
        console.log(group.data, 'this is the group name')
        createContactUI(group.data, type = 'group')
    }

}



function loadGroupMembers(data, role) {
    let li = document.createElement('li')
    li.innerHTML = `${data.name}`
    if (role == 'admin') {
        li.id = data.secretId
        let button = document.createElement('button')
        button.innerHTML = 'delete'
        button.className = 'delete'
        li.appendChild(button)
    }
    groupUserDetails.appendChild(li)
}


async function deleteGroupMember(e) {
    if (e.target.classList.contains('delete')) {
        console.log(e.target, 'TARGETTTT')
        let parentEle = e.target.parentElement
        const token = localStorage.getItem('token')
        const groupToken = localStorage.getItem('user2')
        const obj = {
            user2: groupToken,
            toDeleteId: parentEle.id
        }
        const result = await axios.post(`${URL}/delete-group-member`, obj, { headers: { 'Authorization': token } })
        if (result.data.success == true) {
            parentEle.remove()
        }
    }
}


async function getGroupMembersForAdding() {
    let select = document.createElement('select')
    select.id = 'missingUsersFromGroup'
    
    const groupToken = localStorage.getItem('user2')
    const token = localStorage.getItem('token')
    let role = 'member'
    const members = await axios.get(`${URL}/get-group-members-to-add/${groupToken}`, { headers: { 'Authorization': token } })    
    for(let data of members.data.nonGroupMembers){
        let option = document.createElement('option')
        option.innerHTML = data.name
        option.id = data.secretId
        select.appendChild(option)
    }
    groupUsersDetailsContainer.appendChild(select)
}



var userGroupDetailsModal = document.getElementById('group-user-details-modal');
var chatWindowBanner = document.getElementById("title-container");
var groupSpan = document.getElementsByClassName("close")[1];

chatWindowBanner.onclick = async function () {
    if (!chatWindowBanner.classList.contains('group')) {
        return
    }
    const groupNameContainer = document.getElementById('group-name-container')
    groupNameContainer.innerHTML = chatWindowBanner.children[1].textContent
    const groupToken = localStorage.getItem('user2')
    const token = localStorage.getItem('token')
    let role = 'member'
    const members = await axios.get(`${URL}/get-group-members/${groupToken}`, { headers: { 'Authorization': token } })
    const checkAdmin = await axios.get(`${URL}/check-group-admin/${groupToken}`, { headers: { 'Authorization': token } })
    if (checkAdmin.data.success == true) {
        role = 'admin'
        getGroupMembersForAdding()
    }
    for (let data of members.data) {
        console.log(data)
        loadGroupMembers(data, role)
    }
    userGroupDetailsModal.style.display = "block";
}

groupSpan.onclick = function () {
    userGroupDetailsModal.style.display = "none";
    while (groupUserDetails.firstChild) {
        groupUserDetails.removeChild(groupUserDetails.firstChild);
    }
    document.getElementById('missingUsersFromGroup').remove()
}

window.onclick = function (event) {
    console.log(event.target)
    if (event.target == userGroupDetailsModal) {
        userGroupDetailsModal.style.display = "none";
        while (groupUserDetails.firstChild) {
            groupUserDetails.removeChild(groupUserDetails.firstChild);
        }
        document.getElementById('missingUsersFromGroup').remove()
    }
}





// Create group modal code
var createGroupScreen = document.getElementById('new-group-modal');
var createGroup = document.getElementById("new-group");
var groupSpan = document.getElementsByClassName("close")[0];

createGroup.onclick = function () {
    createGroupScreen.style.display = "block";
    getCreateGroupContacts()
}

groupSpan.onclick = function () {
    createGroupScreen.style.display = "none";
    while (createGroupUsers.firstChild) {
        createGroupUsers.removeChild(createGroupUsers.firstChild);
    }
}

window.onclick = function (event) {
    console.log(event.target)
    if (event.target == createGroupScreen) {
        createGroupScreen.style.display = "none";
        while (createGroupUsers.firstChild) {
            createGroupUsers.removeChild(createGroupUsers.firstChild);
        }
    }
}
