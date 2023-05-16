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
		console.log("\nApplication Error!");
		console.log(error.message)
		console.log("Ending...END.")
		process.exit()
	}
}

async function identify() {
	let input = validInput = response = username = password = null, invalidCount = 0

	while(!validInput) {
		input = await prmpt("\nWelcome to the Library\nAre you an existing Member? [Y/N]\n>> ")
		validInput = boolValidation(input)
	}

	validInput = null
	if(input.toUpperCase() === "Y") {

		while(!validInput) {
			if(invalidCount >= 3) throw new Error("Identification limit exceeded!")

			if(!username) {
				input = await prmpt("\nUsername: ")
				validInput = strValidation(input, 1, 40)
				if(!validInput) {
					invalidCount++
					continue
				}
				else {
					username = input
					response = await query(`SELECT * FROM member WHERE username = $1 LIMIT 1;`, [username])	
					if(response.rows.length === 0) {
						console.log("\nNo Member found")
						validInput = false
						invalidCount++
						username = null
						continue
					}
				}
			}

			if(!password) {
				input = await prmpt("Password: ")
				validInput = strValidation(input, 1, 25)
				if(!validInput) {
					console.log("\nInvalid password! Try again.")
					invalidCount++
					continue
				}
				else {
					password = input
				}
			}

			if(username && password) {
				response = await query(`SELECT * FROM member WHERE username = $1 AND password = $2 LIMIT 1;`, [username, password])	
				if(response.rows.length === 0) {
					console.log("\nInvalid password! Try again.")
					validInput = false
					invalidCount++
					password = null
				}
			}
		}

		member = { 
			memberId: 			response.rows[0].member_id, 
			firstName: 			response.rows[0].first_name,
			lastName: 			response.rows[0].last_name,
			homeAddress: 		response.rows[0].home_address,
			username:				response.rows[0].username
		}

	}
}

async function mainMenu() {
	let input = null, validInput = null, mainMenuTxt = dynamicTxt = "", listCount = 1

	mainMenuTxt = 
	`\nWelcome to the Library\n` + `${listCount++}. View library\n`

 	dynamicTxt = 
	member ? `${listCount++}. Rent book\n${listCount++}. View rentals\n` : `${listCount++}. Create account\n` 	

	mainMenuTxt += 
	dynamicTxt +
	`${listCount++}. View library by popularity\n` + 
	`${listCount++}. Quit\n\n` +
	">> "

	while(!validInput) {
		input = parseInt(await prmpt(mainMenuTxt))
		validInput = numValidation(input, 1, 5)
	}

	if(!member) {
		switch(input) {
			case 1:				viewLibrary(); 							break; 
			case 2:				createAccount(); 						break;
			case 3:				viewLibrary("popularity"); 	break;
			case 4:				process.exit(1); 						break;
			default:			throw new Error();
		}
	} else {
		switch(input) {
			case 1:				viewLibrary(); 							break; 
			case 2:				rentBook(); 								break;
			case 3:				viewRentals(); 							break;
			case 4:				viewLibrary("popularity"); 	break;
			case 5:				process.exit(1); 						break;
			default:			throw new Error();
		}
	}
}

async function viewLibrary(sortingMethod) {
	let books = response = null

	console.log("\nTHE LIBRARY")
	if(sortingMethod === "popularity") {
		console.log("---> By Popularity\n\n")
		response = await query("SELECT * FROM book ORDER BY rented DESC;") 
	}
	else {
		console.log("\n\n")
		response = await query("SELECT * FROM book;")
	}

	if(response.rows.length === 0) {
		throw new Error()
		setTimeout(() => console.log("No books in Library found! Returning to Main Menu..."), waitPeriod / 2)
		setTimeout(() => mainMenu(), waitPeriod)
	}
	
	books = response.rows
	for(let i = 0; i < books.length; i++) printFormattedObj(books[i], ["book_id"])

	console.log("Returning to Main Menu...")
	setTimeout(() => mainMenu(), waitPeriod)
}

