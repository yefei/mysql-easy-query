import { PoolCluster, PoolConnection } from "mysql2";
import { Builder } from "sql-easy-builder";
import debug from './debug';
import { Query } from './query';

export interface PoolClusterOption {
  pattern?: string;

  /**
   * 选择方式
   * @default 'RR'
   */
  selector?: 'RR' | 'RANDOM' | 'ORDER';
}

export class PoolClusterQuery {
  private _pool: PoolCluster;

  constructor(pool: PoolCluster) {
    this._pool = pool;
  }

  /**
   * 取得一个连接
   */
  getPoolConnection(options: PoolClusterOption): Promise<PoolConnection> {
    options = options || {};
    return new Promise((resolve, reject) => {
      if (debug.enabled) debug('getPoolConnection(%o)', options);
      this._pool.getConnection(options.pattern, options.selector, (err, connection: PoolConnection) => {
        if (err) return reject(err);
        resolve(connection);
      });
    });
  }

  /**
   * 自动取得连接执行完 callback 后自动释放链接
   */
  async auto(callback: (query: Query) => Promise<any>, options?: PoolClusterOption) {
    const conn = await this.getPoolConnection(options);
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
  query(arg0: string | ((builder: Builder) => void) | Builder, params?: any, options?: PoolClusterOption) {
    return this.auto(query => query.query(arg0, params), options);
  }

  /**
   * 自动取得链接并使用事务，之后自动释放链接
   */
  transaction(callback: (query: Query) => Promise<any>, options?: PoolClusterOption) {
    return this.auto(query => query.transaction(() => callback(query)), options);
  }
}
