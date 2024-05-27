let send = document.getElementById('send')
let contactsContainer = document.getElementById('user-list')


contactsContainer.addEventListener('click', openContactChat)
window.addEventListener('DOMContentLoaded', generateLeftPanelContactList)


// Fetches the number of registered users and groups from DB. Then a function called createContactUI is passed that generates the list of contacts in left band
export async function generateLeftPanelContactList() {
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
export async function openContactChat(e) {
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
export async function fetchContactChats(user1Token, user2Token, type) {
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
            createAndLoadMessagesUI(data, myId)
        }
        resolve()
    })
}