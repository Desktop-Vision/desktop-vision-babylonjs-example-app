import * as BABYLON from 'babylonjs'

const { Computer, Keyboard, Controls, ComputerConnection } = window.DesktopVision.loadSDK(BABYLON)

let code, token, computers = [], computerId;
let computerConnection, desktop, keyboard, controls;

const sceneContainer = document.getElementById("scene-container");
const computersContainer = document.getElementById('computers-wrapper')
const authCodeButton = document.getElementById("dv-auth-code")
const authTokenButton = document.getElementById("dv-auth-token")
const fetchComputersButton = document.getElementById("dv-fetch-computers")
const connectSingleComputerButton = document.getElementById("dv-connect-computer")
const enterSceneButton = document.getElementById("enter-scene-button")
const createComputerButton = document.getElementById("computer-test-button")
const canvas = document.getElementById("renderCanvas");

const clientID = "6wlqRxEgp60JXkcGkLY2"; //must match the api key used on the server

const desktopPosition = { x: 0, y: 0.25, z: 2 }
const kbPosition = { x: 0, y: -0.75, z: 0 }

const keyboardOptions = {
	initialPosition: kbPosition,
	initialScalar: 0.5,
	hideMoveIcon: false,
	hideResizeIcon: false,
}

const desktopOptions = {
	initialPosition: desktopPosition,
	renderScreenBack: true,
	initialScalar: 1,
	hideMoveIcon: false,
	hideResizeIcon: false,
	includeKeyboard: true,
	grabDistance: 1,
}

const engine = createDefaultEngine()
const scene = createScene()
const testBox = createTestBox()
const camera = createCamera()
const xrHelper = scene.createDefaultXRExperienceAsync();

function createDefaultEngine() {
	return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
};

function createScene() {
	const scene = new BABYLON.Scene(engine);
	const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0)); BABYLON
	return scene;
}

function createCamera() {
	const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 0, 0));
	camera.attachControl(canvas, true);
	return camera
}

function addButtonEventListeners() {
	enterSceneButton.onclick = enterVR
	authCodeButton.onclick = getDvCode
	authTokenButton.onclick = connectToDV
	fetchComputersButton.onclick = fetchComputers
	createComputerButton.onclick = createTestComputer
	connectSingleComputerButton.onclick = connectToSingleComputer
}
function updateButtonState() {
	authCodeButton.disabled = code
	fetchComputersButton.disabled = !token
	authTokenButton.disabled = !code
	connectSingleComputerButton.disabled = !token || !computerId
}


function getDvCode() {
	const scope = encodeURIComponent("connect,list");

	const redirectURL = new URL(window.location.href);
	redirectURL.searchParams.set("oauth", "desktopvision");
	const redirectUri = encodeURIComponent(redirectURL);
	const selectComputer = true
	const method = 'popup' // change this to something else for same window auth
	if (method === 'popup') {
		const newWindow = window.open(`https://desktop.vision/login/?response_type=code&client_id=${clientID}&scope=${scope}&redirect_uri=${redirectUri}&redirect_type=popup&selectComputer=true`);
		window.onmessage = function (e) {
			code = e.data.code
			computerId = e.data.computerId
			if (code && computerId) {
				newWindow.close()
				updateButtonState()
			}
		};
	} else {
		window.location.href = `https://desktop.vision/login/?response_type=code&client_id=${clientID}&scope=${scope}&redirect_uri=${redirectUri}&selectComputer=${selectComputer}`;
	}
}

async function connectToDV() {
	try {
		const response = await fetch(`/desktop-vision-auth?code=${code}`);
		const userData = await response.json();
		token = userData.token;
	} catch (e) {
		console.log(e.message)
	}
	clearUrlParams();
	updateButtonState()
}

async function connectToSingleComputer() {
	await fetchComputers()
	const selectedC = computers.find(c => c.id === computerId)
	connectToComputer(selectedC)
}

async function fetchComputers() {
	const apiEndPoint = `https://desktop.vision/api/users/${token.uid}/computers?access_token=${token.access_token}`;
	const res = await fetch(apiEndPoint);
	computers = await res.json();
	createComputerButtons(computers)
}

function createComputerButtons(computers) {
	const computersExist = computers.length > 0
	for (const child of computersContainer.children) computersContainer.removeChild(child)
	if (computersExist) {
		for (const computer of computers) {
			const computerButton = document.createElement('button')
			computerButton.onclick = () => connectToComputer(computer)
			computerButton.textContent = "Stream " + computer.computerName
			computersContainer.appendChild(computerButton)
		}
	} else {
		const missingTextDiv = document.createElement('div')
		missingTextDiv.textContent = "No computers available for this user. Try connecting to a different Desktop Vision account, or connect a streamer app."
		computersContainer.appendChild(missingTextDiv)
	}
}

function checkUrlParams() {
	const urlParams = new URLSearchParams(window.location.search);
	code = urlParams.get("code");
	computerId = urlParams.get("computer_id");
}

function clearUrlParams() {
	const url = new URL(location.href);
	url.searchParams.delete("oauth");
	url.searchParams.delete("code");
	url.searchParams.delete("computer_id");
	window.history.replaceState({}, "", url);
	code = null;
}

async function connectToComputer(computer) {
	const method = "POST"
	const body = JSON.stringify({ "channel_name": computer.channel_name })
	const headers = { "Content-Type": "application/json" };
	const fetchOptions = { method, body, headers };
	const apiEndPoint = `https://desktop.vision/api/connect?access_token=${token.access_token}`;
	const res = await fetch(apiEndPoint, fetchOptions);
	const { roomOptions } = await res.json();

	createComputerConnection(roomOptions)
}

function createComputerConnection(connectionOptions) {
	if (computerConnection) computerConnection = null;
	computerConnection = new ComputerConnection(connectionOptions);
	computerConnection.on("stream-added", (newStream) => {
		const video = document.getElementById("video-stream");
		video.srcObject = newStream;
		video.muted = true
		video.play();

		removeComputer()
		createComputer(video);
	});
}


function createComputer(video) {
	desktop = new Computer(scene, video, computerConnection, camera, desktopOptions);
	keyboard = new Keyboard(desktop, keyboardOptions)
	controls = new Controls(desktop);
	desktop.keyboard = keyboard
}

function removeComputer() {
	if (desktop) {
		desktop.remove()
		desktop = null
	}
}


function createTestComputer() {
	const video = document.getElementById("video-stream");
	video.src = '/dvVid.mp4';
	video.muted = true
	video.play();

	removeComputer()
	createComputer(video)
}

function enterVR() {
	const babylonVRButton = document.getElementsByClassName("babylonVRicon")[0]
	babylonVRButton.click()
}

function createTestBox() {

	const testMat = new BABYLON.StandardMaterial("test-mat", scene);
	const color = new BABYLON.Color4(0, 0, 0, 1);
	testMat.diffuseColor = color
	testMat.specularColor = color
	testMat.emissiveColor = color
	testMat.ambientColor = color
	const testOptions = {
		height: 1,
		width: 1,
		depth: 1
	};

	const testBox = BABYLON.MeshBuilder.CreateBox("test-mesh", testOptions, scene);
	testBox.position.z = 5

	return testBox
}


engine.runRenderLoop(function () {
	if (scene && scene.activeCamera) {
		scene.render();
		if (keyboard) keyboard.update()
		if (desktop) desktop.update()
	}
});

window.addEventListener("resize", function () {
	engine.resize();
});

checkUrlParams()
updateButtonState()
addButtonEventListeners()