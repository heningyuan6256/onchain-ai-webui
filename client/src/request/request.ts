import { extend, RequestOptionsInit } from 'umi-request';
import { message, notification } from 'antd';
import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

const refreshTokenApi = async () =>
  request('/backend/getnewtoken', {
    method: 'get',
    ignoreToken: true,
    headers: { Authorization: localStorage.getItem('refresh_token') || '' },
  });

const retryRequest = async (options: RequestOptionsInit) =>
  request(options.url!, {
    ...options,
    getResponse: true,
  });

export enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 4,
  REDIRECT = 9,
}

const request = extend({
  timeout: 10000,
  errorHandler: (error) => {
    const msg = error.message || 'Network error';
    if (error.name !== 'ResponseError') {
      message.error(msg);
      throw error;
    }

    message.error(msg);
    throw error;
  },
});

request.interceptors.request.use((url, options) => {
  // @ts-ignore
  window.resetTimeout && window.resetTimeout();

  const headers = (options.headers = options.headers || {});

  // @ts-ignore
  if (options.ignoreToken) return { url, options };

  headers['Authorization'] = localStorage.getItem('token') || '';
  console.log('看看请求前数据', { url, options });

  return { url, options };
});

request.interceptors.response.use(async (response, options) => {
  const { status } = response;

  if (status === 498) {
    message.error('登录已失效');
    history.replace('/login');
    localStorage.clear();
    return Promise.reject(new Error('Login expired'));
  }

  if (status === 403) {
    message.error('您没有权限访问该功能');
    history.replace('/system/admin/index');
    return Promise.reject(new Error('No permission'));
  }

  if (status === 401) {
    // 防止无限循环
    if (options.url?.includes('/refresh')) {
      history.replace('/login');
      return Promise.reject(new Error('Refresh failed'));
    }

    try {
      const refreshRes = await refreshTokenApi();
      if (refreshRes?.code !== 200) {
        // exitLogin();
        location.href = 'http://59.175.92.126:17778/login';
        //59.175.92.126:17778/backend/login
        http: return { code: 500, message: '请重新登录！' };
      }

      console.log('刷新token成功', refreshRes);
      localStorage.setItem('token', 'Bearer ' + refreshRes?.token);
      localStorage.setItem('refresh_token', 'Bearer ' + refreshRes?.refresh_token);
      if (refreshRes?.token_ragflow) {
        //预处理刷新ragflowtoken
        localStorage.setItem('token_ragflow', refreshRes?.token_ragflow);
      }

      // 重试原请求
      const retryRes = await retryRequest({
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${refreshRes?.token}` },
      });
      return retryRes;
    } catch (e) {
      message.error('请重新登录');
      history.replace('/login');
      localStorage.clear();
      return Promise.reject(e);
    }
  }

  return response;
});

export default request;
