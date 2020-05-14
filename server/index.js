const keys = require("./keys");
const redis = require("redis");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());


// postgres client setup
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on("error", () => console.log("Lost PG connection"));

// create table
pgClient.query("CREATE TABLE IF NOT EXISTS values (number int)")
  .catch(err => console.log("PG table creation error: ", err));



// redis client setup
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

// we create a duplicate because a single redisClient instance cannot be both a publisher and a listener
const redisPublisher = redisClient.duplicate();


//routes
app.get("/", (req, res) => res.send("Hi"));

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * FROM values");

  res.send(values.rows); // exclude meta info by sending only rows
});

// redis out of the box does not have support for async/await so we have to use cb syntax
app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => res.send(values));
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  // cap the index size to prevent the fib calculation from taking too long
  if (parseInt(index) > 40) return res.status(422).send("Index too high");

  // Nothing yet is a placeholder for calculated value
  redisClient.hset("values", index, "Nothing yet!");
  redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

app.listen(5000, err => {
  if (err) return console.log("SERVER ERROR: ", err)
  console.log("listening on 5000");
})