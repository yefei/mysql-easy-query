const mysql = require('mysql');
const mysql2 = require('mysql2');
const { PoolQuery } = require('../dist');

const config = {
  host: '127.0.0.1',
  user: 'root',
  database: 'test',
  password: process.env.MYSQL_PASSWORD,
};

async function test(pool) {
  const poolQuery = new PoolQuery(pool);
  const s = Date.now();
  async function q() {
    for (let i = 0; i < 100; i++) {
      await poolQuery.query('SELECT * FROM user');
    }
  }
  await Promise.all([...Array(10)].map(q));
  return Date.now() - s;
}

const mysql1pool = mysql.createPool(config);
const mysql2pool = mysql2.createPool(config);

async function main() {
  let t1 = Number.MAX_VALUE;
  let t2 = Number.MAX_VALUE;
  for (let i=0; i<5; i++) {
    t1 = Math.min(t1, await test(mysql1pool));
    t2 = Math.min(t2, await test(mysql2pool));
  }
  console.log({ mysql: t1, mysql2: t2 });
}

main().then(() => {
}, e => {
  console.error(e);
}).finally(() => {
  process.exit();
});

// mysql1 mysql2 性能相差 40%
