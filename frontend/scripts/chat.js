
let message = document.getElementById('message')
let send = document.getElementById('send')
let upload = document.getElementById('upload')
let contactsContainer = document.getElementById('user-list')
let addMembersListNewGroup = document.getElementById('missing-members-new-group')
let createGroupUsers = document.getElementById('group-user-holder')
let groupUserDetails = document.getElementById('group-user-details')
let createGroupButton = document.getElementById('add-user')
let groupUsersDetailsContainer = document.getElementById('group-user-details-container')
let newGroup = document.getElementById('new-group')
let closeCreateGroup = document.getElementById('close-create-group-modal')
let closeCreateGroupX = document.getElementById('close-create-group-modal-X')
let chatWindowNameBanner = document.getElementById('title-container')
let userGroupDetailsModal = document.getElementById('group-user-details-modal');
let closeGroupDetailsX = document.getElementById("close-group-details-modal-X");
let closeGroupDetails = document.getElementById("close-group-details-modal");


send.addEventListener('click', sendMessage)
upload.addEventListener('click', uploadFile)
contactsContainer.addEventListener('click', openContactChat)
addMembersListNewGroup.addEventListener('change', addMember);
createGroupUsers.addEventListener('click', removeCreateGroupUsers)
createGroupButton.addEventListener('click', createNewGroup)
groupUserDetails.addEventListener('click', deleteExistingGroupMember)
window.addEventListener('DOMContentLoaded', generateLeftPanelContactList)


const URL = 'http://localhost:3000'

const socket = io(URL);

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('newMessage', (lastMessageId) => {
    console.log('Recevied new message')
    fetchLastMessage(lastMessageId);
})


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
    if (e.target.tagName == 'UL') return
    let messageBox = document.getElementById('message-box')
    messageBox.style.display = 'flex'
    chatWindowNameBanner.style.display = 'block'
    const mainElement = e.target.tagName === 'H5' ? e.target.parentElement : e.target;
    const name = mainElement.children[0].textContent
    const type = mainElement.classList.contains('list-user') ? 'user' : 'group'
    send.classList = type == 'user' ? 'button user' : 'button group'
    localStorage.setItem('receiver', mainElement.id)
    chatWindowNameBanner.classList = type == 'user' ? 'title-container' : 'title-container group'
    const token = localStorage.getItem('token')
    await loadUserChatWindow(name)
    fetchContactChats(token, mainElement.id, type)
}



async function fetchLastMessage(lastMessageId) {
    const token = localStorage.getItem('token')
    let result = await axios.get(`${URL}/get-last-message/${lastMessageId}`, { headers: { 'Authorization': token } })
    console.log(result.data)
    const { message, loggedInUser } = result.data
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$')
    console.log(message.Sender)
    console.log( message.Receiver)
    console.log(loggedInUser.id)
    console.log(message.message)
    createAndLoadMessages(message.Sender, message.Receiver, loggedInUser, message.message)
    
}



// DONE DONE DONE DONE
// Fetches all chats for A User. Then runs a function to manipulate DOM for each data element 
async function fetchContactChats(token, receiver, type) {
    return new Promise(async (resolve, reject) => {
        let result = await axios.post(`${URL}/get-${type}-messages`, { receiver }, { headers: { 'Authorization': token } })
        for (let data of result.data.messages) {
            createAndLoadMessages(data.Sender, data.Receiver, result.data.loggedInUser, data.message)
            console.log(data.Sender, data.Receiver, result.data.loggedInUser, data.message)
        }
        resolve()
    })
}



