# MySQL Easy Query

## install

```
npm i mysql-easy-query mysql sql-easy-builder
```

## example

### Query

```js
const mysql = require('mysql');
const { Query } = require('mysql-easy-query');

const conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
});

const q = new Query(conn);

// sql query
await q.query('SELECT * FROM user WHERE id = ?', [123]);

// builder callback query
await q.query(b => b.select().from('user').where({ id: 123 }));

// builder query
const builder = q.builder().select().from('user').where({ id: 123 });
await q.query(builder);

// count
await q.count('user', { age: 20 });

// auto transaction
await q.transaction(async () => {
  await q.query(b => b.update('user', { age: 100 }).where({ id: 1 }));
  await q.query(b => b.update('user', { age: 100 }).where({ id: 2 }));
  await q.query(b => b.update('user', { age: 100 }).where({ id: 3 }));
});
```

### PoolQuery

```js
const mysql = require('mysql');
const { PoolQuery } = require('mysql-easy-query');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
});

const poolQuery = new PoolQuery(pool);

// raw query
// auto get connect and auto release
await poolQuery.query('SELECT 1+1');

// auto transaction
// auto get connect and auto release
await poolQuery.transaction(async query => {
  await query.query(b => b.update('user', { age: 100 }).where({ id: 1 }));
});
```

Related projects:
[sql-easy-builder](https://github.com/yefei/sql-easy-builder)
