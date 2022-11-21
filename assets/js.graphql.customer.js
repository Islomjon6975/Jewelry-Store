
const STOREFRONT_ACCESS_TOKEN =  '229340919e9e4fbbccf804cd417c16e1'
const GRAPHQL_URL = 'https://again-faster-islom.myshopify.com/api/2020-07/graphql.json'

class Customer {
    // ---------------------- fetchApi -----------------------
    async fetchApi({query, variables}) {
        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({query, variables})
        }).then((response) => response.json())

        return response
    } 
    // ---------------------- customerCreate -> Register -----------------------
    async customerCreate(variables) {
        const customerCreateQuery = {
            query: `
                mutation customerCreate($input:CustomerCreateInput!){
                    customerCreate(input: $input) {
                    customer {
                        firstName
                        lastName
                        email     
                        password
                    }
                    customerUserErrors {
                        field
                        message
                        code
                    }
                    }
                }
            `,
            variables
        }
        await this.fetchApi(customerCreateQuery).then(response => console.log(response, 'customerCreateQuery'))
    }
    // ---------------------- customerAccessTokenCreate -> Login -----------------------
    async customerAccessTokenCreate(variables) {
        const customerAccessTokenCreateQuery = {
            query: `
                mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
                    customerAccessTokenCreate(input: $input) {
                    customerAccessToken {
                        accessToken
                    }
                    customerUserErrors {
                        message
                    }
                    }
                }
            `,
            variables: variables
        }
        await this.fetchApi(customerAccessTokenCreateQuery).then(res => localStorage.setItem('accessToken', JSON.stringify(res?.data?.customerAccessTokenCreate.customerAccessToken?.accessToken)))
    }

    accessToken() {
        return 'b1974abbdcfbc6001cf228b65f845b0c'
    }

    // ---------------------- customer -> user information -----------------------
    async customer(accessToken) {
        const customerQuery = {
            query: `
                query {
                customer(customerAccessToken: "${accessToken}") {
                  id
                  firstName
                  lastName
                  acceptsMarketing
                  email
                  phone
                }
              }
            `,
            variables: {}
        }
        return await this.fetchApi(customerQuery)
    }
    // ---------------------- customerRecover -----------------------
    async customerRecover(variables) {
        const customerRecoverQuery = {
            query: `
                mutation customerRecover($email: String!) {
                customerRecover(email: $email) {
                  customerUserErrors {
                    message
                    
                  }
                }
              }
            `,
            variables: variables
        }
        await this.fetchApi(customerRecoverQuery).then((response) => console.log(response, 'customerRecover'))
    }
    // ---------------------- customerReset -----------------------
    async customerReset() {
        const customerResetQuery = {
            query: `
                mutation customerReset($id: ID!, $input: CustomerResetInput!) {
                    customerReset(id: $id, input: $input) {
                    customer {
                        # Customer fields
                    }
                    customerAccessToken {
                        # CustomerAccessToken fields
                    }
                    customerUserErrors {
                        # CustomerUserError fields
                    }
                    }
                }
            `,
            variables: {
                id: "",
                input: {
                    "password": "",
                    "resetToken": ""
                }
            }
        }
    
        await this.fetchApi(customerResetQuery).then(res => console.log(res, 'customerReset'))
    }
}

const customer = new Customer()
console.log(customer, 'customer class')

// ----------------------- Forms ------------------------------
const formSingUp = document?.querySelector('.register__container form')
const formSingIn = document?.querySelector('.login__container form')
const formRecover = document?.querySelector('.recover__container form')

// ----------------------- Sign Up ------------------------------
formSingUp?.addEventListener('submit', async(e) => {
    e.preventDefault()
    const fisrtName = document.querySelector('[name="customer[first_name]"]').value;
    const lastName = document.querySelector('[name="customer[last_name]"]').value;
    const email = document.querySelector('[name="customer[email]"]').value;
    const password = document.querySelector('[name="customer[password]"]').value;
    const customerCreateVariable = {
        input: {
            fisrtName,
            lastName,
            email,
            password,
        }
    }

    await customer.customerCreate(customerCreateVariable);
    return
})

// ----------------------- Sign In ------------------------------
formSingIn?.addEventListener('submit', async(e) => {
    e.preventDefault();
    const email = document.querySelector('[name="customer[email]"]').value;
    const password = document.querySelector('[name="customer[password]"]').value;
    const customerAccessTokenCreateVariables = {
        input: {
            email,
            password
        }
    }
    
    await customer.customerAccessTokenCreate(customerAccessTokenCreateVariables);
})

// ----------------------- customerAccount ------------------------------
async function customerAccount() {
    const customerInfo = document?.querySelector('.customer-info')
    const response = await customer.customer(customer.accessToken())
    console.log(response.data.customer,'javob')
    customerInfo.innerHTML = `
        <p class="customer-info__title">${response.data.customer.firstName}</p>
        <p class="customer-info__title">${response.data.customer.lastName}</p>
        <p class="customer-info__title">${response.data.customer.email}</p>
        <p class="customer-info__title">${response.data.customer.password}</p>
    `
}
customerAccount()

// ----------------------- formRecover ------------------------------
formRecover.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('recover__container .recover__email').value
    const customerRecoverVariables = {
        email
    }
    await customer.customerPasswordRecover(customerRecoverVariables)
})
// ----------------------- Register ------------------------------