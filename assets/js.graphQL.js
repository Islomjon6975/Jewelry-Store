
const STOREFRONT_ACCESS_TOKEN =  '229340919e9e4fbbccf804cd417c16e1'
const GRAPHQL_URL = 'https://again-faster-islom.myshopify.com/api/2020-07/graphql.json'

// ---------- GRAPHQL_BODY ----------------
const GRAPHQL_BODY  = (query) => {
	return {
	'async': true,
	'crossDomain': true,
	'method': 'POST',
	'headers': {
		'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
		'Content-Type': 'application/graphql',
	},
	'body': query()
	};
}

// ---------- fetchApi ----------------
async function fetchApi(productQuery) {
  return await fetch(GRAPHQL_URL, GRAPHQL_BODY(productQuery)).then((response) => response.json())
}

// ---------- renderData ----------------
async function renderData() {
  const cardWrapper = document.querySelector('.products-wrapper')
  const productQuery = () => `
      query {
          products( first: 20) {
            edges{
              node {
                id
                handle
                title
                featuredImage {
                  url
                  altText
                }
                priceRange {
                  maxVariantPrice{
                    amount
                  }
                  minVariantPrice{
                    amount
                  }
                }
                variants(first: 1){
                  edges{
                    node{
                      title
                      id
                  }
                }
              }
            }
          }  
        }
      }
  `;

  let data = []
  await fetchApi(productQuery).then((response) => data = response)
  for (let value of data?.data?.products?.edges) {
    let ids = value?.node?.variants?.edges[0]?.node?.id
    const card = `
      <div class="product-card">
        <div class="image-wrapper">
          <img src="${value?.node?.featuredImage?.url}" alt={${value?.node?.featuredImage?.altText}} class='productImg' >
        </div>
        <p>${value?.node?.title}</p>
        <p>$${value?.node?.priceRange?.maxVariantPrice?.amount}</p>
        <p class="badge__container">${value?.node?.handle}</p>
        <button onclick="addToCart('${ids}')" class="add-to-cart">Add to Cart</button>
      </div>
    `
    cardWrapper.innerHTML += card
  }
}
renderData();

// ---------- createCart ----------------
document.addEventListener("DOMContentLoaded", createCart());
function createCart() {
  const cartCreateQuery = () => `
    mutation CreateCart {
      cartCreate {
        cart {
          checkoutUrl
          id
        }
      }
    }
  `
  fetchApi(cartCreateQuery).then((response) => !localStorage.getItem('cartId') && localStorage.setItem('cartId', response?.data?.cartCreate?.cart?.id))
}

// ---------- addToCart ----------------
async function addToCart(variantId) {
  const productAddQuery = () => `
    mutation AddToCart {
      cartLinesAdd(cartId: "${localStorage.getItem('cartId')}", lines: [{ quantity: 1,  merchandiseId: "${variantId}"}]) {
        cart {
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
`
  await fetchApi(productAddQuery)
  renderCartItems()
}

// ---------- renderCartItems ----------------
async function renderCartItems() {
  const cartProducts = document.querySelector('.cart-products')
  const cartCount = document.querySelector('.graphQL-toggle')
  const cartTitleCount = document.querySelector('.graphQL-cart__title')

  const rendercartQuery = () => `
      query{
        cart(
          id:"${localStorage.getItem('cartId')}"
        ) {
          id
          createdAt
          updatedAt
          lines(first: 20) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price
                    product{
                      title
                    }
                    image {
                      id
                      url
                      altText
                    }
                  }
                }
                attributes {
                  key
                  value
                }
              }
            }
          }
          attributes {
            key
            value
          }
          buyerIdentity {
            email
            phone
            customer {
              id
            }
            countryCode
          }
        }
      }
  `
  let cartProductItems = []
  let pro = ''
  await fetchApi(rendercartQuery).then((response) => cartProductItems = response)
  cartCount.innerText =  `GraphQL (${cartProductItems?.data?.cart?.lines?.edges?.length ? cartProductItems?.data?.cart?.lines?.edges?.length : 0})`
  cartTitleCount.innerText = `GraphQL Cart (${cartProductItems?.data?.cart?.lines?.edges?.length  ? cartProductItems?.data?.cart?.lines?.edges?.length : 0})`
  let subtotal = 0;
  for(let item of cartProductItems?.data?.cart?.lines?.edges) {
    subtotal += +item?.node?.merchandise?.price
    document.querySelector('.cart-subtotal-counter').innerText = subtotal  ? `$${subtotal}` : 0

     pro += `
        <div class="cart-product">
        <div class="cart-product__image-wrapper">
          <img src="${item?.node?.merchandise?.image?.url}" alt="${item?.node?.merchandise?.image?.altText}" class="cart-product__image">
        </div>
        <h4 class="cart-product__title">${item?.node?.merchandise?.product?.title}</h4>
        <h4 class="cart-product__price">$${item?.node?.merchandise?.price}</h4>
        <div class="cart-product__quantity">
          <button  onclick="decreaseItemAmount('${item?.node?.id}', ${item?.node?.quantity})" class="cart-product__increment">-</button>
          <h5>${item?.node?.quantity}</h5>
          <button onclick="increaseItemAmount('${item?.node?.id}', ${item?.node?.quantity})"  class="cart-product__decrement" >+</button>
        </div>
        <button class="cart-item__remove" onclick="removeItemFromCart('${item?.node?.id}')">x</button>
      </div>
    `
    cartProducts.innerHTML = pro
  }
}
renderCartItems()

// ---------- cartLinesUpdate ----------------
async function increaseItemAmount(cartLineId, itemAmount) {
  const cartLinesUpdateQuery = () => `
      mutation {
        cartLinesUpdate(
          cartId: "${localStorage.getItem('cartId')}"
          lines: {
            id: "${cartLineId}"
            quantity: ${itemAmount + 1}
          }
        ) {
          cart {
            id
            lines(first: 20) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                      }
                      image {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      `
      await fetchApi(cartLinesUpdateQuery)
      renderCartItems()
}

async function decreaseItemAmount(cartLineId, itemAmount) {
  const cartLinesUpdateQuery = () => `
      mutation {
        cartLinesUpdate(
          cartId: "${localStorage.getItem('cartId')}"
          lines: {
            id: "${cartLineId}"
            quantity: ${itemAmount - 1}
          }
        ) {
          cart {
            id
            lines(first: 20) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                      }
                      image {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      `
      await fetchApi(cartLinesUpdateQuery)
      renderCartItems()
}

// ---------- removeItemFromCart ----------------
async function removeItemFromCart(cartLineId) {
  const removeItemFromCartQuery = () => `
      mutation  {
        cartLinesRemove(cartId: "${localStorage.getItem('cartId')}", lineIds: "${cartLineId}") {
          cart {
            id
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                        handle
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
  `

  await fetchApi(removeItemFromCartQuery)
  renderCartItems()
}

// ---------- toggle cart ----------------
function toggleCart() {
  const graphQLBtn = document.querySelector('.graphQL-toggle')
  const graphQLCart = document.querySelector('.graphQL-cart')
  const graphQLCartClose = document.querySelector('.graphQL-cart svg')
  const graphQLContinueShopping = document.querySelector('.cart-continue-shopping')
  
  graphQLBtn.addEventListener('click', () => {
    graphQLCart.style.right='0px'
  })
  
  graphQLCartClose.addEventListener('click', () => {
    graphQLCart.style.right='-500px'
  })
  
  graphQLContinueShopping.addEventListener('click', () => {
    graphQLCart.style.right='-500px'
  })
}
toggleCart()
