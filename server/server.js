const express = require('express');
const router = express.Router();
const app = express();

const cors = require('cors');
//enabling cors
app.use(cors());
const axios = require('axios');
require('dotenv').config();
const bodyParser = require('body-parser');
//Parse data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 3030;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sitekey = process.env.REACT_APP_SITE_KEY;
const secretkey = process.env.REACT_APP_SECRET_KEY;

app.get('/', (req, res) => {
  console.log('Hello World');
});
console.log('hello');
console.log(sitekey);
console.log(secretkey);
console.log('hello');

//add router in express app
app.use('/', router);
const stripeChargeCallback = (res) => (stripeErr, stripeRes) => {
  if (stripeErr) {
    res.status(500).send({ error: stripeErr });
  } else {
    res.status(200).send({ success: stripeRes });
  }
};

app.get('/pay', (req, res) => {
  res.send({
    message: 'Hello Stripe checkout server!',
    timestamp: new Date().toISOString(),
  });
});

app.post('/pay', async (req, res) => {
  // console.log(req.body.token);
  //console.log(req.body.paymentIntentId);
  // const { paymentIntentId } = req.body;
  // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  // console.log(paymentIntent.status);
  const body = {
    source: req.body.token.id,
    amount: req.body.amount,
    currency: 'usd',
  };
  await stripe.charges.create(body, stripeChargeCallback(res));
});

//POST route
router.post('/post', async (req, res) => {
  ////Destructuring response token and input field value from request body
  const { reCAPTCHA_TOKEN } = req.body;

  try {
    // Sending secret key and response token to Google Recaptcha API for authentication.
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${reCAPTCHA_TOKEN}`
    );
    console.log(response.data);
    // Check response status and send back to the client-side
    return res.status(200).json({
      success: true,
      message: 'Token successfully verified',
      verification_info: response.data,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Error verifying token',
    });
  }
});
//console.log('Helllo');
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
