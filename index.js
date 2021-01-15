'use strict';

const debug = require('debug')('mysql-easy-query');
const Builder = require('sql-easy-builder');

class Query {
  /**
   * @param {import('mysql').Connection} conn 
   */
  constructor(conn) {
    this.conn = conn;
  }

  /**
   * SQL查询
   * @param {string} sql 查询语句
   * @param {*} [params] 参数
   */
  rawQuery(sql, params) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      this.conn.query(sql, params, (error, results, fields) => {
        debug('TID[%o]: %o %o %oms', this.conn.threadId, sql, params, Date.now() - startTime);
        if (error) reject(error);
        else resolve(results);
      });
    });
  }

  /**
   * 开启事务
   */
  beginTransaction() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      this.conn.beginTransaction(err => {
        debug('TID[%o]: beginTransaction %oms', this.conn.threadId, Date.now() - startTime);
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * 提交事务
   */
  commit() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      this.conn.commit(err => {
        debug('TID[%o]: commit %oms', this.conn.threadId, Date.now() - startTime);
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * 回滚事务
   */
  rollback() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      this.conn.rollback(err => {
        debug('TID[%o]: rollback %oms', this.conn.threadId, Date.now() - startTime);
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * @returns {Builder}
   */
  builder() {
    return new Builder();
  }

  /**
   * 查询
   * @param {function(Builder)|Builder|string} arg0 Builder or callback(Builder) or sql string
   * @param {*} [params] sql string use
   * @returns {*}
   */
  async query(arg0, params) {
    if (typeof arg0 === 'string') {
      return this.rawQuery(arg0, params);
    }
    let builder = arg0;
    if (typeof arg0 === 'function') {
      builder = this.builder();
      await arg0(builder);
    }
    if (builder instanceof Builder) {
      return this.rawQuery(...builder.build());
    }
    throw new Error('unknown arg0 type');
  }

  /**
   * 查询数量
   * @param {string} table 表名
   * @param {object} where 查询条件
   * @returns {Promise<number>}
   */
  async count(table, where) {
    const res = await this.query(q => {
      q.count('*', 'c');
      q.from(table);
      where && q.where(where);
    });
    return res[0]['c'];
  }
}

module.exports = Query;
module.exports.debug = debug;
