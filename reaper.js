// reaper will listen to all events of redis queue (id, timestamp, status_int);
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { "rejectUnauthorized": false }
});

var kue = require('kue');

let queue = kue.createQueue({
    redis: process.env.REDIS_URL
  });

queue.process('db_status', function (job, done) {
    updateDb(job.id, job.data, done);
});

function updateDb(id, data, done) {

    pool.connect((err, client, release) => {
        if (err) {
            console.error('Error acquiring client', err.stack);
            done();
        }
        const statement = `insert into db_status values (${data.db_id}, ${data.timestamp}, ${data.status_int})`;
        client.query(statement, (err, result) => {
            release();
            if (err) {
                console.error('Error executing query', err.stack);

                done();
            }
            console.log(result.rows)
            done();
        })
    })
}