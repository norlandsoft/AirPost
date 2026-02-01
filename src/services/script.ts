import { ApiRequest, ApiResponse, ScriptContext, TestResult, ScriptResult } from '../types';
import { getEnvironmentVariables } from './storage';
import { getGlobalVariables } from './globalVariable';

/**
 * 执行 Pre-request Script
 * 在发送请求前执行，可用于设置动态变量
 */
export async function executePreRequestScript(
  request: ApiRequest,
  response?: ApiResponse
): Promise<ScriptResult<Record<string, string>>> {
  if (!request.preRequestScript) {
    return { success: true, data: {} };
  }

  const logs: string[] = [];
  const context = createScriptContext(request, response);
  
  // 捕获控制台输出
  const consoleProxy = createConsoleProxy(logs);

  try {
    // 创建脚本执行环境
    const scriptFunc = new Function('pm', 'console', request.preRequestScript);
    
    // 执行脚本
    scriptFunc(context.pm, consoleProxy);
    
    // 提取设置的变量
    const variables = extractScriptVariables(context, logs);
    
    return {
      success: true,
      data: variables,
      logs,
    };
  } catch (error: any) {
    logs.push(`Error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      logs,
    };
  }
}

/**
 * 执行 Test Script
 * 在获取响应后执行，可用于断言验证
 */
export async function executeTestScript(
  request: ApiRequest,
  response: ApiResponse
): Promise<ScriptResult<TestResult[]>> {
  if (!request.testScript) {
    return { success: true, data: [] };
  }

  const logs: string[] = [];
  const testResults: TestResult[] = [];
  const context = createScriptContext(request, response);
  
  // 捕获控制台输出
  const consoleProxy = createConsoleProxy(logs);

  // 添加 test 函数
  const testFn = (name: string, fn: () => boolean) => {
    try {
      const passed = fn();
      testResults.push({
        name,
        status: passed ? 'passed' : 'failed',
        message: passed ? 'Passed' : 'Failed',
      });
    } catch (error: any) {
      testResults.push({
        name,
        status: 'failed',
        message: error.message,
      });
    }
  };

  // 创建 pm 对象
  const pm = {
    ...context.pm,
    test: testFn,
    expect: (actual: any) => ({
      to: null, be: null, been: null, is: null, that: null, which: null,
      and: null, have: null, with: null,
      equal: (expected: any) => ({ passed: actual === expected, message: `Expected ${actual} to equal ${expected}` }),
      eql: (expected: any) => ({ passed: JSON.stringify(actual) === JSON.stringify(expected), message: 'Objects equal' }),
      contain: (expected: any) => ({ passed: String(actual).includes(String(expected)), message: 'Contains value' }),
      includes: (expected: any) => ({ passed: String(actual).includes(String(expected)), message: 'Includes value' }),
      ok: () => ({ passed: Boolean(actual), message: 'Truthy check' }),
      true: () => ({ passed: actual === true, message: 'Equal to true' }),
      false: () => ({ passed: actual === false, message: 'Equal to false' }),
      null: () => ({ passed: actual === null, message: 'Equal to null' }),
      undefined: () => ({ passed: actual === undefined, message: 'Equal to undefined' }),
      exist: () => ({ passed: actual !== null && actual !== undefined, message: 'Exists' }),
      empty: () => ({ passed: actual === '' || (Array.isArray(actual) && actual.length === 0), message: 'Empty' }),
      lengthOf: (len: number) => ({ passed: actual && actual.length === len, message: `Length is ${len}` }),
      above: (num: number) => ({ passed: actual > num, message: `Above ${num}` }),
      below: (num: number) => ({ passed: actual < num, message: `Below ${num}` }),
      atLeast: (num: number) => ({ passed: actual >= num, message: `At least ${num}` }),
      atMost: (num: number) => ({ passed: actual <= num, message: `At most ${num}` }),
      property: (name: string) => ({ passed: actual && actual[name] !== undefined, message: `Has property "${name}"` }),
      a: (type: string) => ({ passed: typeof actual === type.toLowerCase(), message: `Type is ${type}` }),
      an: (type: string) => ({ passed: typeof actual === type.toLowerCase(), message: `Type is ${type}` }),
      instanceOf: (constructor: any) => ({ passed: actual instanceof constructor, message: `Instance of ${constructor.name}` }),
      throw: (error?: any) => ({ passed: false, message: 'Throws error' }),
      nested: () => ({}),
    } as any),
  };

  try {
    // 创建脚本执行环境
    const scriptFunc = new Function('pm', 'console', request.testScript);
    
    // 执行脚本
    scriptFunc(pm, consoleProxy);
    
    return {
      success: true,
      data: testResults,
      logs,
    };
  } catch (error: any) {
    logs.push(`Error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      logs,
    };
  }
}

