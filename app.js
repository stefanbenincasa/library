// Init //
const EventEmitter = require("node:events");
const ReadLine = require("node:readline");

class MyEmitter extends EventEmitter {}
const readLine = ReadLine.createInterface({input: process.stdin, output: process.stdout})
const myEmitter = new MyEmitter();

const menus = JSON.parse(JSON.stringify(require('./assets/data.json'))).menus
const query = require('./assets/connection.js').query
const waitPeriod = 3000

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
		case 1:				viewLibrary(); break; // View library
		case 2:				break; // Create account
		case 3:				break; // Rent book
		case 4:				break; // View libary by popularity 
		case 5:				break; // Quit
		default:			throw new Error("\n\nApplication Error!\n END\n");
	}
}

async function viewLibrary() {
	let books = await query(`SELECT * FROM book;`)
	let outputString = "\nThe Library\n\n"
	let fields = books.fields.reverse().slice(1)
	
	let book = null
	let bookLines = []
	let temp = ""

	for(let i = 0; i < books.rows.length; i++) {
	  book = books.rows[i]

		// Cycle through column names for current book & calculate necessary padding

		for(let j = 1; j < fields.length; j++) {
			temp = fields[j].name.toUpperCase()
			temp += temp.padEnd(20)
			temp += `\t\t\t${book[fields[j].name]}\n`
			bookLines.push(temp)
			temp = ""
		}
		
		// Append to final output & reset for next book	
		outputString += bookLines.join() + "\n"
		bookLines = []
		temp = ""
	}

	outputString += "\n"
	console.log(outputString)

	// After N seconds return to Main Menu
	setTimeout(() => mainMenu(), waitPeriod)
}

function run() {
	mainMenu()
}

// Helpers //
function prompt(str) {
	return new Promise(resolve => readLine.question(str, resolve))
}

function findLongestLength(strings) {
	try {
		if(!Array.isArray(strings) || strings.length === 0 || strings.some(str => str === "")) throw new Error()
		return strings.sort().reverse()[0].length
	}
	catch (error) {
		console.error(`\nError finding longest length. Returning to Main Menu...\n`)
		mainMenu()
	}
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

