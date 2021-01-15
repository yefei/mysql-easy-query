'use strict';

const debug = require('./debug');
const Query = require('./Query');

class PoolClusterQuery {
  /**
   * @param {import('mysql').PoolCluster} pool 
   */
  constructor(pool) {
    this._pool = pool;
  }

  /**
   * 取得一个连接
   * @param {object} [options]
   * @param {string} [options.pattern]
   * @param {string} [options.selector]
   * @returns {import('mysql').PoolConnection}
   */
  getPoolConnection(options) {
    options = options || {};
    return new Promise((resolve, reject) => {
      debug('getPoolConnection(%o)', options);
      this._pool.getConnection(options.pattern, options.selector, (err, connection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });
  }

  /**
   * 自动取得连接执行完 callback 后自动释放链接
   * @param {function(Query)} callback
   * @param {*} [options]
   * @returns {Promise<*>}
   */
  async auto(callback, options) {
    const conn = await this.getPoolConnection(options);
    try {
      return await callback(new Query(conn));
    } finally {
      debug('TID[%o]: release', conn.threadId);
      conn.release();
    }
  }

  /**
   * @param {function(import('sql-easy-builder'))|import('sql-easy-builder')|string} arg0
   * @param {*} [options]
   * @returns {Promise<*>}
   */
  query(arg0, params, options) {
    return this.auto(query => query.query(arg0, params), options);
  }

  /**
   * 自动取得链接并使用事务，之后自动释放链接
   * @param {function(Query)} callback
   * @param {*} [options]
   * @returns {Promise<*>}
   */
  transaction(callback, options) {
    return this.auto(query => query.transaction(() => callback(query)), options);
  }
}

module.exports = PoolClusterQuery;
