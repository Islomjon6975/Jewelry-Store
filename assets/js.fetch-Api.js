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
    }

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
        this.changeItem({line: line,quantity: 0}).then(res => this.renderCartItems(res))
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
        const sideCart = document.querySelector(".mycart");
        sideCart.classList.toggle("open");
        document.body.removeAttribute('style');
    }

    renderCartItems(cartDetails) {

        if(cartDetails.item_count !== 0){
            document.querySelector('.mycart__products').style.display = 'block'
            document.querySelector('.mycart__bottom').style.display= 'block'
            document.querySelector('.mycart__empty').style.display= 'none'
        }else{
            document.querySelector('.mycart__products').style.display = 'none'
            document.querySelector('.mycart__bottom').style.display= 'none'
            document.querySelector('.mycart__empty').style.display= 'block'
            return
        }

        const cartItemsWrapper = document.querySelector(".mycart__products");
        cartItemsWrapper.innerHTML = "";
        for (let item of cartDetails.items) {
            let deliver_frequency = item?.selling_plan_allocation?.selling_plan.name
            // if(cartDetails.items.length > 0) {}
            const template = `
                <div length=${cartDetails.items.length} class="mycart__product" data-id="${item.key}" data-amount="${item.quantity}">
                    <div class="mycart__img--wrapper">
                        <img src="${ item.image }" alt="${ item.title }" class="mycart__product-img">
                    </div>
                    <div class="mycart__product--details">
                        <div class="mycart__wrapper">
                            <a href="${ item.url }" class="mycart__product--title h5">${ item.title }</a>
                            <p id="variant_title">${ deliver_frequency != null ? deliver_frequency : ""     }</p>
                            <p class="mycart__product--price h5">${this.formatter.format(item.price / 100)}</p>
                        </div>
                        <div class="mycart__wrapper">
                            <h5 class="mycart__product--weight h5">${ item.variant_options[0] }</h5>
                            <div class="remove-round-border">
                                <img data-operator="remove" class="remove-variant item__control" src="https://cdn.shopify.com/s/files/1/0609/7030/3540/files/icon-close.liquid?v=1664294173" />
                            </div>
                        </div>
                        <div class="mycart__calculator">
                            <img data-operator="minus" class="item__control" src="https://cdn.shopify.com/s/files/1/0609/7030/3540/files/icon-minus.liquid?v=1664294349" />
                            <span class="mycart__count p">${item.quantity}</span>
                            <img data-operator="plus" class="item__control" src="https://cdn.shopify.com/s/files/1/0609/7030/3540/files/icon-plus.liquid?v=1664294335" />
                        </div>
                    </div>
                </div>
            ` 

         
            cartItemsWrapper.insertAdjacentHTML('beforeend', template);
        }

        

        const sideCartTotalPrice = document.querySelector(".subtotal");
        sideCartTotalPrice.textContent = this.formatter.format(cartDetails.total_price / 100);

        const sideCartItemCart = document.querySelector(".basket__counter");
        sideCartItemCart.textContent = cartDetails.item_count
        if(Number(cartDetails.item_count) > 0) {
            const basketCounter = document.querySelector('.basket__counter')
            basketCounter.classList.add('basket__counter-style')
        } 
    }

    async toggleCart() {
        await this.updateCart();
        const sideCart = document.querySelector(".mycart");
        
        sideCart.classList.toggle("open");
        document.body.setAttribute('style', 'overflow: hidden');
    }

    

    addToCart() {
        const hasOnlyDefaultVariant = document.querySelector('#form')
        const novariant = document.querySelector('.product-details__noVariant')
        const variantId = document.querySelector(".product-details__variants-item-input:checked");
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
sideCart.updateCart()

// Basket
const navIcons = document.querySelectorAll('.header__icons svg');
const baskett = navIcons[2]
baskett.addEventListener('click', () => {
    sideCart.toggleCart()
})

// Close Modal
const close = document.querySelector('.mycart__top svg')
close.addEventListener('click', () => {
    sideCart.closeModal()
})


const addToCartWithSellingPlans = (id, qtty, sellingPlanId) => {
    let formData = {
        items: [
            {
                id: id,
                quantity: qtty,
                selling_plan: sellingPlanId
            }
        ]
    }
    sideCart.addItem(formData).then(() => sideCart.toggleCart());
}


// form add to cart
let form = document.querySelector('.pdp__container')
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.target.dataset.selling_plan_id >= 1) {
        let recharge_id = form.querySelector(".recharge-option:checked").value;
        if (recharge_id == "subscribe") {
        let recharge_freq_id = form.querySelector(".recharge-frequent-option:checked").value;
        let recharge_prod_id = form.querySelector(".recharge-frequent-option:checked").id;
        addToCartWithSellingPlans(recharge_prod_id, 1, recharge_freq_id);
      } else {
        sideCart.addToCart(recharge_id);
      }
    } else {

      // Add To Cart
        const addToCartBtn = document.querySelector('.addtocart')
        addToCartBtn.addEventListener('click',function(e){
            e.preventDefault()
            sideCart.addToCart()
        })

        const addToCartBtns2 = document.querySelectorAll('.product__details--text-btn')
        for(let i = 0; i < addToCartBtns2.length; i++) {
            const addToCartBtn2 = addToCartBtns2[i]
            addToCartBtn2.addEventListener('click',function(e){
                e.preventDefault()
                const variantId = addToCartBtn2.dataset.id
                    const formData = {
                        items: [{
                            id: variantId,
                            quantity: 1
                        }]
                    }
                    sideCart.addItem(formData).then(() => sideCart.toggleCart());
            })
        }

    }
  });

const mycartProducts = document.querySelector('.mycart__products')
mycartProducts.addEventListener('click', (e) => {
    const target = e.target.closest(".item__control")
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

