import * as BABYLON from 'babylonjs'
import { createDefaultEngine, createScene, createCamera, createTestPlane } from './setup/setupScene'
import { updateButtonState, authCodeButton, authTokenButton, checkBox, fetchComputersButton, connectSingleComputerButton, enterSceneButton, createComputerButton, removeComputerButton, computersContainer } from './setup/setupDocument'

const { Computer, Keyboard, Controls, ComputerConnection } =
  window.DesktopVision.loadSDK(BABYLON)

const clientID = '6wlqRxEgp60JXkcGkLY2' //must match the api key used on the server
const selectComputer = true // return from dv popup with computer selected for a faster load
const oauthMethod = 'popup' // The oauth method: popup || window

let computerConnection, desktop, keyboard, controls

let code,
  token,
  computers = [],
  computerId

const engine = createDefaultEngine()
const scene = createScene(engine)
const testPlane = createTestPlane(scene)
const camera = createCamera(scene)
const xrHelper = scene.createDefaultXRExperienceAsync()

const keyboardOptions = {
  initialPosition: { x: 0, y: 0, z: 0 },
  initialScalar: 0.35,
  hideMoveIcon: false
}

const desktopOptions = {
  initialPosition: { x: 0, y: 0, z: 2 },
  renderScreenBack: true,
  initialScalar: 1,
  hideMoveIcon: false,
  includeKeyboard: true,
  grabDistance: 1,
}

enterSceneButton.onclick = enterVR
authCodeButton.onclick = getDesktopVisionCode
authTokenButton.onclick = connectToDV
fetchComputersButton.onclick = fetchComputers
createComputerButton.onclick = createTestComputer
connectSingleComputerButton.onclick = connectToSingleComputer
removeComputerButton.onclick = removeComputer

function parseUrlForCode() {
  const urlParams = new URLSearchParams(window.location.search)
  code = urlParams.get('code')
  computerId = urlParams.get('computer_id')
}

function getDesktopVisionCode() {
  const scope = encodeURIComponent('connect,list')
  const redirectURL = new URL(window.location.href)
  redirectURL.searchParams.set('oauth', 'desktopvision')
  const redirectUri = encodeURIComponent(redirectURL)
  if (oauthMethod === 'popup') {
    getDesktopVisionCodePopup(scope, redirectUri)
  } else {
    getDesktopVisionCodeSameWindow(scope, redirectUri)
  }
}

function getDesktopVisionCodePopup(scope, redirectUri) {
  const newWindow = window.open(
    `https://desktop.vision/login/?response_type=code&client_id=${clientID}&scope=${scope}&redirect_uri=${redirectUri}&redirect_type=${oauthMethod}&selectComputer=${selectComputer}`,
  )
  window.onmessage = (e) => {
    code = e.data.code
    computerId = e.data.computerId
    if (code && computerId) {
      newWindow.close()
      updateButtonState()
    }
  }
}

function getDesktopVisionCodeSameWindow(scope, redirectUri) {
  window.location.href = `https://desktop.vision/login/?response_type=code&client_id=${clientID}&scope=${scope}&redirect_uri=${redirectUri}&selectComputer=${selectComputer}`
}

async function connectToDV() {
  try {
    const response = await fetch(`/desktop-vision-auth?code=${code}`)
    const userData = await response.json()
    token = userData.token
  } catch (e) {
    console.log(e.message)
  }
  clearUrlParams()
  updateButtonState()
}

async function connectToSingleComputer() {
  await fetchComputers()
  const selectedC = computers.find((c) => c.id === computerId)
  connectToComputer(selectedC)
}

async function fetchComputers() {
  const apiEndPoint = `https://desktop.vision/api/users/${token.uid}/computers?access_token=${token.access_token}`
  const res = await fetch(apiEndPoint)
  computers = await res.json()
  createComputerButtons(computers)
}

function createComputerButtons(computers) {
  const computersExist = computers.length > 0
  for (const child of computersContainer.children)
    computersContainer.removeChild(child)
  if (computersExist) {
    for (const computer of computers) {
      const computerButton = document.createElement('button')
      computerButton.onclick = () => connectToComputer(computer)
      computerButton.textContent = 'Stream ' + computer.computerName
      computersContainer.appendChild(computerButton)
    }
  } else {
    const missingTextDiv = document.createElement('div')
    missingTextDiv.textContent =
      'No computers available for this user. Try connecting to a different Desktop Vision account, or connect a streamer app.'
    computersContainer.appendChild(missingTextDiv)
  }
}


function clearUrlParams() {
  const url = new URL(location.href)
  url.searchParams.delete('oauth')
  url.searchParams.delete('code')
  url.searchParams.delete('computer_id')
  window.history.replaceState({}, '', url)
  code = null
}

async function connectToComputer(computer) {
  const method = 'POST'
  const body = JSON.stringify({ channel_name: computer.channel_name })
  const headers = { 'Content-Type': 'application/json' }
  const fetchOptions = { method, body, headers }
  const apiEndPoint = `https://desktop.vision/api/connect?access_token=${token.access_token}`
  const res = await fetch(apiEndPoint, fetchOptions)
  const { roomOptions } = await res.json()

  createComputerConnection(roomOptions)
}

function createComputerConnection(connectionOptions) {
  if (computerConnection) computerConnection = null
  computerConnection = new ComputerConnection(connectionOptions)
  computerConnection.on('stream-added', handleStreamAdded)
}

function handleStreamAdded(newStream) {
  removeComputer()

  const video = document.getElementById('video-stream')
  video.setAttribute('webkit-playsinline', 'webkit-playsinline')
  video.setAttribute('playsinline', 'playsinline')
  video.srcObject = newStream
  video.muted = true
  video.play()

  createComputer(video)
}

function createComputer(video) {
  if (checkBox && checkBox.checked) desktopOptions.attachTo = testPlane
  else desktopOptions.attachTo = null

  desktop = new Computer(
    scene,
    video,
    computerConnection,
    camera,
    desktopOptions,
  )
  keyboard = new Keyboard(desktop, keyboardOptions)
  controls = new Controls(desktop)
  desktop.keyboard = keyboard
}

function removeComputer() {
  if (desktop) {
    desktop.remove()
    desktop = null
  }
}

function createTestComputer() {
  removeComputer()

  const video = document.getElementById('video-stream')
  video.setAttribute('webkit-playsinline', 'webkit-playsinline')
  video.setAttribute('playsinline', 'playsinline')
  video.src = '/dvVid.mp4'
  video.muted = true
  video.play()

  createComputer(video)
}

function enterVR() {
  const babylonVRButton = document.getElementsByClassName('babylonVRicon')[0]
  babylonVRButton.click()
}

engine.runRenderLoop(function () {
  if (scene && scene.activeCamera) {
    scene.render()
    if (keyboard) keyboard.update()
    if (desktop) desktop.update()
  }
})

window.addEventListener('resize', function () {
  engine.resize()
})

parseUrlForCode()
updateButtonState()

export { code, computerId, token }