async function createAccount() {
	let input = validInput = null, invalidCount = 0, 
	addressRegex = new RegExp(/^([0-9]{1,8}) ([A-Za-z]{1,16}) ([A-Za-z]{1,16})$/),
	firstName = lastName = homeAddress = username = password = output = ""

	output = "\nThank you for considering membership!\nWe require the following information to proceed: "
	console.log(output)

	while(!validInput) {
		if(invalidCount >= 100) {
			console.log("\nMaximum input errors exceeded! Returning to Main Menu...")
			setTimeout(() => mainMenu(), waitPeriod)
		  return	
		}

		if(!firstName) {
			output = "\nFirst Name: "
			input = await prmpt(output)
			validInput = strValidation(input, 1, 40, false) && !input.includes(" ")
			if(!validInput) {
				invalidCount++
				console.log("\nInvalid [First Name]. Input length must be between 1 and 40 inclusive, without spaces.")
				continue
			}
			else { 
				firstName = input 
			}
		}

		if(!lastName) {
			output = "\nLast Name: "
			input = await prmpt(output)
			validInput = strValidation(input, 1, 40, false) && !input.includes(" ")
			if(!validInput) {
				invalidCount++
				console.log("\nInvalid [Last Name]. Input length must be between 1 and 40 inclusive, without spaces.")
				continue
			}
			else {
				lastName = input
			}
		}

		if(!homeAddress) {
			output = "\nHome Address: "
			input = await prmpt(output)
			validInput = addressRegex.test(input)
			if(!validInput) {
				invalidCount++
				console.log(`\nInvalid [Home Address]. The format "[0-9]{1,9} [a-zA-Z]{1,16} [a-zA-Z]{1,16}" is required.`) 
				continue
			}
			else {
				homeAddress = input
			}
		}

		if(!username) {
			output = "\nUsername: "
			input = await prmpt(output)
			validInput = strValidation(input, 1, 40, false) && !input.includes(" ")
			if(!validInput) {
				invalidCount++
				console.log("\nInvalid [Username]. Input length must be between 1 and 40 inclusive, without spaces.")
				continue
			}
			else {
				username = input
			}
		}

		if(!password) {
			output = "\nPassword: "
			input = await prmpt(output)
			validInput = strValidation(input, 1, 25, false) && !input.includes(" ")
			if(!validInput) {
				invalidCount++
				console.log("\nInvalid [Password]. Input length must be between 1 and 25 inclusive, without spaces.")
				continue
			}
			else {
				password = input
			}
		}
	}

	let response = null, q = ""  

	q = `INSERT INTO member(first_name, last_name, home_address, username, password) ` +
	`VALUES ($1, $2, $3, $4, $5) RETURNING member_id;`

	response = await query(q, [firstName, lastName, homeAddress, username, password])	

	q = `SELECT * FROM member WHERE member_id = $1;`

	response = await query(q, [response.rows[0].member_id])	

	if(response.rowCount != 1) {
		console.log("\nError creating new account! Returning to Main Menu...")
		setTimeout(() => mainMenu(), waitPeriod)
	}

	member = { memberId: response.rows[0].member_id, firstName, lastName, homeAddress, username}
	console.log("\nNew account created successfully! Returning to Main Menu...")	
	setTimeout(() => mainMenu(), waitPeriod)
}

// Insert record into Rental table, using an ISBN Lookup, and the current Member ID
// Dual search options to be available, by Title, and by ISBN
async function rentBook() {
	if(!member) throw new Error()
	let input = validInput = null, invalidCount = 0, mode = title = isbn = output = ""

	output = "\nSelect your Rental Mode:\n1. Title\n2. ISBN\n>> "
	while(!validInput) {
		if(invalidCount >= 3) {
			console.log("\nMaximum input errors exceeded! Returning to Main Menu...")
			setTimeout(() => mainMenu(), waitPeriod)
		  return	
		}

		if(!mode) {
			input = await prmpt(output)
			validInput = numValidation(input, 1, 2)
			if(!validInput) {
				invalidCount++
				continue
			}
			else {
				mode = parseInt(input)
			}
		}

		switch(mode) {
			case 1:					

					output = "\nPlease enter the book Title: "
					input = await prmpt(output)
					validInput = strValidation(input, 1, 30)
					if(!validInput) {
						invalidCount++
						continue
					}
					else {
						title = input
					}

					break;

			case 2:					

					output = "\nPlease enter the book ISBN: "
					input = await prmpt(output)
					validInput = strValidation(input, 13, 13, false)
					if(!validInput) {
						console.log("\nISBN must be a 13 digit numerical string")
						invalidCount++
						continue
					}
					else {
						isbn = input
					}

					break;

			default:				

					throw new Error()
		}
	}

	let response = searchDelay = book = null, q = condition = value = "", 
	term = { name: title ? "Title": "ISBN", value: title ? title : isbn  }

	console.log(`\nSearching for Book by ${term.name}: ${term.value}`) 
	searchDelay = new Promise((resolve, reject) => setTimeout(() => resolve(), waitPeriod))
	await searchDelay

	condition = 
	`${term.name === "Title" ? "UPPER(" + term.name.toLowerCase() + ")" : term.name.toLowerCase()} = ` +
	`${term.name === "Title" ? "UPPER($1)" : "$1"}`

	q = `SELECT * FROM book WHERE ${condition};` 

	response = await query(q, [term.value])
	if(response.rows.length === 0) {
		console.log(`Book [${term.value}] not found. Returning to Main Menu...`)
		setTimeout(() => mainMenu(), waitPeriod)
		return
	} 

	try {
		book = response.rows[0]
		q  = `INSERT INTO rental(book_id, member_id) VALUES ($1, $2) RETURNING *;`
		response = await query(q, [response.rows[0].book_id, member.memberId])
		if(response.rowCount !== 1) throw new Error()

		q = `UPDATE book SET rented = rented + 1 WHERE book_id = $1 RETURNING *;`
		response = await query(q, [book.book_id])
		if(response.rowCount !== 1) throw new Error()

		console.log(`\nBook [${book.title}], has been successfully rented! Returning to Main Menu...`)
		setTimeout(() => mainMenu(), waitPeriod)
	}
	catch(error) {
		console.log("\nError renting book! Returning to Main Menu...")
		setTimeout(() => mainMenu(), waitPeriod)
	}
}

