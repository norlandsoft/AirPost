import { ApiRequest, KeyValuePair, HttpMethod, BodyType, Environment, Collection } from '../types';
import { getActiveEnvironment } from '../services/storage';

/**
 * 获取全局变量（内置变量）
 */
export function getGlobalVariables(): Record<string, string> {
  const now = new Date();
  
  return {
    // 时间相关
    $timestamp: String(Math.floor(now.getTime() / 1000)),
    $isoTimestamp: now.toISOString(),
    $year: String(now.getFullYear()),
    $month: String(now.getMonth() + 1).padStart(2, '0'),
    $day: String(now.getDate()).padStart(2, '0'),
    $hour: String(now.getHours()).padStart(2, '0'),
    $minute: String(now.getMinutes()).padStart(2, '0'),
    $second: String(now.getSeconds()).padStart(2, '0'),
    $millisecond: String(now.getMilliseconds()),
    
    // UUID
    $guid: generateGuid(),
    $randomUUID: generateGuid(),
    
    // 随机数
    $randomInt: String(Math.floor(Math.random() * 10000)),
  };
}

/**
 * 生成 GUID
 */
function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
