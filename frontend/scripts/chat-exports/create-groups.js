// Used in Create Group button. Loads the list of available users to add to the group
export async function getCreateGroupContacts() {
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
export function addMember(e) {
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
export function removeCreateGroupUsers(e) {
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
export async function createNewGroup(e) {
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