async function viewRentals() {
	if(!member) throw new Error()

	let response = rentals = null, q = ""

	q = `
		SELECT b.title, b.author, b.category, b.isbn
		FROM rental r 
			INNER JOIN member m ON r.member_id = m.member_id 
			INNER JOIN book b ON r.book_id = b.book_id
		WHERE r.member_id = $1;
	`

	response = await query(q, [member.memberId])	
	if(response.rows.length === 0) {
		console.log("\nNo rentals found! Returning to Main Menu...")
		setTimeout(() => mainMenu(), waitPeriod)
		return
	}
	
	rentals = response.rows
	console.log("\nHere are your current Rentals:\n")
	for(let i = 0; i < rentals.length; i++) printFormattedObj(rentals[i], ["book_id"])

	setTimeout(() => console.log("\nReturning to Main Menu..."), waitPeriod / 2)
	setTimeout(() => mainMenu(), waitPeriod)
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

// For object-array that has identical keys, print fixed amount of tabs from an anchor point
function printFormattedObj(obj, ignoreValues = []) {
	let fields = longestKey = null, output = ""

	fields = Object.keys(obj).filter(item => !ignoreValues.some(value => item == value)) // Ignored values removed first
	longestKey = [...fields].sort(orderByLongest)[0].length // New array used to avoid altering 'fields' in-place 

	for(let a = 0; a < fields.length; a++) {
		output += fields[a].toUpperCase()
		padding = longestKey - fields[a].length   
		for(let b = 0; b < padding; b++) output += " "
		output += `\t\t\t${obj[fields[a]]}\n`	
	}

	console.log(output)
}

function numValidation(input, min = 0, max = 0, printMessage = true) {
	let isValid = null

	if(max < min || min < 0 || max < 0) throw new Error()

	if(!input) {
		printMessage && console.log("\n\nPlease select a numerical value")
		isValid = false 
	}
	else if(input < min || input > max) {
		printMessage && console.log(`\n\nPlease select a numerical option within the range ${min}-${max}.`)
		isValid = false 
	}
	else {
		isValid = true
	}

	return isValid 
}

function strValidation(input, minLength = 0, maxLength = 0, printMessage = true) {
	let isValid = null

	if(minLength < minLength || minLength < 0 || maxLength < 0) throw new Error()

	if(!input) {
		isValid = false
	}
	else if(input.length < minLength) {
		printMessage && console.log(`\n\nInput too short. Provide input that has a minimum length of ${minLength}`)
		isValid = false 
	}
	else if(input.length > maxLength) {
		printMessage && console.log(`\n\nInput too long. Provide input that has a maximum length of ${maxLength}`)
		isValid = false 
	}
	else {
		isValid = true
	}

	return isValid
}

function boolValidation(input, printMessage = true) {
	let isValid = null

	if(typeof input !== "string") throw new Error()

	if(!input) {
		isValid = false
	} 
	else if((input.length !== 1) || (input.toUpperCase() !== "Y" && input.toUpperCase() !== "N")) {
		printMessage && console.log(`\n\nInput type invalid. Please input either a 'Y' or 'N' value.`)
		isValid = false
	}
	else {
		isValid = true
	}

	return isValid
}

