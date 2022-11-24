let collection_list = document.querySelector("#collection_list");

collection_list.addEventListener('change', (e) => {
    location.pathname = e.target.value;
})