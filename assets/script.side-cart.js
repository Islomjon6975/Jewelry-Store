let cartOpen = document.querySelector('#cart-count');
let sideCartNav = document.querySelector('.side-cart');
let closeCart = document.querySelector('.close__cart');
cartOpen.addEventListener('click', () => {
    sideCartNav.classList.add('open-side-cart');
})

closeCart.addEventListener('click', () => {
    sideCartNav.classList.remove('open-side-cart');
})