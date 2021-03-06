/**
 * @typedef {import('mysql2').Connection} Connection
 */
'use strict';

const debug = require('./debug');
const { Builder } = require('sql-easy-builder');

class Query {
  /**
   * @param {Connection} conn 
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
        debug('query[%o]: %o time: %oms', this.conn.threadId, sql, Date.now() - startTime);
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
        debug('beginTransaction[%o]: %oms', this.conn.threadId, Date.now() - startTime);
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
        debug('commit[%o]: %oms', this.conn.threadId, Date.now() - startTime);
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
        debug('rollback[%o]: %oms', this.conn.threadId, Date.now() - startTime);
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * 自动事务，process 执行无异常则 commit，否则 rollback 并抛出异常
   * @param {function} process 
   */
  async transaction(process) {
    await this.beginTransaction();
    let res;
    try {
      res = await process();
    } catch (err) {
      await this.rollback();
      throw err;
    }
    await this.commit();
    return res;
  }

  /**
   * @returns {Builder}
   */
  builder() {
    return new Builder();
  }

  /**
   * 查询
   * @param {((b: Builder) => Builder)|Builder|string} arg0 Builder or callback(Builder) or sql string
   * @param {*} [params] sql string use
   * @returns {*[] | null}
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
      const [sql, params] = builder.build();
      const res = await this.rawQuery({ sql, nestTables: builder.getNestTables() }, params);
      if (builder.isOne()) {
        return res.length > 0 ? res[0] : null;
      }
      return res;
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
      q.setOne();
    });
    return res['c'];
  }
}

module.exports = Query;
