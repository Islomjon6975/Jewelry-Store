
// product image
const openModal = document.querySelector('.product__big-image--wrapper');
const imageModal = document.querySelector('.image-modal');
const closeModal = document.querySelector('.close svg');

openModal.addEventListener('click', () => {
    imageModal.style.display = 'flex'
})

closeModal.addEventListener('click', () => {
    imageModal.style.display = 'none'
})



