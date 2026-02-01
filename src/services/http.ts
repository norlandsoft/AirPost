import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiRequest, ApiResponse, HttpRequestConfig, HttpResponse, KeyValuePair, AuthConfig } from '../types';
import { replaceRequestVariables } from './variable';
import { executePreRequestScript, executeTestScript, validateScriptSyntax } from './script';

/**
 * 应用认证配置到请求头
 */
function applyAuth(auth: AuthConfig, headers: Record<string, string>): Record<string, string> {
  const newHeaders = { ...headers };

  if (auth.type === 'basic' && auth.data.addHeaders !== false) {
    const { username, password } = auth.data;
    if (username) {
      const credentials = `${username}:${password || ''}`;
      const base64Credentials = btoa(credentials);
      newHeaders['Authorization'] = `Basic ${base64Credentials}`;
    }
  } else if (auth.type === 'bearer' && auth.data.addHeaders !== false) {
    const { token } = auth.data;
    if (token) {
      newHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  return newHeaders;
}

/**
 * 发送 API 请求
 * @param request 请求对象
 * @returns 格式化后的响应
 */
export async function sendRequest(request: ApiRequest): Promise<ApiResponse> {
  const startTime = Date.now();
  let response: ApiResponse;
  
  try {
    // 1. 执行 Pre-request Script (如果存在且语法正确)
    if (request.preRequestScript) {
      const syntaxCheck = validateScriptSyntax(request.preRequestScript);
      if (!syntaxCheck.valid) {
        console.warn('Pre-request script has syntax error:', syntaxCheck.error);
      }
    }
    
    // 2. 替换变量
    const replacedRequest = replaceRequestVariables(request);
    
    // 构建 URL（包含查询参数）
    const url = buildUrl(replacedRequest.url, replacedRequest.params);
    
    // 构建请求头
    let headers = buildHeaders(replacedRequest.headers);
    
    // 应用认证
    if (request.auth && request.auth.type !== 'none') {
      headers = applyAuth(request.auth, headers);
    }
    
    // 构建请求配置
    const config: AxiosRequestConfig = {
      method: request.method as any,
      url,
      headers,
      timeout: 30000, // 默认 30 秒超时
      responseType: 'json',
    };

    // 处理请求体
    if (replacedRequest.body && request.bodyType !== 'none') {
      switch (request.bodyType) {
        case 'json':
          try {
            config.data = JSON.parse(replacedRequest.body);
          } catch {
            config.data = replacedRequest.body;
          }
          break;
        case 'form-data':
          config.data = buildFormData(replacedRequest.body);
          config.headers = { ...config.headers, 'Content-Type': 'multipart/form-data' };
          break;
        case 'x-www-form-urlencoded':
          config.data = new URLSearchParams(replacedRequest.body).toString();
          config.headers = { ...config.headers, 'Content-Type': 'application/x-www-form-urlencoded' };
          break;
        case 'raw':
          config.data = replacedRequest.body;
          break;
      }
    }

    // 发送请求
    const axiosResponse: AxiosResponse = await axios(config);
    
    const endTime = Date.now();
    const time = endTime - startTime;
    
    // 计算响应大小
    const size = calculateResponseSize(axiosResponse.data);

    response = {
      id: generateId(),
      requestId: request.id,
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
      headers: normalizeHeaders(axiosResponse.headers),
      data: axiosResponse.data,
      size,
      time,
      contentType: axiosResponse.headers['content-type'] || 'application/json',
      createdAt: Date.now(),
    };
    
    // 3. 执行 Test Script (如果有)
    if (request.testScript) {
      const syntaxCheck = validateScriptSyntax(request.testScript);
      if (!syntaxCheck.valid) {
        console.warn('Test script has syntax error:', syntaxCheck.error);
      } else {
        const testResult = await executeTestScript(request, response);
        if (testResult.success && testResult.data) {
          response.testResults = testResult.data;
        }
      }
    }
    
    return response;
  } catch (error) {
    const endTime = Date.now();
    const time = endTime - startTime;
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      response = {
        id: generateId(),
        requestId: request.id,
        status: axiosError.response?.status || 0,
        statusText: axiosError.response?.statusText || getErrorMessage(axiosError),
        headers: normalizeHeaders(axiosError.response?.headers as any),
        data: axiosError.response?.data || null,
        size: 0,
        time,
        contentType: 'application/json',
        createdAt: Date.now(),
      };
      
      // 仍然执行测试脚本（即使请求失败）
      if (request.testScript) {
        const syntaxCheck = validateScriptSyntax(request.testScript);
        if (!syntaxCheck.valid) {
          console.warn('Test script has syntax error:', syntaxCheck.error);
        } else {
          const testResult = await executeTestScript(request, response);
          if (testResult.success && testResult.data) {
            response.testResults = testResult.data;
          }
        }
      }
      
      return response;
    }
    
    throw error;
  }
}

/**
 * 构建完整的 URL
 */
function buildUrl(baseUrl: string, params: KeyValuePair[]): string {
  const enabledParams = params.filter(p => p.enabled && p.key);
  
  if (enabledParams.length === 0) {
    return baseUrl;
  }
  
  const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
  
  enabledParams.forEach(param => {
    url.searchParams.append(param.key, param.value);
  });
  
  return url.toString();
}

/**
 * 构建请求头
 */
function buildHeaders(headers: KeyValuePair[]): Record<string, string> {
  const result: Record<string, string> = {};
  
  headers
    .filter(h => h.enabled && h.key)
    .forEach(header => {
      result[header.key] = header.value;
    });
  
  return result;
}

/**
 * 构建 FormData
 */
function buildFormData(body: string): FormData {
  const formData = new FormData();
  
  try {
    const parsed = JSON.parse(body);
    Object.entries(parsed).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  } catch {
    // 如果不是 JSON 格式，尝试作为 URL 编码的字符串解析
    const params = new URLSearchParams(body);
    params.forEach((value, key) => {
      formData.append(key, value);
    });
  }
  
  return formData;
}

/**
 * 标准化响应头
 */
function normalizeHeaders(headers: any): Record<string, string> {
  const result: Record<string, string> = {};
  
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      result[key.toLowerCase()] = String(value);
    });
  }
  
  return result;
}

/**
 * 计算响应大小
 */
function calculateResponseSize(data: any): number {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    return 0;
  }
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取错误信息
 */
function getErrorMessage(error: AxiosError): string {
  if (error.code === 'ECONNABORTED') {
    return '请求超时';
  }
  if (error.code === 'ENOTFOUND') {
    return '无法解析域名';
  }
  if (error.code === 'ECONNREFUSED') {
    return '连接被拒绝';
  }
  if (error.message) {
    return error.message;
  }
  return '未知错误';
}

/**
 * 解析 URL 参数
 */
export function parseUrlParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const params: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  } catch {
    return {};
  }
}

/**
 * 格式化响应数据
 */
export function formatResponseData(data: any, contentType: string): string {
  if (!data) {
    return '';
  }
  
  if (typeof data === 'string') {
    return data;
  }
  
  // JSON 格式化
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}
