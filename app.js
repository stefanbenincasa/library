// Init //
const EventEmitter = require("node:events");
const ReadLine = require("node:readline");

class MyEmitter extends EventEmitter {}

const readLine = ReadLine.createInterface({input: process.stdin, output: process.stdout})
const myEmitter = new MyEmitter();

const menus = JSON.parse(JSON.stringify(require('./menus.json'))).menus

myEmitter.on("menuChange", function() {
	console.log("Menu Changed.")
});

try {
	run()
}
catch(error) {
	console.error(error.message)
	process.exit()
}

// Functions //
async function mainMenu() {
	let response, validInput = false, mainMenu = menus.find(menu => menu.name === "Main Menu")

	while(!validInput) {
		response = await prompt(mainMenu.value)
		response = parseInt(response)
		validInput = validateInput(mainMenu.inputType, mainMenu.validInputs, response)
	}

	// Valid input selected for Main Menu, proceed to next selected menu
	switch(response) {
		case 1:				console.log("You are now viewing the library"); break; // View library
		case 2:				break; // Create account
		case 3:				break; // Rent book
		case 4:				break; // View libary by popularity 
		case 5:				break; // Quit
		default:			throw new Error("\n\nApplication Error!\n END\n");
	}
}
async function viewLibrary() {
}

function run() {
	mainMenu()
}

// Helpers //
function prompt(str) {
	return new Promise(resolve => readLine.question(str, resolve))
}
function validateInput(inputType, validInputs, input) {
	if(inputType === 'numerical-range') {
		let max = validInputs.sort().reverse()[0]
		if(isNaN(input)) {
			console.log("\n\nPlease select a numerical value\n\n")
			return false 
		}
		if(!validInputs.some(item => item == input)) {
			console.log(`\nPlease select a numerical option within the range 1-${max}.\n`)
			return false 
		}
	}

	return true 
}
