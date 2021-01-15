'use strict';

const mysql = require('mysql');
const Query = require('..');

const conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
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
});
