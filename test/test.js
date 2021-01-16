'use strict';

const assert = require('assert');
const mysql = require('mysql');
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
  password: 'yefei11',
  database: 'test',
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
  assert.deepStrictEqual(Object.assign({}, a), b);
}

describe('Query', function() {
  it('rawQuery', async function() {
    const q = new Query(conn);
    await q.rawQuery('SELECT 1+1 AS v');
  });

  it('query(raw sql)', async function() {
    const q = new Query(conn);
    await q.query('SELECT 1+1');
  });

  it('query(builder)', async function() {
    const q = new Query(conn);
    const b = q.builder();
    await q.query(b.select(b.raw('1+1')));
  });

  it('query(callback(builder))', async function() {
    const q = new Query(conn);
    await q.query(b => b.select(b.raw('1+1')));
  });

  it('one', async function() {
    const q = new Query(conn);
    eq(await q.query(b => b.select(b.raw('1+1')).one()), { '1+1': 2 });
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
    await poolQuery.query('SELECT 1+1');
  });

  it('query(builder)', async function() {
    const q = new Query(conn);
    const b = q.builder();
    b.select(b.raw('1+1'));
    await poolQuery.query(b);
  });

  it('query(callback(builder))', async function() {
    await poolQuery.query(b => b.select(b.raw('1+1')));
  });

  it('transaction', async function() {
    await poolQuery.transaction(async q => {
      await q.query(b => b.update('user', { age: 100 }).where({ id: 1 }));
    });
  });
});
