let groupUserDetails = document.getElementById('group-user-details')
let groupUsersDetailsContainer = document.getElementById('group-user-details-container')


groupUserDetails.addEventListener('click', deleteGroupMember)


export async function deleteGroupMember(e) {
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


export async function getGroupMembersForAdding() {
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