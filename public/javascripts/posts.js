import 'https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js';

const postForm = document.querySelector('.postForm')

if(postForm != null){
    postForm.addEventListener('submit', (e) =>{
        e.preventDefault() // stops the form from submitting default behavior

        const postData = {
            uid: postForm.uid.value,
            title: postForm.title.value,
            description: postForm.description.value,
            location: postForm.location.value,

            phone: postForm.inclPhone.checked,
            email: postForm.inclEmail.checked,
        }

        console.log("Submitted post data: ", postData)
    
        return fetch("/submitPost", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "CSRF-Token": Cookies.get("XSRF-TOKEN"),
            },
            body: JSON.stringify({postData}),
        })
        .then(response => response.json())
        .then((data) => {
            // go to post after it was created
            window.location.assign("/posts/" + data.PID)
        })
        .catch((err) =>{
            console.log(err)
        })
      })
}