// DONE DONE DONE DONE
// Creates the chat DOM for the chat data passed. This functionw will be passed to another function that fetches all chats. Used for both users and groups
function createAndLoadMessages(sender, receiver, loggedInUser, message) {
    console.log('>>>>>>>>>>>>>>>>')
    console.log(sender)
    console.log(receiver)
    console.log(loggedInUser)
    console.log(message)
    let list = document.getElementById('chats-list')
    let li = document.createElement('li')
    if (loggedInUser.id == sender.id) {
        li.className = 'my-chat chat-window'
    }
    else {
        if (sender.name) {
            let name = document.createElement('h6')
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

        chatWindowNameBanner.children[0].innerHTML = `${name}`
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

    let name = document.createElement('h5')
    name.innerHTML = `${contacts.name}`
    name.className = `${typeClass}-name`
    li.appendChild(name)

    contactsContainer.appendChild(li)
}



//  DONE DONE DONE DONE
// Used to send message
async function sendMessage(e) {
    e.preventDefault()
    if (!message.value) return
    const uploadContainer = document.getElementById('uploaded-files');
    const files = [];

    // Iterate over each uploaded file div
    for (let fileDiv of uploadContainer.children) {
        const fileName = fileDiv.querySelector('span').textContent;
        files.push(fileName);
    }

    console.log(files)

    const category = send.classList.contains('user') ? 'user' : 'group'
    const token = localStorage.getItem('token')
    const obj = {
        message: message.value,
        receiver: localStorage.getItem('receiver'),   // receiver , group
        category
    }
    const result = await axios.post(`${URL}/send-${category}-message`, obj, { headers: { 'Authorization': token } })
    const { messageDetails } = result.data.details
    const lastMessageId = messageDetails.id;
    console.log(lastMessageId)
    socket.emit('newMessage', lastMessageId);

    message.value = ''
    //createAndLoadMessages(sender, receiver, loggedInUser, obj.message)
}


function uploadFile() {
    // Create a hidden input element of type file
    const fileInput = document.createElement('input');
    fileInput.id = 'qweasd'
    fileInput.type = 'file';

    // Add event listener to handle file selection
    fileInput.addEventListener('change', function () {
        const file = fileInput.files[0];
        const fileSize = file.size / (1024 * 1024); // Convert bytes to MB

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert('Selected file is not an image.');
            return;
        }

        // Check if file size is less than 5MB
        if (fileSize > 5) {
            alert('Selected image file exceeds 5MB.');
            return;
        }
        // Get the upload container
        const uploadContainer = document.getElementById('uploaded-files');

        // Create a div element to display file name and delete button
        const fileDiv = document.createElement('div');
        fileDiv.className = 'uploaded-file'

        // Create a span element to display file name
        const fileNameSpan = document.createElement('span');
        fileNameSpan.textContent = file.name;

        // Create a button element for deleting the file
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn-dark-purple btn-small'
        deleteButton.addEventListener('click', function () {
            // Remove the file div from the upload container
            uploadContainer.removeChild(fileDiv);
            // Clear the file input element to allow reselection of the same file
            fileInput.value = null;
        });

        // Create send file button
        const sendFileButton = document.createElement('button');
        sendFileButton.textContent = 'Send image';
        sendFileButton.className = 'btn-dark-orange btn-small'
        sendFileButton.addEventListener('click', function () {
            sendFile(file, uploadContainer, fileDiv)
        });

        // Append file name and delete button to file div
        fileDiv.appendChild(fileNameSpan);
        fileDiv.appendChild(deleteButton);
        fileDiv.appendChild(sendFileButton);

        // Append file div to upload container
        uploadContainer.appendChild(fileDiv);

    });

    // Trigger a click on the input element to open the file picker dialog
    fileInput.click();
}



async function sendFile(file, uploadContainer, fileDiv) {
    uploadContainer.remove(fileDiv)
    const token = localStorage.getItem('token')
    let s3URL = await axios.get(`${URL}/get-S3-presignedURL/${file.name}`, { headers: { 'Authorization': token } })
    console.log(s3URL.data.url)
    try {
        await axios.post(s3URL.data.url, file, { headers: { 'Content-Type': file.mimetype } })
    } catch (error) {
        console.log(error)
    }
    console.log('File has been uploaded')
}



//  DONE DONE DONE DONE
// Used in Create Group button. Loads the list of available users to add to the group
async function getCreateGroupContacts() {
    let token = localStorage.getItem('token')
    let user = await axios.get(`${URL}/get-contacts`, { headers: { 'Authorization': token } })
    let { contacts } = user.data

    while (addMembersListNewGroup.options.length > 0) {
        addMembersListNewGroup.remove(0);
    }

    let option = document.createElement('option')
    option.innerHTML = "Choose users"
    option.name = "Choose users"
    addMembersListNewGroup.appendChild(option)

    for (let contact of contacts) {
        let option = document.createElement('option')
        option.innerHTML = contact.name
        option.name = contact.name
        option.id = contact.id
        option.value = contact.name
        addMembersListNewGroup.appendChild(option)
        console.log(option)
    }
}




//  DONE DONE DONE DONE
// Used in Create Group functionality. Selects members to add in a group by adding them in a list of users to be added to the group
function addMember(event) {
    let selectedIndex = event.target.selectedIndex;     // gets the index of the selected option
    let selectedOption = event.target.options[selectedIndex];      // gets the selected option

    let li = document.createElement('li')
    li.id = `${selectedOption.id}`
    li.className = 'new-group-list'

    let button = document.createElement('button')
    button.innerHTML = 'delete'
    button.className = 'delete btn-small btn-dark-purple'
    let p = document.createElement('p')
    p.innerHTML = selectedOption.value

    li.appendChild(p)
    li.appendChild(button)
    selectedOption.remove()     // removes the option from the select list since we are adding it to our selected users

    createGroupUsers.appendChild(li)
}


async function addMemberExistingGroup() {
    const selectElement = document.getElementById('missing-users-from-group')
    const selectedOption = selectElement.options[selectElement.selectedIndex];

    const obj = {
        groupId: localStorage.getItem('receiver'),   // receiver , group
        addUserId: selectedOption.id
    }
    const token = localStorage.getItem('token')
    const result = await axios.post(`${URL}/add-member-existing-group`, obj, { headers: { 'Authorization': token } })
    console.log(true)

    let li = document.createElement('li')
    li.id = `${selectedOption.id}`
    li.className = 'new-group-list'

    let button = document.createElement('button')
    button.innerHTML = 'delete'
    button.className = 'delete btn-small btn-dark-purple'
    let p = document.createElement('p')
    p.innerHTML = selectedOption.value

    li.appendChild(p)
    li.appendChild(button)
    selectedOption.remove()
    groupUserDetails.appendChild(li)
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
        addMembersListNewGroup.appendChild(option)
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
    let modal = document.getElementById('exampleModal')
    $(modal).modal('hide')
}



//  DONE DONE DONE DONE
// On clicking group name in chat window, shows the list of members. The admin has the delete button available
function loadExistingGroupMembers(data, role) {
    console.log(data)
    console.log(role)
    let li = document.createElement('li')
    li.innerHTML = `${data.name}`
    li.className = 'new-group-list'
    li.id = data.usergroup.id

    if (!document.getElementById('leave-group-button')) {
        let leaveGroupButton = document.createElement('button')
        leaveGroupButton.innerHTML = 'Leave Group'
        leaveGroupButton.className = ' button btn-dark-orange ml-2'
        leaveGroupButton.id = 'leave-group-button'
        leaveGroupButton.onclick = async function () {
            await leaveGroup()
        }
        const groupNameContainer = document.getElementById('group-name-container')
        groupNameContainer.appendChild(leaveGroupButton)
    }


    if (role == 'ADMIN') {
        loadAdminGroupControls(li, data.usergroup.role, data.usergroup.id)
    }
    groupUserDetails.appendChild(li)
}


async function loadAdminGroupControls(li, role, id) {

    let deleteButton = document.createElement('button')
    deleteButton.innerHTML = 'delete'
    deleteButton.className = 'delete btn-small btn-dark-purple'
    li.appendChild(deleteButton)

    if (role == 'MEMBER') {
        let makeAdminbutton = document.createElement('button')
        makeAdminbutton.innerHTML = 'Make Admin'
        makeAdminbutton.className = 'btn-small btn-dark-orange'
        makeAdminbutton.onclick = async function () {
            await makeGroupAdmin(id)
            makeAdminbutton.remove()
        }
        li.appendChild(makeAdminbutton)
    }
}


async function makeGroupAdmin(userGroupId) {
    const obj = {
        userGroupId,
        groupId: localStorage.getItem('receiver')
    }
    console.log(obj)
    let token = localStorage.getItem('token')
    let group = await axios.post(`${URL}/make-group-admin/`, obj, { headers: { 'Authorization': token } })
    console.log(true)
}


//  DONE DONE DONE DONE
async function deleteExistingGroupMember(e) {
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
        let select = document.getElementById('missing-users-from-group')
        select.remove()
        let button = document.getElementById('addMemberExistingGroupButton')
        button.remove()
        document.getElementById('delete-group-button').remove()
        getUsersToAddExistingGroup()
    }
}



