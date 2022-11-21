

class Cart {
    formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
    });

    async fetchAPI(api, formData) {
        const response = await fetch(`/cart/${api}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        return await response.json();
    };

    addItem(formData) {
        return this.fetchAPI('add.js', formData);
    }

    changeItem(formData) {
        return this.fetchAPI('change.js', formData);
    }

    async getCartDetails() {
        const response =  await fetch(`/cart.js`);
        return response.json();
    }

    deleteItem(line) {
        this.changeItem({line: line, quantity: 0}).then(res => this.renderCartItems(res))
    }

    async getProduct(handle) {
        const response =  await fetch(`/products/${handle}.js`);
        return response.json();
    }

    async updateCart() {
        const cartDetails = await this.getCartDetails();
        this.renderCartItems(cartDetails)
    }

    closeModal() {
        const sideCart = document.querySelector(".side-cart");
        sideCart.classList.toggle("open-side-cart");
        document.body.removeAttribute('style');
    }

    renderCartItems(cartDetails) {
        const cartItemsWrapper = document.querySelector(".cart__products");
        cartItemsWrapper.innerHTML = "";
        for (let item of cartDetails.items) {
            const template = `
                <div class="cart__product" length=${cartDetails.items.length} data-id="${item.key}" data-amount="${item.quantity}>
                    <div class="cart__product__image-wrapper">
                        <img src="${ item.image }" alt="${ item.title }" class="cart__product__image">
                    </div>
                    <div class="cart__product__details">
                        <h2 class="cart__product__title">">${ item.title }</h2>
                        <h3 class="cart__product__price">${this.formatter.format(item.price / 100)}</h3>
                        <div class="cart__product__calculation">
                            <button data-operator="minus" class="cart__product__decrement">-</button>
                            <span class="cart__product__count">${item.quantity}</span>
                            <button data-operator="plus" class="cart__product__increment">+</button>
                        </div>
                        <h4 data-operator="remove" class="cart__product__remove">
                            <a href="#" class="cart__product__remove-link h4">Remove</a>
                        </h4>
                    </div>
                </div>
            ` 
            cartItemsWrapper.insertAdjacentHTML('beforeend', template);
        }

        

        const sideCartTotalPrice = document.querySelector(".cart__footer__title");
        sideCartTotalPrice.textContent = `Subtotal ${this.formatter.format(cartDetails.total_price / 100)}`;

        const sideCartItemCart = document.querySelector("#cart-count");
        sideCartItemCart.innerText = `Cart (${cartDetails.item_count})`
        // if(Number(cartDetails.item_count) > 0) {
        //     const basketCounter = document.querySelector('.basket__counter')
        //     basketCounter.classList.add('basket__counter-style')
        // } 
    }

    async toggleCart() {
        await this.updateCart();
        const sideCart = document.querySelector(".side-cart");
        
        sideCart.classList.toggle("open-side-cart");
        document.body.setAttribute('style', 'overflow: hidden');
    }

    addToCart() {
        const hasOnlyDefaultVariant = document.querySelector('#form-product')
        const novariant = document.querySelector('.product-details__noVariant')
        const variantId = document.querySelector(".product__item-selected:selected");
        const formData = {
            items: [{
                id: hasOnlyDefaultVariant.getAttribute('data-noVariant') == 'true' ? novariant.getAttribute('data-id') :  variantId.value,
                quantity: 1
            }]
        }

        this.addItem(formData).then(() => this.toggleCart());
    }

    addCartItemCount() {
        this.getCartDetails().then(cartDetails => {
            const headerCartLinks = document.querySelectorAll(".header-cart-link");
            headerCartLinks.forEach(link => {
                link.innerHTML +=  cartDetails.item_count
            })
        })
    }

    deleteItem({itemID}) {
        const formData = {
            id: itemID,
            quantity: 0
        }
        this.toggleCart()
        this.changeItem(formData).then(() => this.updateCart())
    }

    increaseItemAmount({ itemID, itemAmount }) {
        const formData = {
          id: itemID,
          quantity:Number(itemAmount) + 1
        };
    
        this.changeItem(formData).then(() => this.updateCart());
    }
      
    decreaseItemAmount({ itemID, itemAmount }) {
     
        const formData = {
          id: itemID,
          quantity:Number(itemAmount) - 1
        };
      
        this.changeItem(formData).then(() => this.updateCart());
    }

}

const sideCart = new Cart();
sideCart.updateCart();

// Basket
const cartOpen = document.querySelector('#cart-count');
cartOpen.addEventListener('click', () => {
    sideCart.toggleCart()
    console.log('open')
})

// Close Modal
const close = document.querySelector('.close__cart')
close.addEventListener('click', () => {
    sideCart.closeModal()
    console.log('close')
})


let form = document.querySelector('#form-product')
form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Add To Cart
    const addToCartBtn = document.querySelector('.addtocart')
    addToCartBtn.addEventListener('click',function(e){
        e.preventDefault()
        sideCart.addToCart()
    })

    // const addToCartBtns2 = document.querySelectorAll('.product__details--text-btn')
    // for(let i = 0; i < addToCartBtns2.length; i++) {
    //     const addToCartBtn2 = addToCartBtns2[i]
    //     addToCartBtn2.addEventListener('click',function(e){
    //         e.preventDefault()
    //         const variantId = addToCartBtn2.dataset.id
    //             const formData = {
    //                 items: [{
    //                     id: variantId,
    //                     quantity: 1
    //                 }]
    //             }
    //             sideCart.addItem(formData).then(() => sideCart.toggleCart());
    //     })
    // }
  });

const mycartProducts = document.querySelector('.cart__products')
mycartProducts.addEventListener('click', (e) => {
    const target = e.target.closest(".cart__product__remove")
    if(!target) return
    const operator = target.dataset.operator
    const cartItem = target.closest('.mycart__product')
    if(operator === 'remove') {
        sideCart.deleteItem({itemID:cartItem.dataset.id})
    }
    if(operator === 'plus') {
        sideCart.increaseItemAmount({itemID:cartItem.dataset.id, itemAmount: cartItem.dataset.amount})
    }  
    if(operator === 'minus') {
        sideCart.decreaseItemAmount({itemID:cartItem.dataset.id, itemAmount: cartItem.dataset.amount})
    }
})
  
  