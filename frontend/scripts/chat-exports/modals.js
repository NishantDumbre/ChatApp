

// Create group modal code
const createGroupScreen = document.getElementById('new-group-modal');
const createGroup = document.getElementById("new-group");
const groupSpan = document.getElementsByClassName("close")[0];

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






const userGroupDetailsModal = document.getElementById('group-user-details-modal');
const chatWindowBanner = document.getElementById("title-container");
const groupSpan = document.getElementsByClassName("close")[1];

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
        loadGroupMembersUI(data, role)
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