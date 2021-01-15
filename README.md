# MySQL Easy Query

## install

```
npm i mysql-easy-query mysql
```

## example

```js
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
```
