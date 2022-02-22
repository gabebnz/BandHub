import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js'
import { getAuth, setPersistence, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, inMemoryPersistence} from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js'
import 'https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js';



const firebaseConfig = {
  apiKey: "AIzaSyB0kqmYDqT67y1q6sCmrCtEGMf6qoIbFcA",
  authDomain: "bandhub-75fe2.firebaseapp.com",
  databaseURL: "https://bandhub-75fe2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bandhub-75fe2",
  storageBucket: "bandhub-75fe2.appspot.com",
  messagingSenderId: "16449819507",
  appId: "1:16449819507:web:1ab1ff6519c25912842b06",
  measurementId: "G-RD3PBCFJBH"
};

// Initialize Firebase
initializeApp(firebaseConfig);

// AUTHENTICATION 
const auth = getAuth();
await setPersistence(auth, inMemoryPersistence)

// SIGN UP
const signupForm = document.querySelector('.signup')
// if statement so it doesnt add listener to null
if(signupForm != null){
  signupForm.addEventListener('submit', (e) =>{
    e.preventDefault()

    const email = signupForm.email.value 
    const password = signupForm.password.value

    createUserWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        console.log("user created: ", cred.user)
        signupForm.reset()
      })
      .catch((err) => {
        errorText(err)
      })
  })
}

// LOG IN 
const loginForm = document.querySelector('.login')
// if statement so it doesnt add listener to null
if(loginForm != null){
  loginForm.addEventListener('submit', (e) =>{
    e.preventDefault() // stops the form from submitting default behavior

    const email = loginForm.email.value 
    const password = loginForm.password.value 

    signInWithEmailAndPassword(auth, email, password)
      .then((cred) => {

        const user = cred.user

        return user.getIdToken().then((idToken) =>{
          console.log(idToken)
          return fetch("/sessionLogin", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "CSRF-Token": Cookies.get("XSRF-TOKEN"),
            },
            body: JSON.stringify({idToken}),
          })
          .catch((err) =>{
            console.log(err)
          })
        })
        
      })
      .then(() => { // Sign out because we handle auth on the server
        return signOut(auth)
				.catch((err) => {
					console.log(err.message)
				})
      })
      .then(() => {
        window.location.assign("/profile")
      })
      .catch((err) => {
        errorText(err)
      })
  })
}

// LOG OUT
const logoutButton = document.querySelector('.logout')
	if(logoutButton != null){
		logoutButton.addEventListener('click', () =>{
			fetch("/sessionLogout", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "CSRF-Token": Cookies.get("XSRF-TOKEN"),
        }
      })
      .then(()=>{
        window.location.assign("/")
      })
	})
} 


function errorText(err){
  // Change text to err message
  const text = err.message
  const result = text.slice(9) // removes "Firebase: " from error
  document.getElementById('err-text').textContent=result;

  // make element visible
  document.getElementById('err-text').className="error-text"
}