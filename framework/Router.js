module.exports = class Router {
  constructor() {
    this.endpoints = {};
  }

  request(method = "GET", path, handler) {
    if (!this.endpoints[path]) {
      this.endpoints[path] = {};
    }
    const endpoint = this.endpoints[path];
    endpoint[method] = handler;
  }

  get(path, handler) {
    this.request("GET", path, handler);
  }

  post(path, handler) {
    this.request("POST", path, handler);
  }

  put(path, handler) {
    this.request("PUT", path, handler);
  }

  patch(path, handler) {
    this.request("PATCH", path, handler);
  }

  delete(path, handler) {
    this.request("DELETE", path, handler);
  }
};