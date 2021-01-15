'use strict';

const mysql = require('mysql');
const { Query } = require('..');

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

const conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  database: 'test',
});

before(function() {
  return new Promise((resolve, reject) => {
    conn.connect(err => {
      if (err) return reject(err);
      resolve();
    });
  });
});

after(function() {
  return new Promise((resolve, reject) => {
    conn.end(err => {
      if (err) return reject(err);
      resolve();
    });
  });
});

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

  it('transaction', async function() {
    const q = new Query(conn);
    await q.transaction(async () => {
      await q.query(b => b.update('user', { age: 100 }).where({ id: 1 }));
    });
  });
});
