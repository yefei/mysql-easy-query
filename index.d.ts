import { Connection, Pool, PoolConnection, PoolCluster } from 'mysql';
import { Builder } from 'sql-easy-builder';
export { Builder, Where, Raw, raw, Op } from 'sql-easy-builder';

export declare function debug(formatter: any, ...args: any[]): void;

export type builderCallback = (b: Builder) => Builder;
export type queryType = string | Builder | builderCallback;

export declare class Query {
  constructor(conn: Connection);

  /**
   * SQL查询
   * @param sql SQL语句
   * @param params 查询参数
   */
  rawQuery(sql: string, params?: any): Promise<any>;

  /**
   * 开启事务
   */
  beginTransaction(): Promise<any>;

  /**
   * 提交事务
   */
  commit(): Promise<any>;

  /**
   * 回滚事务
   */
  rollback(): Promise<any>;

  /**
   * 自动事务，process 执行无异常则 commit，否则 rollback 并抛出异常
   * @param process 事务开启成功后回调
   */
  transaction<T>(process: () => T): Promise<T>;

  /**
   * 取得一个 Builder 实例
   */
  builder(): Builder;

  /**
   * 查询
   * @param arg0 可以使用SQL, Builder, 或 Builder 回调
   * @param params 查询参数，当使用SQL时有效
   */
  query(arg0: queryType, params?: any): Promise<any>;

  /**
   * 查询数量
   * @param table 表
   * @param where 查询条件
   */
  count(table: string, where?: any): Promise<number>;
}

export declare class PoolQuery {
  constructor(pool: Pool);

  /**
   * 取得一个连接
   */
  getPoolConnection(): Promise<PoolConnection>;

  /**
   * 自动取得连接执行完 callback 后自动释放链接
   * @param callback 取得连接后回调
   */
  auto<T>(callback: (query: Query) => T): Promise<T>;

  /**
   * 自动取得连接查询，查询完成后自动释放
   * @param arg0 可以使用SQL, Builder, 或 Builder 回调
   * @param params 查询参数，当使用SQL时有效
   */
  query(arg0: queryType, params?: any): Promise<any>;

  /**
   * 自动取得链接并使用事务，之后自动释放链接
   * @param callback 取得事务后回调
   */
  transaction<T>(callback: (query: Query) => T): Promise<T>;
}

export interface PoolClusterQueryOptions {
  pattern?: string;
  selector?: string;
}

export declare class PoolClusterQuery {
  constructor(pool: PoolCluster);

  /**
   * 取得一个连接
   * @param options 可选来链接池参数
   */
  getPoolConnection(options?: PoolClusterQueryOptions): Promise<PoolConnection>;

  /**
   * 自动取得连接执行完 callback 后自动释放链接
   * @param callback 取得连接后回调
   * @param options 可选来链接池参数
   */
  auto<T>(callback: (query: Query) => T, options?: PoolClusterQueryOptions): Promise<T>;

  /**
   * 自动取得连接查询，查询完成后自动释放
   * @param arg0 可以使用SQL, Builder, 或 Builder 回调
   * @param params 查询参数，当使用SQL时有效
   * @param options 可选来链接池参数
   */
  query(arg0: queryType, params?: any, options?: PoolClusterQueryOptions): Promise<any>;

  /**
   * 自动取得链接并使用事务，之后自动释放链接
   * @param callback 取得事务后回调
   * @param options 可选来链接池参数
   */
  transaction<T>(callback: (query: Query) => T, options?: PoolClusterQueryOptions): Promise<T>;
}
