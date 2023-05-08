// Initialise //
const waitPeriod = 3000
const readLine = require("node:readline").createInterface({input: process.stdin, output: process.stdout})
const query = require('./assets/connection.js').query

let member = null

// Program //
run()

// Functions //
async function run() {
	try {
		await identify()
		mainMenu()
	}
	catch(error) {
		console.log(error.message)
		console.log("Ending...END.")
		process.exit()
	}
}

async function identify() {
	let input = validInput = response = null, invalidCount = 0, identifyTxt = ""

	// Initial boolean
	identifyTxt = "\nWelcome to the Library\nAre you an existing Member? [Y/N]\n>> "
	while(!validInput) {
		input = await prmpt(identifyTxt)
		validInput = boolValidation(input)
	}

	// Gather information and set global Member object
	validInput = null
	if(input.toUpperCase() === "Y") {

		while(!validInput) {
			if(invalidCount >= 3) throw new Error("Identification limit exceeded!")

			input = await prmpt("\nMember ID: ")
			validInput = numValidation(input, 1, 1000)
			if(!validInput) {
				invalidCount++
				continue
			}
			
			response = await query(`SELECT * FROM member WHERE member_id = $1 LIMIT 1;`, [input])	
			if(response.rows.length === 0) {
				console.log("\nNo Member found\n")
				validInput = false
				invalidCount++
			}
		}

		// Assume valid Member, set Member
		member = response.rows[0]
	}
}

async function mainMenu() {
	let input = null, validInput = null, mainMenuTxt = "", crtAcc = "Create account", rntBook = "Rent book"

	mainMenuTxt = 
	"\nWelcome to the Library\n" + 
	"1. View library\n" + 
	`2. ${!member ? crtAcc : rntBook}\n` +
	"3. View library by popularity\n" + 
	"4. Quit\n\n" +
	">> "

	while(!validInput) {
		input = parseInt(await prmpt(mainMenuTxt))
		validInput = numValidation(input, 1, 5)
	}

	// Valid input selected for Main Menu, proceed to next selected menu
	if(!member) {
		switch(input) {
			case 1:				viewLibrary(); break; 
			case 2:				createAccount(); break;
			case 3:				viewLibrary("popularity"); break;
			case 4:				process.exit(1); break;
			default:			throw new Error("\n\nApplication Error!\n END\n");
		}
	} else {
		switch(input) {
			case 1:				viewLibrary(); break; 
			case 2:				break; // Rent book
			case 3:				viewLibrary("popularity"); break;
			case 4:				process.exit(1); break;
			default:			throw new Error("\n\nApplication Error!\n END\n");
		}
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

// Functionality shared here with identify(), login should take place after signup
async function createAccount() {
	let validInput = null, invalidCount = 0, firstName = lastName = homeAddress = output = ""

	output = "\nThank you for considering membership!\nWe require the following information to proceed: "
	console.log(output)

	while(!validInput) {
		if(invalidCount >= 3) {
			console.log("Maximum input errors exceeded! Returning to Main Menu...")
			setTimeout(() => mainMenu(), waitPeriod)
		  return	
		}

		output = "First Name: "
		firstName = await prmpt(output)
		validInput = strValidation(firstName, 1, 30) && !firstName.includes(" ")
		if(!validInput) {
			invalidCount++
			console.log("\nInvalid [First Name]. Input length must be between 1 and 30 inclusive, without spaces.")
			continue
		}

		output = "\nLast Name: "
		lastName = await prmpt(output)
		validInput = strValidation(lastName, 1, 30) && !lastName.includes(" ")
		if(!validInput) {
			invalidCount++
			console.log("\nInvalid [Last Name]. Input length must be between 1 and 30 inclusive, without spaces.")
			continue
		}

		output = "\nHome Address: "
		homeAddress = await prmpt(output)
		validInput = strValidation(homeAddress, 1, 50)
		if(!validInput) {
			invalidCount++
			console.log("\nInvalid [Home Address]. Input length must be between 1 and 50 inclusive.")
			continue
		}
	}

	// Set Member for persistance and application
	try {
		let response = null, q = ""  

		q = `INSERT INTO member(first_name, last_name, home_address) VALUES ($1, $2, $3) RETURNING member_id;`
		response = await query(q, [firstName, lastName, homeAddress])	

		q = `SELECT member_id FROM member WHERE member_id = $1;`
		response = await query(q, [response.rows[0].member_id])	

		if(response.rowCount != 1) throw Error()
		member = { firstName, lastName, homeAddress }
		console.log("New account created successfully!\nReturning to Main Menu...")	
		setTimeout(() => mainMenu(), waitPeriod)
	}
	catch(error) {
		console.log("Application error from creating new account!")
		throw error
	}
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

function numValidation(input, min, max) {
	if(isNaN(input)) {
		console.log("\n\nPlease select a numerical value")
		return false
	}
	else if(input < min || input > max) {
		console.log(`\n\nPlease select a numerical option within the range ${min}-${max}.`)
		return false
	}

	return true
}

function strValidation(input, minLength, maxLength) {
	if(input.length < minLength) {
		console.log(`\n\nInput too short. Provide input that has a minimum length of ${minLength}`)
		return false
	}
	if(input.length > maxLength) {
		console.log(`\n\nInput too long. Provide input that has a maximum length of ${maxLength}`)
		return false
	}

	return true
}

function boolValidation(input) {
	input = String(input)
	if((input.length !== 1) || (input.toUpperCase() !== "Y" && input.toUpperCase() !== "N")) {
		console.log(`\n\nInput type invalid. Please input either a 'Y' or 'N' value.`)
		return false
	}

	return true
}