// DONE DONE DONE DONE
// Shows members available to add in an existing group. Visible only to the admin
async function getUsersToAddExistingGroup() {
    const groupNameContainer = document.getElementById('group-name-container')
    const deleteGroupButton = document.createElement('button')
    deleteGroupButton.className = 'button btn-dark-purple ml-5'
    deleteGroupButton.innerHTML = 'Delete Group'
    deleteGroupButton.id = 'delete-group-button'
    deleteGroupButton.onclick = deleteGroup
    groupNameContainer.appendChild(deleteGroupButton)

    const select = document.createElement('select')
    select.id = 'missing-users-from-group'

    const groupId = localStorage.getItem('receiver')
    const token = localStorage.getItem('token')
    const members = await axios.get(`${URL}/get-group-members-to-add/${groupId}`, { headers: { 'Authorization': token } })
    for (let data of members.data.nonGroupMembers) {
        let option = document.createElement('option')
        option.innerHTML = data.name
        option.id = data.Id
        option.value = data.name
        select.appendChild(option)
    }

    const add = document.createElement('button')
    add.className = 'button btn-dark-orange mr-4'
    add.innerHTML = 'Add member'
    add.id = 'addMemberExistingGroupButton'
    add.onclick = addMemberExistingGroup
    groupUsersDetailsContainer.appendChild(add)
    groupUsersDetailsContainer.appendChild(select)

}



