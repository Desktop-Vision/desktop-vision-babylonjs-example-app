const express = require('express');
require('dotenv').config()

const port = process.env.PORT || 3000;
const app = express()
const fetch = require('node-fetch')

const appID = process.env.DESKTOP_VISION_ID
const apiKey = process.env.DESKTOP_VISION_KEY

app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
  console.log(`Server is up at port http://localhost:${port}`);
});

app.get('/desktop-vision-auth', async (req, res) => {
  try {
    const { code } = req.query
    const tokenRes = await fetch('https://desktop.vision/api/oauth/access-token', {
      method: 'post',
      body: JSON.stringify({
        code
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-APP-ID': appID,
        'X-API-KEY': apiKey,
      },
    })
    const token = await tokenRes.json()
    console.log('got token for user:', token.uid)
    return res.json({ token })
  } catch (e) {
    res.send(404)
  }
});
