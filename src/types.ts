/**
 * 数据库更新插入删除等操作的返回结果
 */
 export interface QueryResult {
  /**
   * 数据库插入返回的主键值
   */
  insertId: number;

  /**
   * 更新产生的影响行数
   */
  affectedRows: number;
}

/**
 * 数据库结果类型
 */
 export type DataValue = string | number | boolean | Date;

 /**
  * 数据库查询结果对象
  */
 export type DataResult = { [column: string]: DataValue };
 