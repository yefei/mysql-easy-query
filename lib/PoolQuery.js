'use strict';

const debug = require('./debug');
const Query = require('./Query');

class PoolQuery {
  /**
   * @param {import('mysql').Pool} pool 
   */
  constructor(pool) {
    this._pool = pool;
  }

  /**
   * 取得一个连接
   * @returns {import('mysql').PoolConnection}
   */
  getPoolConnection() {
    return new Promise((resolve, reject) => {
      debug('getPoolConnection');
      this._pool.getConnection((err, connection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });
  }

  /**
   * 自动取得连接执行完 callback 后自动释放链接
   * @param {function(Query)} callback
   * @returns {Promise<*>}
   */
  async auto(callback) {
    const conn = await this.getPoolConnection();
    try {
      return await callback(new Query(conn));
    } finally {
      debug('TID[%o]: release', conn.threadId);
      conn.release();
    }
  }

  /**
   * @param {function(import('sql-easy-builder'))|import('sql-easy-builder')|string} arg0
   * @returns {Promise<*>}
   */
  query(arg0, params) {
    return this.auto(query => query.query(arg0, params));
  }

  /**
   * 自动取得链接并使用事务，之后自动释放链接
   * @param {function(Query)} callback 
   * @returns {Promise<*>}
   */
  transaction(callback) {
    return this.auto(query => query.transaction(() => callback(query)));
  }
}

module.exports = PoolQuery;
