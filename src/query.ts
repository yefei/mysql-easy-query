import { QueryOptions, Connection } from 'mysql2';
import debug from './debug';
import { Builder, JsonWhere, WhereType } from 'sql-easy-builder';
import { DataResult, QueryResult } from './types';

export class Query {
  private conn: Connection;

  constructor(conn: Connection) {
    this.conn = conn;
  }

  /**
   * SQL查询
   * @param sql 查询语句
   * @param params 参数
   */
  rawQuery(opt: QueryOptions): Promise<DataResult[] | DataResult | QueryResult> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      this.conn.query(opt, (error, results, fields) => {
        if (debug.enabled) debug('query[%o]: %o time: %oms', this.conn.threadId, opt, Date.now() - startTime);
        if (error) reject(error);
        else resolve(<any> results);
      });
    });
  }

  /**
   * 开启事务
   */
  beginTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      this.conn.beginTransaction(err => {
        if (debug.enabled) debug('beginTransaction[%o]: %oms', this.conn.threadId, Date.now() - startTime);
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * 提交事务
   */
  commit(): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      this.conn.commit(err => {
        if (debug.enabled) debug('commit[%o]: %oms', this.conn.threadId, Date.now() - startTime);
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * 回滚事务
   */
  rollback(): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      this.conn.rollback(() => {
        if (debug.enabled) debug('rollback[%o]: %oms', this.conn.threadId, Date.now() - startTime);
        resolve();
      });
    });
  }

  /**
   * 自动事务，process 执行无异常则 commit，否则 rollback 并抛出异常
   * @param process 事物之行函数
   */
  async transaction(process: () => Promise<void> | void) {
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

  builder() {
    return new Builder();
  }

  /**
   * 查询
   */
  async query(arg0: string | ((builder: Builder) => void) | Builder, params?: any): Promise<DataResult[] | DataResult | QueryResult> {
    if (typeof arg0 === 'string') {
      return this.rawQuery({ sql: arg0, values: params });
    }
    if (typeof arg0 === 'function') {
      var builder = this.builder();
      arg0(builder);
    } else {
      var builder = arg0;
    }
    const [sql, values] = builder.build();
    const res = await this.rawQuery({ sql, values, nestTables: builder.getNestTables() });
    if (builder.isOne() && Array.isArray(res)) {
      return res.length > 0 ? res[0] : null;
    }
    return res;
  }

  /**
   * 查询数量
   * @param table 表名
   * @param where 查询条件
   */
   async count(table: string, where: WhereType) {
    const res = <DataResult> await this.query(q => {
      q.count('*', 'c');
      q.from(table);
      where && q.where(where);
      q.setOne();
    });
    return <number> res['c'];
  }
}
