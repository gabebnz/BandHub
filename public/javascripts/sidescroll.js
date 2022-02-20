const scrollContainer = document.querySelectorAll(".boxinnercontainer");

scrollContainer.forEach(addListener);

function addListener(item){
    item.addEventListener("wheel", (evt) => {
        evt.preventDefault();
        item.scrollLeft += evt.deltaY;
    });
}



