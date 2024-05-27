
let message = document.getElementById('message')
let send = document.getElementById('send')

send.addEventListener('click', sendMessage)



// Used to send message
export async function sendMessage(e) {
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
    createAndLoadMessagesUI(newObj, myId)
    console.log('now logging newobj')
    console.log(myId, newObj.sender)
}