/**
 * 创建脚本上下文
 */
function createScriptContext(request: ApiRequest, response?: ApiResponse): Partial<ScriptContext> {
  const envVars = getEnvironmentVariables();
  const globalVars = getGlobalVariables();

  // 解析请求体
  let requestBody: any = request.body;
  if (request.body && request.bodyType === 'json') {
    try {
      requestBody = JSON.parse(request.body);
    } catch {
      requestBody = request.body;
    }
  }

  // 构建请求头对象
  const requestHeaders: Record<string, string> = {};
  request.headers.forEach(h => {
    if (h.enabled && h.key) {
      requestHeaders[h.key] = h.value;
    }
  });

  // 存储变量的对象
  const envStorage: Record<string, string> = { ...envVars };
  const globalsStorage: Record<string, string> = { ...globalVars };

  return {
    request: {
      method: request.method,
      url: request.url,
      headers: requestHeaders,
      body: requestBody,
    },
    response: response ? {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body: response.data,
      time: response.time,
      size: response.size,
    } : undefined,
    environment: envVars,
    globals: globalVars,
    collectionVariables: {},
    pm: {
      request: {
        getUrl: () => request.url,
        getHeader: (key: string) => requestHeaders[key],
        setHeader: (key: string, value: string) => {
          requestHeaders[key] = value;
        },
        getBody: () => requestBody,
        setBody: (body: any) => {
          requestBody = body;
        },
      },
      response: {
        code: response?.status || 0,
        status: response?.statusText || '',
        headers: response?.headers || {},
        body: response?.data,
        time: response?.time || 0,
        size: response?.size || 0,
      },
      environment: {
        get: (key: string) => envStorage[key],
        set: (key: string, value: string) => {
          envStorage[key] = value;
        },
        unset: (key: string) => {
          delete envStorage[key];
        },
        toObject: () => ({ ...envStorage }),
      },
      globals: {
        get: (key: string) => globalsStorage[key],
        set: (key: string, value: string) => {
          globalsStorage[key] = value;
        },
        unset: (key: string) => {
          delete globalsStorage[key];
        },
        toObject: () => ({ ...globalsStorage }),
      },
      test: () => {},
      expect: (actual: any): any => ({}),
      variables: {
        get: (key: string) => envStorage[key] || globalsStorage[key],
        set: (key: string, value: string) => {
          envStorage[key] = value;
        },
        unset: (key: string) => {
          delete envStorage[key];
        },
      },
      info: {
        requestName: request.name,
        requestId: request.id,
      },
    },
    console: {
      log: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    },
  };
}

/**
 * 创建控制台代理
 */
function createConsoleProxy(logs: string[]): Console {
  const log = (...args: any[]) => {
    logs.push(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
  };

  return {
    log,
    info: log,
    warn: log,
    error: log,
    debug: log,
    table: log,
    group: log,
    groupEnd: log,
    time: log,
    timeEnd: log,
    clear: () => { logs.length = 0; },
    count: log,
    assert: (condition: boolean, ...args: any[]) => {
      if (!condition) {
        logs.push(`Assertion failed: ${args.join(' ')}`);
      }
    },
    dir: log,
    trace: log,
  } as any;
}

/**
 * 从脚本上下文中提取变量
 */
function extractScriptVariables(context: Partial<ScriptContext>, logs: string[]): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // 从 environment 中提取
  if (context.pm?.environment) {
    const env = context.pm.environment as any;
    if (env.toObject) {
      Object.assign(variables, env.toObject());
    }
  }
  
  return variables;
}

/**
 * 格式化脚本错误
 */
export function formatScriptError(error: string, script: string, lineNumber?: number): string {
  if (lineNumber) {
    return `Script Error at line ${lineNumber}: ${error}`;
  }
  return `Script Error: ${error}`;
}

/**
 * 验证脚本语法
 */
export function validateScriptSyntax(script: string): { valid: boolean; error?: string } {
  try {
    new Function(script);
    return { valid: true };
  } catch (error: any) {
    // 尝试提取行号
    const match = error.message.match(/at position (\d+)/);
    const position = match ? parseInt(match[1], 10) : undefined;
    
    let lineNumber: number | undefined;
    if (position && script.substring(0, position).includes('\n')) {
      lineNumber = script.substring(0, position).split('\n').length;
    }
    
    return {
      valid: false,
      error: formatScriptError(error.message, script, lineNumber),
    };
  }
}
