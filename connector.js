const { TaskTimer } = require('tasktimer');
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgres://ub3tfoer7llifp:pcddde5abe833e11c1a0cf7533cb2d0efcc76f1d79951a8a308b22df5ead9418c@ec2-34-195-149-205.compute-1.amazonaws.com:5432/dddi0c0k8bohob',
    //connectionString: process.env.DATABASE_URL,
    ssl: { "rejectUnauthorized": false }
});

var kue = require('kue');

let queue = kue.createQueue({
    redis: process.env.REDIS_URL
});

// Timer with 100ms (1 second)
const timer = new TaskTimer(1000); // 1000 with exponential time backoff if current status is on
// 100 if current status is down

// remember old db status
let map = {};

timer.add([
    {
        id: '1',
        tickInterval: 1,
        totalRuns: 0,      // unlimited times
        async callback(task) {
            console.log(`${task.id} task has run ${task.currentRuns} times.`);
            let oldStatus = map[task.id];
            try {
                await connect();
                if (oldStatus != 1) {
                    // insert (id, timestamp, 1) to status table
                    var job = queue.create(task.id, {
                        id: task.id,
                        timestamp: new Date(),
                        db_status: 1
                    });

                    job.save();
                }
                map[task.id] = 1;
            } catch (error) {
                console.log("here");
                console.log(error);
                if (oldStatus != 0) {
                    // insert (id, timestamp, 0) to status table
                    var job = queue.create(task.id, {
                        id: task.id,
                        timestamp: new Date(),
                        db_status: 0
                    });

                    job.save();
                }
                map[task.id] = 0;
            }
        }
    }
]);

async function connect() {

    (async () => {
        var client = await pool.connect()
        try {
            var result = await client.query('SELECT version()');
            console.log(result.rows[0])
        } finally {
            client.release()
        }
    })().catch(e => console.error(e.message, e.stack))

}

timer.on('tick', () => {
    console.log('tick count: ' + timer.tickCount);
    //if (timer.time.elapsed >= 1000000) timer.stop();
});

// Start the timer
timer.start();