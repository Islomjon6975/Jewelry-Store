
// product image
const openModal = document.querySelector('.pdp__image--wrapper');
const imageModal = document.querySelector('.image-modal');
const closeModal = document.querySelector('.close svg');

openModal.addEventListener('click', () => {
    imageModal.style.display = 'flex'
})

closeModal.addEventListener('click', () => {
    imageModal.style.display = 'none'
})

const opt = {
    style: 'currency',
    currency: 'USD'
  };
  const select = document.querySelector('.select_size');
  const options = document.querySelectorAll('.option_size');
  const productTitle = document.querySelector('.product__title');
  const productPrice = document.querySelector('.product__price');
  console.log({{ product | json }}, 'productt')
  select.addEventListener('change', (e) => {
    const productVariants = {{ product.variants | json }};
    productVariants.forEach(variant => {
      if (variant.option1 == e.target.value) {
        productTitle.innerText = variant.name
          ? variant.name
          : "{{ product.title }}"
        const varaintPrice = new Intl.NumberFormat('en-US', opt).format(variant.price / 100);
        productPrice.innerText = `${varaintPrice}`
      }
    })
  })

  var pdpswiper = new Swiper(".mySwiperPdp", {
    loop: true,
    direction: "horizontal",
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true
  });
  var pdpswiper2 = new Swiper(".mySwiper2Pdp", {
    direction: "horizontal",
    loop: true,
    spaceBetween: 10,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    },
    thumbs: {
      swiper: pdpswiper
    }
  });


  var youMightAlsoLike = new Swiper(".swiperLikes", {
    direction: "horizontal",
    slidesPerView: 4,
    spaceBetween: 40,
    mousewheel: true,
    loop: true,
    pagination: {
      el: ".swiperLikes-pagination",
      clickable: true
    }
  });