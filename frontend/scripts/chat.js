
let message = document.getElementById('message')
let send = document.getElementById('send')
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




// DONE DONE DONE
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



// DONE DONE DONE DONE
// Selects a user or groups, id has the uuid stored for identification. Gets the actual ID's token of selectd user and saves it. Loads chat window and then all the chats. Appending the category in class on send button. Will be used to send message to either a group or a user
async function openContactChat(e) {
    if(e.target.tagName == 'UL')return
    const mainElement = e.target.tagName === 'IMG' || e.target.tagName === 'H3' ? e.target.parentElement : e.target;
    const name = mainElement.children[1].textContent
    const type = mainElement.classList.contains('list-user') ? 'user' : 'group'
    send.classList = type == 'user' ? 'button user' : 'button group'
    localStorage.setItem('receiver', mainElement.id)
    chatWindowBanner.classList = type == 'user' ? 'title-container' : 'title-container group'
    const token = localStorage.getItem('token')        
    await loadUserChatWindow(name)
    fetchContactChats(token, mainElement.id, type)
}



// DONE DONE DONE DONE
// Fetches all chats for A User. Then runs a function to manipulate DOM for each data element 
async function fetchContactChats(token, receiver, type) {
    return new Promise(async (resolve, reject) => {
        let result = await axios.post(`${URL}/get-${type}-messages`, {receiver}, { headers: { 'Authorization': token } })
        for (let data of result.data.messages) {
            //createAndLoadMessages(data, result.data.loggedInUser.name)
            createAndLoadMessages(data.Sender, data.Receiver, result.data.loggedInUser, data.message)
        }
        resolve()
    })
}



// DONE DONE DONE DONE
// Creates the chat DOM for the chat data passed. This functionw will be passed to another function that fetches all chats. Used for both users and groups
function createAndLoadMessages(sender, receiver, loggedInUser, message) {
    let list = document.getElementById('chats-list')
    let li = document.createElement('li')
    if (loggedInUser.id == sender.id) {
        li.className = 'my-chat chat-window'
    }
    else {
        if (sender.name) {
            let name = document.createElement('h4')
            name.className = 'chat-user-name'
            name.innerHTML = sender.name
            li.appendChild(name)
        }
        li.className = 'others-chat chat-window'
    }
    let p = document.createElement('p')
    p.className = 'chat-user-message'
    p.innerHTML = message
    li.appendChild(p)
    list.appendChild(li)
}



// DONE DONE DONE DONE DONE
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



// DONE DONE DONE DONE
// Creates the contact person UI and appends it to the left band contact list container. Used for both users and groups
function createContactUI(contacts) {

    const typeClass = type == 'user' ? 'user' : 'group'
    let li = document.createElement('li')
    li.className = `list-${typeClass}`
    li.id = contacts.id

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



//  DONE DONE DONE DONE
// Used to send message
async function sendMessage(e) {
    e.preventDefault()
    if(!message.value) return
    const category = send.classList.contains('user') ? 'user' : 'group'
    const token = localStorage.getItem('token')
    const obj = {
        message: message.value,
        receiver: localStorage.getItem('receiver'),   // receiver , group
        category
    }
    const result = await axios.post(`${URL}/send-${category}-message`, obj, { headers: { 'Authorization': token } })
    const { sender, receiver, loggedInUser } = result.data.details
    message.value = ''
    createAndLoadMessages(sender, receiver, loggedInUser, obj.message)
}



//  DONE DONE DONE DONE
// Used in Create Group button. Loads the list of available users to add to the group
async function getCreateGroupContacts() {
    let token = localStorage.getItem('token')
    let user = await axios.get(`${URL}/get-contacts`, { headers: { 'Authorization': token } })
    let { contacts } = user.data

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
        option.name = contact.name
        option.id = contact.id
        option.value = contact.name
        addMembersList.appendChild(option)
    }
}




//  DONE DONE DONE DONE
// Used in Create Group functionality. Selects members to add in a group by adding them in a list of users to be added to the group
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



//  DONE DONE DONE DONE
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



//  DONE DONE DONE DONE
// Creates a new group and appends the DOM to the left contacts list
async function createNewGroup(e) {
    e.preventDefault()
    let groupName = document.getElementById('group-name').value
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
        let group = await axios.post(`${URL}/create-group/${groupName}`, arrUsers, { headers: { 'Authorization': token } })
        createContactUI(group.data, type = 'group')
    }

}



//  DONE DONE DONE DONE
// On clicking group name in chat window, shows the list of members. The admin has the delete button available
function loadGroupMembers(data, role) {
    console.log(data)
    let li = document.createElement('li')
    li.innerHTML = `${data.name}`
    if (role == 'admin') {
        li.id = data.usergroup.id
        let button = document.createElement('button')
        button.innerHTML = 'delete'
        button.className = 'delete'
        li.appendChild(button)
    }
    groupUserDetails.appendChild(li)
}




//  DONE DONE DONE DONE
async function deleteGroupMember(e) {
    if (e.target.classList.contains('delete')) {
        let parentEle = e.target.parentElement
        console.log(parentEle)
        const token = localStorage.getItem('token')
        const obj = {
            groupId: localStorage.getItem('receiver'),
            removeUserId: parentEle.id
        }
        console.log(obj)
        const result = await axios.post(`${URL}/delete-group-member`, obj, { headers: { 'Authorization': token } })
        if (result.data.success == true) {
            parentEle.remove()
        }
        getGroupMembersForAdding()
    }
}



// DONE DONE DONE DONE
// Shows members available to add in an existing group. Visible only to the admin
async function getGroupMembersForAdding() {
    const select = document.createElement('select')
    select.id = 'missingUsersFromGroup'
    
    const groupId = localStorage.getItem('receiver')
    const token = localStorage.getItem('token')
    const members = await axios.get(`${URL}/get-group-members-to-add/${groupId}`, { headers: { 'Authorization': token } })    
    for(let data of members.data.nonGroupMembers){
        let option = document.createElement('option')
        option.innerHTML = data.name
        option.id = data.Id
        select.appendChild(option)
    }
    groupUsersDetailsContainer.appendChild(select)
}




// Opens group details on clicking group name in chat window
var userGroupDetailsModal = document.getElementById('group-user-details-modal');
var chatWindowBanner = document.getElementById("title-container");
var groupSpan = document.getElementsByClassName("close")[1];

chatWindowBanner.onclick = async function () {
    if (!chatWindowBanner.classList.contains('group')) {
        return
    }
    const groupNameContainer = document.getElementById('group-name-container')
    groupNameContainer.innerHTML = chatWindowBanner.children[1].textContent
    const groupId = localStorage.getItem('receiver')
    const token = localStorage.getItem('token')
    const members = await axios.get(`${URL}/get-existing-group-members/${groupId}`, { headers: { 'Authorization': token } })
    const checkAdmin = await axios.get(`${URL}/check-group-admin/${groupId}`, { headers: { 'Authorization': token } })
    let role = 'member'
    if (checkAdmin.data.success == true) {
        role = 'admin'
        getGroupMembersForAdding()
    }
    for (let data of members.data) {
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
    if (event.target == createGroupScreen) {
        createGroupScreen.style.display = "none";
        while (createGroupUsers.firstChild) {
            createGroupUsers.removeChild(createGroupUsers.firstChild);
        }
    }
}