async function deleteGroup() {
    const confirmation = confirm(`Are you sure you want to delete the group?`);
    if (!confirmation) {
        alert('Submission canceled.');
        return
    }
    const deleteGroupId = localStorage.getItem('receiver')
    const token = localStorage.getItem('token')
    const result = await axios.post(`${URL}/delete-group`, { deleteGroupId }, { headers: { 'Authorization': token } })
    let modal = document.getElementById('group-user-details-modal')
    $(modal).modal('hide')
    clearGroupDetailsModal()
    document.getElementById(deleteGroupId).remove()
}


async function leaveGroup() {
    const groupId = localStorage.getItem('receiver')
    const token = localStorage.getItem('token')
    const result = await axios.post(`${URL}/leave-group`, { groupId }, { headers: { 'Authorization': token } })
    localStorage.removeItem('receiver')
    let chatWindowDiv = document.getElementById('chat-box')
    if (chatWindowDiv.children[0]) {
        chatWindowDiv.removeChild(chatWindowDiv.children[0])
    }
    chatWindowNameBanner.className = 'title-container'
    chatWindowNameBanner.children[0].innerHTML = ''
    document.getElementById(groupId).remove()
    console.log(result.data.nextAdmin)
    if (result.data.nextAdmin) {
        const newAdmin = document.getElementById(result.data.nextAdmin)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>')
        console.log(newAdmin)
        console.log(newAdmin.children[2])
        newAdmin.children[2].remove()
    }
    let modal = document.getElementById('group-user-details-modal')
    $(modal).modal('hide')
    clearGroupDetailsModal()
}


// Opens group details on clicking group name in chat window
chatWindowNameBanner.onclick = async function () {
    if (!chatWindowNameBanner.classList.contains('group')) {
        return
    }
    let modal = document.getElementById('group-user-details-modal')
    $(modal).modal('show')


    const groupNameContainer = document.getElementById('group-name-container')
    groupNameContainer.innerHTML = chatWindowNameBanner.children[0].textContent
    const groupId = localStorage.getItem('receiver')
    const token = localStorage.getItem('token')
    let role = 'MEMBER'
    try {
        const checkAdmin = await axios.get(`${URL}/check-group-admin/${groupId}`, { headers: { 'Authorization': token } });
        role = 'ADMIN';
        getUsersToAddExistingGroup();
    } catch (error) {
        console.log('User is not an admin');
    }

    try {
        const members = await axios.get(`${URL}/get-existing-group-members/${groupId}`, { headers: { 'Authorization': token } });
        for (let data of members.data) {
            loadExistingGroupMembers(data, role);
        }
    } catch (error) {
        console.error('Error occurred while fetching group members:', error);
    }
}

function clearGroupDetailsModal() {
    while (groupUserDetails.firstChild) {
        groupUserDetails.removeChild(groupUserDetails.firstChild);
    }
    while (document.getElementById('missing-users-from-group')) {
        document.getElementById('missing-users-from-group').remove()
    }
    while (document.getElementById('addMemberExistingGroupButton')) {
        document.getElementById('addMemberExistingGroupButton').remove()
    }
}

closeGroupDetailsX.onclick = function () {
    clearGroupDetailsModal()
}

closeGroupDetails.onclick = function () {
    clearGroupDetailsModal()
}




// Create Group modal
newGroup.onclick = function () {
    let modal = document.getElementById('create-group-modal')
    $(modal).modal('show')
    getCreateGroupContacts()
}

closeCreateGroup.onclick = function () {
    while (createGroupUsers.firstChild) {
        createGroupUsers.removeChild(createGroupUsers.firstChild);
    }
}

closeCreateGroupX.onclick = function () {
    while (createGroupUsers.firstChild) {
        createGroupUsers.removeChild(createGroupUsers.firstChild);
    }
}

window.onclick = function (event) {
    if (event.target == chatWindowNameBanner) {
        clearGroupDetailsModal()
    }

    if (event.target == newGroup) {
        while (createGroupUsers.firstChild) {
            createGroupUsers.removeChild(createGroupUsers.firstChild);
        }
    }
}




