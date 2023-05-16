/* 
  Any functions using Pooling, must handle errors where they are
  implemented, allowing the client to be 'released' before error
  propogation occurs
*/

// Import
const { Pool } = require('pg')

// Configured pool for checking-out Client connections
const pool = new Pool ({
  user: '',
  password: '',
  host: '127.0.0.1',
  database: 'library', 
  port: 5432 
})

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client.', err)
  process.exit(-1)
})

// Facade Pattern for making queires to the database
const query = async function (query, literals) {
  const client = await pool.connect()

  try {
    const queryResponse = await !literals ?  client.query(query) : client.query(query, literals)
    client.release()
    return queryResponse
   }
   catch (error) {
     client.release()
     throw new Error(error) // Error is caught & re-thrown so client can be released
   }
} 

module.exports = { query }
