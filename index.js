const express = require('express')
const path = require('path')
const cool = require('cool-ascii-faces')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { "rejectUnauthorized": false }
});



express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
  .post('/addDB', async (req, res) => {
      // add a new postgres url to be monitored


  }).get('/serverStatus', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM db_status where status_int = 0 order by timestamp desc limit 1');
      const lastOffTimestamp  = result.timestamp;

      const lastOnTimestamp = await client.query(
        `SELECT * FROM db_status where status_id = 1 and timestamp > ${lastOffTimestamp} order by timestamp asc limit 1`
        ).timestamp;
      const downTime = lastOnTimestamp - lastOffTimestamp;
      res.render('pages/db', { db_id: 1, lastOffTimestamp, downTime} );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
