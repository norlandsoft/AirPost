import { KeyValuePair } from '../types';
import { getEnvironmentVariables } from '../services/storage';
import { getGlobalVariables } from './globalVariable';

/**
 * 替换字符串中的变量占位符
 * @param str 原始字符串
 * @param variables 变量映射
 * @returns 替换后的字符串
 */
export function replaceVariables(str: string, variables?: Record<string, string>): string {
  if (!str) return str;

  let result = str;
  
  // 获取环境变量
  const envVars = getEnvironmentVariables();
  
  // 合并变量（环境变量优先）
  const allVars = {
    ...envVars,
    ...variables,
  };

  // 替换 {{variableName}} 格式
  const regex = /\{\{([^}]+)\}\}/g;
  result = result.replace(regex, (match, varName) => {
    const key = varName.trim();
    if (allVars[key] !== undefined) {
      return allVars[key];
    }
    return match; // 如果变量不存在，保留原样
  });

  return result;
}

/**
 * 替换请求中的所有变量
 */
export function replaceRequestVariables(request: {
  url: string;
  headers?: KeyValuePair[];
  params?: KeyValuePair[];
  body?: string;
}): {
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
} {
  return {
    url: replaceVariables(request.url),
    headers: (request.headers || []).map(h => ({
      ...h,
      key: replaceVariables(h.key),
      value: replaceVariables(h.value),
    })),
    params: (request.params || []).map(p => ({
      ...p,
      key: replaceVariables(p.key),
      value: replaceVariables(p.value),
    })),
    body: replaceVariables(request.body || ''),
  };
}

/**
 * 获取所有可用变量
 */
export function getAllVariables(): Record<string, string> {
  return getEnvironmentVariables();
}

/**
 * 检查字符串是否包含变量
 */
export function containsVariables(str: string): boolean {
  if (!str) return false;
  return /\{\{[^}]+\}\}/.test(str);
}

/**
 * 从字符串中提取所有变量名
 */
export function extractVariables(str: string): string[] {
  if (!str) return [];
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = str.matchAll(regex);
  const variables: string[] = [];
  for (const match of matches) {
    const varName = match[1].trim();
    if (!variables.includes(varName)) {
      variables.push(varName);
    }
  }
  return variables;
}
