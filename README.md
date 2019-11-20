# postgre db monitoring service

A barebones Node.js app to monitor postgres status with different worker dyno, 
using redis, postgres.


## index.js 
index.is the API layer to get db status from db and to add new postgres configuration to be monitored.

## reaper.js
reapder.js is a redis queue worker to process job data and insert db status change event into this app own postgres db.

## connector.js
connector.js is the actual checker that run test connection periodically to dedect server status 
(0 is down, 1 is up). It will create a job to redis queue with data like
```json
{
    "db_id": 1,
    "timestamp": "2013-05-17 14:54:33.072726",
    "db_status": 1
}
```

## migration.sql
migration.sql has the db design to store postgres configuration and store actual db statuses.

## Procfile
Procfile tells all the dynos to be deployed on heroku. To run locally 
```
heroku local

