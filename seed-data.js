const mysql = require('mysql2');
const DB_NAME = 'movies_database';

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'example',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }

  console.log('Connected to MySQL server');

  // Create the database if it doesn't exist
  const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${DB_NAME}`;
  connection.query(createDatabaseQuery, (createDatabaseError, createDatabaseResults) => {
    if (createDatabaseError) {
      console.error('Error creating database:', createDatabaseError);
      connection.end();
      return;
    }

    console.log(`Database "${DB_NAME}" created or already exists`);

    // Switch to the created database
    connection.changeUser({ database: DB_NAME }, (changeUserError) => {
      if (changeUserError) {
        console.error('Error switching to database:', changeUserError);
        connection.end();
        return;
      }

      console.log(`Switched to database "${DB_NAME}"`);

      // Define the SQL query to create a table if not exists
      const createTableQuery = `
   CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    rating FLOAT NOT NULL,
    release_year INT NOT NULL,
    director VARCHAR(255) NOT NULL,
    budget INT NOT NULL,
    comments VARCHAR(255) 
   )
 `;

      // Execute the query to create the table
      connection.query(createTableQuery, (createTableError, createTableResults) => {
        if (createTableError) {
          console.error('Error creating table:', createTableError);
          connection.end();
          return;
        }

        console.log('Table "movies" created or already exists');

        const insertDataQuery = `
        INSERT INTO movies (title, genre, rating, release_year, director, budget, comments) VALUES
        ('The Godfather', 'Crime', 9.2, 1972, 'Francis Ford Coppola', 6000000, ''),
        ('The Dark Knight', 'Action', 9.0, 2008, 'Christopher Nolan', 185000000, ''),
        ('The Conjuring', 'Horror', 7.6, 2013, 'James Wan',20000000, ''),
        ('The Lord of the Rings: The Return of the King', 'Fantasy', 8.9, 2003, 'Peter Jackson', 281000000, ''),
        ('Pulp Fiction', 'Crime', 8.9, 1994, 'Quentin Tarantino', 8000000, ''),
        ('The Good, the Bad and the Ugly', 'Western', 8.9, 1966, 'Sergio Leone', 1250000, ''),
        ('Pans Labyrinth', 'Fantasy', 7.6, 2006, 'Guillermo del Toro"', 1700000, ''),
        ('Titanic', 'Romance', 7.8, 1997, 'James Cameron',210000000, ''),
        ('The Princess Bride','Adventure', 8.1, 1987, 'Rob Reiner', 35000000, ''),
        ('Harry Potter and the Sorcerers Stone', 'Fantasy', 8.1, 2001, 'Chris Columbus', 135425579, '')
      `;

        // Execute the query to insert data
        connection.query(insertDataQuery, (insertDataError, insertDataResults) => {
          if (insertDataError) {
            console.error('Error inserting data:', insertDataError);
          } else {
            console.log('Data inserted or already exists');
          }

          // Close the connection
          connection.end();
        });
      });
    });
  });
});
