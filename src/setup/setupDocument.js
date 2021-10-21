import { code, computerId, token } from '../main'

const sceneContainer = document.getElementById('scene-container')
const computersContainer = document.getElementById('computers-wrapper')
const authCodeButton = document.getElementById('dv-auth-code')
const authTokenButton = document.getElementById('dv-auth-token')
const fetchComputersButton = document.getElementById('dv-fetch-computers')
const connectSingleComputerButton = document.getElementById(
  'dv-connect-computer',
)
const enterSceneButton = document.getElementById('enter-scene-button')
const createComputerButton = document.getElementById('computer-test-button')
const removeComputerButton = document.getElementById('computer-remove-button')
const canvas = document.getElementById('renderCanvas')
const checkBox = document.getElementById('custom-checkbox')

function updateButtonState() {
  authCodeButton.disabled = code
  fetchComputersButton.disabled = !token
  authTokenButton.disabled = !code
  connectSingleComputerButton.disabled = !token || !computerId
}


export { updateButtonState, sceneContainer, checkBox, computersContainer, authCodeButton, authTokenButton, fetchComputersButton, connectSingleComputerButton, enterSceneButton, createComputerButton, removeComputerButton, canvas }