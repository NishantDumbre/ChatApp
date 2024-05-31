// Creates the contact person UI and appends it to the left band contact list container. Used for both users and groups
export function createContact(contacts) {

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




// Removes existing chat window DOM and loads the chat window DOM of selected user or groups. Returns a promise
export async function loadUserChatWindow(name) {
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




// Creates the chat DOM for the chat data passed. This functionw will be passed to another function that fetches all chats. Used for both users and groups
function createAndLoadMessagesUI(data, myId) {
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




// Loads the members of an existing group in DOM
export function loadGroupMembersUI(data, role) {
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


