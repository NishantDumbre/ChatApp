let login = document.getElementById('login')
let signup = document.getElementById('signup')
let email = document.getElementById('email')
let password = document.getElementById('password')


login.addEventListener('click', loginUser)
signup.addEventListener('click', createUser)

let URL = 'https://chatapp-rdnh.onrender.com'


function createUser() {
    window.location.href = '../views/signup.html'
}

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
async function loginUser(e) {
    e.preventDefault()

    let obj = {
        email: email.value.trim(),
        password: password.value.trim()
    }

    if (!obj.email || !obj.password) {
        displayError({ errorType: 'emptyFields', message: 'Please fill all fields' });
    }
    else {
        try {
            const result = await axios.post(`${URL}/login`, obj)
            localStorage.setItem('token', result.data.token);   // then block
            window.location.href = './chat.html';
        }
        catch (error) {     // catch block
            console.log(error)
            const { errors } = error.response.data;
                displayError(errors);
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
    if(errorContainer.children[0]) errorContainer.children[0].remove()
    errorContainer.appendChild(errorMessage)
    setTimeout(() => {
        errorMessage.remove()
    }, 1000);
}

