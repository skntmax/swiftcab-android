import { all_env } from '@/app/utils/env';

interface RequestHeaders {
  [key: string]: string;
}

class Router {
  basepath: string;

  constructor(base: string) {
    this.basepath = `${all_env.API_URL}/${base}`;
  }

  async get(url: string, headers: RequestHeaders = {}): Promise<any> {
    try {
      const response = await fetch(`${this.basepath}/${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, status: response.status, error: false };
    } catch (error: any) {
      console.error('GET request failed:', error);
      return { error: true, message: error.message, status: 500 };
    }
  }

  async post(url: string, model: any, headers: RequestHeaders = {}): Promise<any> {
    try {
      const response = await fetch(`${this.basepath}/${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(model),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, status: response.status, error: false };
    } catch (error: any) {
      console.error('POST request failed:', error);
      return { error: true, message: error.message, status: 500 };
    }
  }

  async put(url: string, model: any, headers: RequestHeaders = {}): Promise<any> {
    try {
      const response = await fetch(`${this.basepath}/${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(model),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, status: response.status, error: false };
    } catch (error: any) {
      console.error('PUT request failed:', error);
      return { error: true, message: error.message, status: 500 };
    }
  }

  async delete(url: string, headers: RequestHeaders = {}): Promise<any> {
    try {
      const response = await fetch(`${this.basepath}/${url}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, status: response.status, error: false };
    } catch (error: any) {
      console.error('DELETE request failed:', error);
      return { error: true, message: error.message, status: 500 };
    }
  }
}

const v1Router = new Router('v1');

export { Router, v1Router };

