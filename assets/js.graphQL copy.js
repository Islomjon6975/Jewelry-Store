
const STOREFRONT_ACCESS_TOKEN =  '229340919e9e4fbbccf804cd417c16e1'

const GRAPHQL_URL = 'https://again-faster-islom.myshopify.com/api/2020-07/graphql.json'
var data = null;
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

const GRAPHQL_BODY  = () => {
	return {
	'async': true,
	'crossDomain': true,
	'method': 'POST',
	'headers': {
		'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
		'Content-Type': 'application/graphql',
	},
	'body': productQuery()
	};
}


const cardWrapper = document.querySelector('.products-wrapper')

async function fetchData() {
  await fetch(GRAPHQL_URL, GRAPHQL_BODY())
  .then(res => res.json())
  .then(products => data = products)
}

fetchData()

// Cart

async function renderData() {
  await fetchData()
  for (let value of data.data.products.edges) {
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
    // console.log(value?.node?.variants?.edges[0]?.node?.id, 'id')
  }
}

renderData()

var cartData = null;
var cartIds = []
async function addToCart(id) {
  const productQueryAdd = `
      mutation {
        cartCreate(
          input: {
            lines: [
              {
                quantity: 1
                merchandiseId: "${id}"
              }
            ]
            attributes: { key: "cart_attribute", value: "This is a cart attribute" }
          }
        ) {
          cart {
            id
            createdAt
            updatedAt
            lines(first: 10) {
              edges {
                node {
                  id
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      image {
                        id
                        url
                      }
                    }
                  }
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

`

await fetch(GRAPHQL_URL, {
  method: "POST",
  async: true,
  crossDomain: true,
  headers: {
    'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    'Content-Type': 'application/graphql',
  },
  body: productQueryAdd
  }).then(res => res.json()).then(res=> cartData = res)
  cartIds.push(cartData.data.cartCreate.cart.id)
  cartFetch(cartData.data.cartCreate.cart.id)
  document.querySelector('.graphQL-toggle').innerHTML =  `GraphQL Cart (${cartIds.length})`
  
}

document.querySelector('.graphQL-toggle').innerHTML =  `GraphQL Cart (${cartIds.length})`

const cartProducts = document.querySelector('.cart-products')
console.log(cartProducts, 'cart productttttttttt')
var cartProductItems = null;

async function cartFetch(cartid) {
  await fetch(GRAPHQL_URL, {
    method: "POST",
    async: true,
    crossDomain: true,
    headers: {
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      'Content-Type': 'application/graphql',
    },
    body: `query {
      cart(
        id: "${cartid}"
      ) {
        id
        createdAt
        updatedAt
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price
                  image {
                    id
                    url
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
    } `

  }).then(res => res.json()).then(res=> cartProductItems = res?.data?.cart)
  renderCartItems()
}

cartFetch()

function renderCartItems () {
  for(let i = 0; i < cartIds.length; i++) {
    console.log(cartProductItems, 'cartItem')
  }
  if(cartIds.length >= 1 && cartProductItems) {
    cartProducts.innerHTML += `
    <div class="cart-product">
      <div class="cart-product__image-wrapper">
        <img src="${cartProductItems?.lines?.edges[0]?.node.merchandise.image.url}" alt="${cartProductItems?.lines?.edges[0]?.node.merchandise.image.altText}" class="cart-product__image">
      </div>
      <h4 class="cart-product__title">${cartProductItems?.lines?.edges[0]?.node.merchandise.title}</h4>
      <h4 class="cart-product__price">$${cartProductItems?.lines?.edges[0]?.node.merchandise.price}</h4>
      <div class="cart-product__quantity">
        <button class="cart-product__increment">-</button>
        <h5>${cartProductItems?.lines?.edges[0]?.node.quantity + 1}</h5>
        <button class="cart-product__decrement" onclick="incrementQuantity('${cartProductItems?.id}', '${cartProductItems?.lines?.edges[0]?.node?.id}')">+</button>
      </div>
    </div>
 `
  }
  
}


async function incrementQuantity(cartId, lineId) {
  await fetch(GRAPHQL_URL, {
    method: "POST",
    async: true,
    crossDomain: true,
    headers: {
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      'Content-Type': 'application/graphql',
    },
    body: `mutation {
      cartLinesUpdate(
        cartId: "${cartId}"
        lines: {
          id: "${lineId}"
          quantity: 3
        }
      ) {
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
                  }
                }
              }
            }
          }
        }
      }
    }`

  }).then(res => res.json()).then(res=> console.log(res, 'incremnet'))
  renderCartItems()
document.querySelector('.graphQL-toggle').innerHTML =  `GraphQL Cart (${cartIds.length})`

}


// renderCartItems()

// toggle cart 
const graphQLBtn = document.querySelector('.graphQL-toggle')
const graphQLCart = document.querySelector('.graphQL-cart')
const graphQLCartClose = document.querySelector('.graphQL-cart svg')
const graphQLContinueShopping = document.querySelector('.cart-continue-shopping')

graphQLBtn.addEventListener('click', () => {
  graphQLCart.style.right='0px'
})

graphQLCartClose.addEventListener('click', () => {
  graphQLCart.style.right='-450px'
})

graphQLContinueShopping.addEventListener('click', () => {
  graphQLCart.style.right='-450px'
})
