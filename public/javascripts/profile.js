import 'https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js';

const profileForm = document.querySelector('.editForm')

if(profileForm != null){
    profileForm.addEventListener('submit', (e) =>{
        e.preventDefault() // stops the form from submitting default behavior

        const userData = {
            name: profileForm.displayName.value,
            description: profileForm.description.value,
            artists: profileForm.artists.value,
            phone: profileForm.phone.value,

            spotify: profileForm.spotify.value,
            soundcloud: profileForm.soundcloud.value,
            otherLink: profileForm.otherLink.value,
        }

        console.log("Submitted user data: ", userData)
    
        return fetch("/submitEdit", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "CSRF-Token": Cookies.get("XSRF-TOKEN"),
            },
            body: JSON.stringify({userData}),
        })
        .then(() => {
            window.location.assign("/profile")
        })
        .catch((err) =>{
            console.log(err)
        })
      })
}
