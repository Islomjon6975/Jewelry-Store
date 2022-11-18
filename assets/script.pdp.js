
// product image
const image = document.querySelector('.pdp__image--wrapper');
const openModal = document.querySelector('.image-modal');
const closeModal = document.querySelector('.close svg');

openModal.addEventListener('click', () => {
    imageModal.style.display = 'flex'
})

closeModal.addEventListener('click', () => {
    imageModal.style.display = 'none'
})
