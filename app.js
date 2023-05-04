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
		case 1:				viewLibrary(); break; 
		case 2:				break; // Create account
		case 3:				break; // Rent book
		case 4:				viewLibrary("popularity"); break;
		case 5:				process.exit(1); break;
		default:			throw new Error("\n\nApplication Error!\n END\n");
	}
}

async function viewLibrary(sortingMethod) {
	let book = null
	let books = null

	let overallOutput = "\nThe Library"
	let bookOutput = "" 
	let bookLines = ""

	let fields = null
	let longestColumnLength = null
	let padding = 0

	if(sortingMethod === "popularity") {
		overallOutput += "-> By Popularity\n\n"
		books = await query("SELECT * FROM book ORDER BY rented DESC;") 
	}
	else {
		overallOutput += "\n\n"
		books = await query("SELECT * FROM book;")
	}

	fields = books.fields
	longestColumnLength = fields.map(field => field.name).sort(orderByLongest)[0].length

	for(let i = 0; i < books.rows.length; i++) { 
		book = books.rows[i]	

		// Cycle through column names for current book & calculate necessary padding
		for(let j = 1; j < fields.length; j++) { // Exclude column BookID; j = 1
			bookLines += fields[j].name.toUpperCase()
			padding = longestColumnLength - fields[j].name.length	
			for(let k = 0; k < padding; k++) bookLines += " "
			bookLines += `\t\t\t${book[fields[j].name]}\n`
		}
		
		// Append to final output & reset
		bookOutput += bookLines + "\n"
		overallOutput += bookOutput
		bookOutput = bookLines = ""
	}

	// Final & print
	overallOutput = overallOutput.substring(0, overallOutput.length - 1)
	console.log(overallOutput)

	// After N seconds return to Main Menu
	setTimeout(() => console.log("Returning to Main Menu..."), waitPeriod / 2)
	setTimeout(() => mainMenu(), waitPeriod)
}

function run() {
	mainMenu()
}

// Helpers //
function prompt(str) {
	return new Promise(resolve => readLine.question(str, resolve))
}

function orderByLongest(strOne, strTwo) {
	if(strOne.length > strTwo.length) 		return -1
	if(strOne.length < strTwo.length) 		return 1
	if(strOne.length === strTwo.length) 	return 0
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

