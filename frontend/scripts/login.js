let login = document.getElementById('login')
let signup = document.getElementById('signup')
let email = document.getElementById('email')
let password = document.getElementById('password')



loginForm.addEventListener('submit', loginForm)

let URL = 'http://localhost:3000'

async function loginUser(e) {
    e.preventDefault()

    let obj = {
        email: email.value,
        password: password.value
    }

    if (!obj.email || !obj.password) {
        generalError()
    }
    else {
        let result = await axios.post(`${URL}/login`, obj)
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