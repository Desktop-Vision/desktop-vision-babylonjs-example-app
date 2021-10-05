# Desktop Vision Example

## Required Config files

1. A .env file is needed for connecting to the Desktop Vision oauth api

```
DESKTOP_VISION_ID=********************
DESKTOP_VISION_KEY=********************
  
```

## Quick Start

1. npm install
2. npm run dev
3. open http://localhost:3000

## Test from VR

1. connect vr device with cable
2. chrome://inspect
3. add localhost:3000 to port forwarding
4. open http://localhost:3000 on vr device browser


## Overview

1. Example code is in src/main.js


## How to connect to Desktop Vision

1. Create an account at https://desktop.vision
2. Download the streamer app and sign in
3. Confirm the streamer app is connected and listed at https://desktop.vision/app

## How to use Desktop Vision in example app / oauth

1. Have the user sign in to Desktop Vision, after sign in, the user will redirect back with a single use oauth code.
2. Use the oauth code to fetch an access token for the user.
3. Use the access token to fetch the user computers.
4. Connect to a user computer with the access token & computer channel name.
5. Listen for the ComputerConnection event "stream-added" for a video stream.
