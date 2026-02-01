// API 请求类型
export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
  bodyType: BodyType;
  auth?: AuthConfig;
  collectionId?: string;
  folderId?: string;
  // Pre-request and Test scripts
  preRequestScript?: string;
  testScript?: string;
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

// API 响应类型
export interface ApiResponse {
  id: string;
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  size: number;
  time: number;
  contentType: string;
  createdAt: number;
  // Test results
  testResults?: TestResult[];
}

// Test result type
export interface TestResult {
  name: string;
  status: 'passed' | 'failed';
  message: string;
  expected?: string;
  actual?: string;
}

// Script execution context
export interface ScriptContext {
  // Request data
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: any;
  };
  // Response data
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    time: number;
    size: number;
  };
  // Environment variables
  environment: Record<string, string>;
  // Global variables
  globals: Record<string, string>;
  // Collection variables
  collectionVariables: Record<string, string>;
  // PM API (Postman-like)
  pm: {
    // Request
    request: {
      getUrl: () => string;
      getHeader: (key: string) => string | undefined;
      setHeader: (key: string, value: string) => void;
      getBody: () => any;
      setBody: (body: any) => void;
    };
    // Response
    response: {
      code: number;
      status: string;
      headers: Record<string, string>;
      body: any;
      time: number;
      size: number;
    };
    // Environment
    environment: {
      get: (key: string) => string | undefined;
      set: (key: string, value: string) => void;
      unset: (key: string) => void;
      toObject: () => Record<string, string>;
    };
    // Globals
    globals: {
      get: (key: string) => string | undefined;
      set: (key: string, value: string) => void;
      unset: (key: string) => void;
      toObject: () => Record<string, string>;
    };
    // Test results
    test: (name: string, fn: () => boolean) => void;
    // Assertions
    expect: (actual: any) => AssertionAPI;
    // Variables utility
    variables: {
      get: (key: string) => string | undefined;
      set: (key: string, value: string) => void;
      unset: (key: string) => void;
    };
    // Info
    info: {
      requestName: string;
      requestId: string;
    };
  };
  // Console for output
  console: {
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };
}

// Assertion API (similar to Chai/Postman)
export interface AssertionAPI {
  to: AssertionAPI;
  be: AssertionAPI;
  been: AssertionAPI;
  is: AssertionAPI;
  that: AssertionAPI;
  which: AssertionAPI;
  and: AssertionAPI;
  have: AssertionAPI;
  with: AssertionAPI;
  equal: (expected: any) => AssertionAPI;
  eql: (expected: any) => AssertionAPI;
  contain: (expected: any) => AssertionAPI;
  includes: (expected: any) => AssertionAPI;
  ok: () => AssertionAPI;
  true: () => AssertionAPI;
  false: () => AssertionAPI;
  null: () => AssertionAPI;
  undefined: () => AssertionAPI;
  exist: () => AssertionAPI;
  empty: () => AssertionAPI;
  lengthOf: (len: number) => AssertionAPI;
  above: (num: number) => AssertionAPI;
  below: (num: number) => AssertionAPI;
  atLeast: (num: number) => AssertionAPI;
  atMost: (num: number) => AssertionAPI;
  property: (name: string) => AssertionAPI;
  a: (type: string) => AssertionAPI;
  an: (type: string) => AssertionAPI;
  instanceOf: (constructor: any) => AssertionAPI;
  throw: (error?: any) => AssertionAPI;
  nested: () => AssertionAPI;
}

// Script execution result
export interface ScriptResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  logs?: string[];
}

// HTTP 方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// 请求体类型
export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

// Key-Value 键值对类型
export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

// Folder 类型
export interface Folder {
  id: string;
  name: string;
  description?: string;
  requests: ApiRequest[];
  createdAt: number;
  updatedAt: number;
}

// Collection 类型
export interface Collection {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  isPublic?: boolean;
  folders: Folder[];
  requests: ApiRequest[];
  auth?: AuthConfig;
  variables?: KeyValuePair[];
  createdAt: number;
  updatedAt: number;
}

// 认证配置类型
export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'oauth2' | 'aws-sig4';
  data: Record<string, any>;
}

// 环境变量类型
export interface Environment {
  id: string;
  name: string;
  values: KeyValuePair[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// 历史记录类型
export interface HistoryItem {
  id: string;
  request: ApiRequest;
  response?: ApiResponse;
  createdAt: number;
}

// 存储数据类型
export interface StorageData {
  collections: Collection[];
  environments: Environment[];
  history: HistoryItem[];
  activeEnvironmentId?: string;
  settings: AppSettings;
}

// 应用设置类型
export interface AppSettings {
  theme: 'light' | 'dark';
  requestTimeout: number;
  followRedirects: boolean;
  encodeUrl: boolean;
  showNetworkLog: boolean;
}

// HTTP 请求配置
export interface HttpRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  data?: any;
  timeout?: number;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

// HTTP 响应配置
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  size: number;
  time: number;
}
