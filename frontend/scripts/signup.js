let name = document.getElementById('name')
let email = document.getElementById('email')
let phone = document.getElementById('phone')
let password = document.getElementById('password')

let signup = document.getElementById('signup')
signup.addEventListener('click', createUser)

let URL = 'http://localhost:3000'


async function createUser(e) {
    e.preventDefault()

    let obj = {
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        password: password.value.trim()
    }

    if (!obj.name || !obj.email || !obj.phone || !obj.password) {
        displayError({ errorType: 'emptyFields', message: 'Please fill all fields' });
    }
    else {
        try {
            const result = await axios.post(`${URL}/signup`, obj)
            console.log(result.data, 'pass')
            window.location.href = './login.html'
        } catch (error) {
            const { errors } = error.response.data;
                for (let data of errors) {
                    displayError(data)
                }
        }
    }
}



function displayError(error) {
    if (error.errorType == 'serverError') error.errorType = 'password'      // show internal server error near password block
    if (error.errorType == 'emptyFields') error.errorType = 'password'      // show emptyFields error near password block
    let errorContainer = document.getElementById(`${error.errorType}-error`)
    let errorMessage = document.createElement('p')
    errorMessage.innerHTML = error.message
    errorMessage.className = 'error-message'

    errorContainer.appendChild(errorMessage)
    setTimeout(() => {
        errorMessage.remove()
    }, 1000);
}