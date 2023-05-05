// Initialise //
const waitPeriod = 3000
const readLine = require("node:readline").createInterface({input: process.stdin, output: process.stdout})
const query = require('./assets/connection.js').query

// Program //
try {
	run()
}
catch(error) {
	console.error(error.message)
	process.exit()
}

// Functions //
function run() {
	mainMenu()
}

async function mainMenu() {
	let input = null, validInput = null, mainMenuTxt = ""

	mainMenuTxt = 
	"\nWelcome to the Library\n1. View library" + 
	"\n2. Create account\n3. Rent a book" +
	"\n4. View library by popularity\n5. Quit"+
	"\n\n>> "

	while(!validInput) {
		input = parseInt(await prmpt(mainMenuTxt))
		if(isNaN(input)) {
			validInput = false 
			console.log("\n\nPlease select a numerical value\n\n")
		}
		else if(input <= 0 || input > 5) {
			validInput = false 
			console.log(`\nPlease select a numerical option within the range 1-5.\n`)
		}
		else {
			validInput = true
		}
	}

	// Valid input selected for Main Menu, proceed to next selected menu
	switch(input) {
		case 1:				viewLibrary(); break; 
		case 2:				createAccount(); break;
		case 3:				break; // Rent book
		case 4:				viewLibrary("popularity"); break;
		case 5:				process.exit(1); break;
		default:			throw new Error("\n\nApplication Error!\n END\n");
	}
}

async function viewLibrary(sortingMethod) {
	let book = null
	let books = null

	let overallOutput = "\nTHE LIBRARY"
	let bookOutput = "" 
	let bookLines = ""

	let fields = null
	let longestColumnLength = null
	let padding = 0

	if(sortingMethod === "popularity") {
		overallOutput += "---> By Popularity\n\n"
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

async function createAccount() { 
	let input = null, inputType = "first_name", creatingAccount = true, 
	prmptTxt = firstName = lastName = homeAddress = ""

	prmptTxt = 
	"\nSome personal information is required to become a Member.\n" + 
	"Would you like to proceed? Y/N\n" + ">> "

	try {
	}
	catch(error) {
		console.log(error.message)
		setTimeout(() => mainMenu(), waitPeriod)
	}
}

function rentBook() {

}

// Helpers //
function prmpt(str) {
	return new Promise(resolve => readLine.question(str, resolve))
}

function orderByLongest(strOne, strTwo) {
	if(strOne.length > strTwo.length) 		return -1
	if(strOne.length < strTwo.length) 		return  1
	if(strOne.length === strTwo.length) 	return  0
}

