import fetch from 'node-fetch'
/**
 * Set Credentials
 * @returns {Object} - clientid, appSecret, base url
 */
const credentials = () => {
  const { CLIENT_ID, APP_SECRET } = process.env
  const base = 'https://api-m.sandbox.paypal.com'
  return { CLIENT_ID, APP_SECRET, base }
}

/**
 * Create Order
 * @param {Object} data - plan details
 * @returns call response function
 */
export async function createOrder(data) {
  /**
   * set credentials
   */
  const { base } = credentials()
  /**
   * generate access token
   */
  console.log(data)
  const accessToken = await generateAccessToken()
  const url = `${base}/v2/checkout/orders`
  const amount = Number(data.amount) / 70
  console.log(amount)
  /**
   * send data to paypal api
   */
  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: parseInt(amount),
          },
        },
      ],
    }),
  })
  return handleResponse(response)
}

/**
 * Capture Payment
 * @param {String} orderId - order id
 * @returns call handleresponse function
 */
export async function capturePayment(orderId) {
  /**
   * set credentials
   */
  const { base } = credentials()
  /**
   * generate access token
   */
  const accessToken = await generateAccessToken()
  const url = `${base}/v2/checkout/orders/${orderId}/capture`
  /**
   * send data to paypal api
   */
  const response = await fetch(url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return handleResponse(response)
}

/**
 * Genetate Access Token For Paypal
 * @returns Access Token
 */
export async function generateAccessToken() {
  /**
   * set credentials
   */
  const { CLIENT_ID, APP_SECRET, base } = credentials()
  const auth = Buffer.from(CLIENT_ID + ':' + APP_SECRET).toString('base64')
  /**
   * send request to paypal api
   */
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'post',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  const jsonData = await handleResponse(response)
  return jsonData.access_token
}

/**
 * Response function
 * @param {*} response
 * @returns
 */
async function handleResponse(response) {
  if (response.status === 200 || response.status === 201) {
    return response.json()
  }

  /**
   * Error response
   */
  const errorMessage = await response.text()
  throw new Error(errorMessage)
}
