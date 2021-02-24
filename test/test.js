'use strict';

require('dotenv').config();

const assert = require('assert');
const mysql = require('mysql2');
const { Query, PoolQuery } = require('..');

/*
CREATE DATABASE `test`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `age` int(11) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `user`(`name`, `age`) VALUES ('yefei', 30);
*/

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  database: 'test',
  password: process.env.MYSQL_PASSWORD,
});

let conn;

before(function() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      conn = connection;
      resolve();
    });
  });
});

after(function() {
  return new Promise((resolve, reject) => {
    pool.end(err => {
      if (err) return reject(err);
      resolve();
    });
  });
});

function eq(a, b) {
  assert.deepStrictEqual(Array.isArray(a) ? a.map(i => Object.assign({}, i)) : Object.assign({}, a), b);
}

describe('Query', function() {
  it('rawQuery', async function() {
    const q = new Query(conn);
    eq(await q.rawQuery('SELECT 1+1 AS v'), [{ v:2 }]);
  });

  it('query(raw sql)', async function() {
    const q = new Query(conn);
    eq(await q.query('SELECT 1+1'), [{'1+1':2}]);
  });

  it('query(builder)', async function() {
    const q = new Query(conn);
    const b = q.builder();
    eq(await q.query(b.select(b.raw('1+1'))), [{'1+1':2}]);
  });

  it('query(callback(builder))', async function() {
    const q = new Query(conn);
    eq(await q.query(b => b.select(b.raw('1+1'))), [{'1+1':2}]);
  });

  it('one', async function() {
    const q = new Query(conn);
    eq(await q.query(b => b.select(b.raw('1+1')).one()), { '1+1': 2 });
    assert.deepStrictEqual(await q.query(b => b.select().from('user').where({id:-1}).one()), null);
  });

  it('list', async function() {
    const q = new Query(conn);
    eq(await q.query(b => b.select().from('user').where({id:-1})), []);
  });

  it('count', async function() {
    const q = new Query(conn);
    assert.ok(typeof await q.count('user') === 'number');
  });

  it('transaction', async function() {
    const q = new Query(conn);
    await q.transaction(async () => {
      await q.query(b => b.update('user', { age: 100 }).where({ id: 1 }));
    });
  });
});

const poolQuery = new PoolQuery(pool);

describe('PoolQuery', function() {
  it('query(raw sql)', async function() {
    eq(await poolQuery.query('SELECT 1+1'), [{ '1+1': 2 }]);
  });

  it('query(builder)', async function() {
    const q = new Query(conn);
    const b = q.builder();
    b.select(b.raw('1+1'));
    eq(await poolQuery.query(b), [{ '1+1': 2 }]);
  });

  it('query(callback(builder))', async function() {
    eq(await poolQuery.query(b => b.select(b.raw('1+1'))), [{ '1+1': 2 }]);
  });

  it('transaction', async function() {
    await poolQuery.transaction(async q => {
      await q.query(b => b.update('user', { age: 100 }).where({ id: 1 }));
    });
  });

  it('benchmark', async function() {
    this.timeout(1000000);
    async function test() {
      for (let i = 0; i < 10000; i++) {
        await poolQuery.query('SELECT * FROM user');
      }
    }
    await Promise.all([...Array(20)].map(test));
  });
});
