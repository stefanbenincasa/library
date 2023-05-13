DO $$
<<first_block>>

BEGIN
	

	CREATE TABLE Book (
		Book_ID         SERIAL PRIMARY KEY,
		Title           VARCHAR(40) NOT NULL,
		Author          VARCHAR(40) NOT NULL,
		Category        VARCHAR(25) CHECK (Category ~ 'Fiction' OR Category ~ 'Non-Fiction'),
		ISBN            VARCHAR(13) NOT NULL,
		Rented					INTEGER DEFAULT 0
	);

	CREATE TABLE Member (
		Member_ID        SERIAL PRIMARY KEY,
		First_Name       VARCHAR(40) NOT NULL,
		Last_Name        VARCHAR(40) NOT NULL,
		Home_Address     VARCHAR(40) NOT NULL,
		Username				 VARCHAR(40) NOT NULL,
		Password				 VARCHAR(25) NOT NULL
	);

	CREATE TABLE Rental ( 
		Book_ID          INTEGER NOT NULL REFERENCES Book(Book_ID),
		Member_ID        INTEGER NOT NULL REFERENCES Member(Member_ID),
		PRIMARY KEY(Member_ID, Book_ID)
	);


	INSERT INTO Book(Title, Author, Category, ISBN) 
	VALUES ('To Kill A Mockingbird', 'Harper Lee', 'Fiction', '9780060935467');

	INSERT INTO Book(Title, Author, Category, ISBN) 
	VALUES ('The War On The West', 'Douglas Murray', 'Non-Fiction', '9780008492847');

	INSERT INTO Book(Title, Author, Category, ISBN) 
	VALUES ('The Gulag Archipelago', 'Aleksandr Solzhenitsyn', 'Non-Fiction', '9781843430858');

	INSERT INTO Book(Title, Author, Category, ISBN) 
	VALUES ('Cobalt Red', 'Siddharth Kara', 'Non-Fiction', '9781250284303');

	INSERT INTO Book(Title, Author, Category, ISBN) 
	VALUES ('Russia', 'Antony Beevor', 'Non-Fiction', '9781474610148');

	INSERT INTO Book(Title, Author, Category, ISBN) 
	VALUES ('The Silmarillion', 'J.R.R Tolkien', 'Fiction', '9780008537890');


	INSERT INTO Member(First_Name, Last_Name, Home_Address, Username, Password)
	VALUES ('Stefan', 'Benincasa', '123 Fake Street', 'stefanbenin', '1234');


	EXCEPTION WHEN SQLSTATE '23000' THEN 
		RAISE EXCEPTION 'Error in table creation!';

END first_block $$;

