let login = document.getElementById('login')
let signup = document.getElementById('signup')
let email = document.getElementById('email')
let password = document.getElementById('password')


login.addEventListener('click', loginUser)
signup.addEventListener('click', createUser)

let URL = 'http://localhost:3000'


function createUser() {
    window.location.href = '../views/signup.html'
}


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
        console.log(result.data)
        if (result.data.success == false) {
            const { failed } = result.data
            console.log(failed, 'failed')

            for (let data of failed) {
                specificError(data)
            }
        }
        else {
            console.log(result.data, 'pass')
            localStorage.setItem('token', result.data.token)
            window.location.href = './chat.html'
        }
    }
}



function specificError(data) {
    let errorContainer = document.getElementById(`${data.error}-error`)
    if (errorContainer) {
        let errorMessage = document.createElement('p')
        errorMessage.innerHTML = data.message
        errorMessage.className = 'error-message'

        errorContainer.appendChild(errorMessage)
        setTimeout(() => {
            errorMessage.remove()
        }, 1000);
    }
    else {
        alert('Someting went wrong. Please try again')
    }

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