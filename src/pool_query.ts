import { Pool, PoolConnection } from 'mysql2';
import { Builder } from 'sql-easy-builder';
import debug from './debug';
import { Query } from './query';

export class PoolQuery {
  private _pool: Pool;

  constructor(pool: Pool) {
    this._pool = pool;
  }

  /**
   * 取得一个连接
   */
  getPoolConnection(): Promise<PoolConnection> {
    return new Promise((resolve, reject) => {
      if (debug.enabled) debug('getPoolConnection');
      this._pool.getConnection((err, connection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });
  }

  /**
   * 自动取得连接执行完 callback 后自动释放链接
   */
  async auto(callback: (query: Query) => Promise<any>) {
    const conn = await this.getPoolConnection();
    try {
      return await callback(new Query(conn));
    } finally {
      if (debug.enabled) debug('release[%o]', conn.threadId);
      conn.release();
    }
  }

  /**
   * 自动取得链接并执行查询，之后自动释放链接
   */
  query(arg0: string | ((builder: Builder) => void) | Builder, params?: any) {
    return this.auto(query => query.query(arg0, params));
  }

  /**
   * 自动取得链接并使用事务，之后自动释放链接
   */
  transaction(callback: (query: Query) => Promise<any>) {
    return this.auto(query => query.transaction(() => callback(query)));
  }
}
