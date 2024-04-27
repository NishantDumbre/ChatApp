let name = document.getElementById('name')
let email = document.getElementById('email')
let phone = document.getElementById('phone')
let password = document.getElementById('password')

let signup = document.getElementById('signup')

signup.addEventListener('click', createUser)

let URL = 'http://localhost:3000'

async function createUser(e) {
    console.log(true)
    e.preventDefault()

    let obj = {
        name: name.value,
        email: email.value,
        phone: phone.value,
        password: password.value
    }

    if (!obj.name || !obj.email || !obj.phone || !obj.password) {
        generalError()
    }
    else {
        let result = await axios.post(`${URL}/signup`, obj)
        if (result.data.success == false) {
            const { failed } = result.data
            console.log(failed, 'failed')

            for (let data of failed) {
                specificError(data)
            }
        }
        else {
            console.log(result.data,'pass')
            window.location.href = './login.html'
        }
    }
}


function specificError(data) {
    let errorMessage = document.createElement('p')
    errorMessage.innerHTML = data.message
    errorMessage.className = 'error-message'
    let errorContainer = document.getElementById(`${data.error}-error`)
    errorContainer.appendChild(errorMessage)
    setTimeout(() => {
        errorMessage.remove()
    }, 1000);
}


function generalError() {
    let errorMessage = document.createElement('p')
    errorMessage.innerHTML = 'Please fill all fields'
    errorMessage.className = 'error-message'
    let errorContainer = document.getElementById(`password-error`)
    errorContainer.appendChild(errorMessage)

    setTimeout(() => {
        errorMessage.remove()
    }, 1000);
}