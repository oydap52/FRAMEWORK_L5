const http = require("http");
const EventEmitter = require("events");

class Framework {
  constructor() {
    this.server = this._createServer();
    this.emitter = new EventEmitter();
    this.middlewares = [];
  }

  listen(port, callback) {
    this.server.listen(port, callback);
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  addRouter(router) {
    Object.keys(router.endpoints).forEach((path) => {
      const endpoint = router.endpoints[path];
      Object.keys(endpoint).forEach((method) => {
        this.emitter.on(this._getRouteMask(path, method), (req, res) => {
          endpoint[method](req, res);
        });
      });
    });
  }

  _createServer() {
    return http.createServer((req, res) => {
      res.send = (data) => {
        if (!res.headersSent) {
          console.log(`Sending response: ${data}`);
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(data);
        }
      };

      res.json = (data) => {
        if (!res.headersSent) {
          console.log(`Sending JSON response: ${JSON.stringify(data)}`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(data));
        }
      };

      res.status = (code) => {
        if (!res.headersSent) {
          res.writeHead(code, { "Content-Type": "text/plain" });
        }
        return res;
      };

      const urlParts = req.url.split("?");
      const path = urlParts[0];
      req.query = urlParts[1] ? Object.fromEntries(new URLSearchParams(urlParts[1])) : {};

      req.params = {};
      if (path.includes(":")) {
        const pathParts = path.split("/");
        const route = this._findRoute(path);
        if (route) {
          const routeParts = route.split("/");
          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(":")) {
              req.params[routeParts[i].slice(1)] = pathParts[i];
            }
          }
        }
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        req.body = body ? JSON.parse(body || "{}") : {};

        this.middlewares.forEach((middleware) => {
          if (!res.headersSent) middleware(req, res);
        });

        const emitted = this.emitter.emit(
          this._getRouteMask(path, req.method),
          req,
          res
        );

        if (!emitted && !res.headersSent) {
          console.log("Route not found, sending 404");
          res.status(404).send("404 Not Found");
        }
      });
    });
  }

  _getRouteMask(path, method) {
    return `[${path}]:[${method}]`;
  }

  _findRoute(url) {
    const urlParts = url.split("/");
    for (const route of Object.keys(this.emitter._events)) {
      const routePath = route.split("]")[0].slice(1);
      const routeParts = routePath.split("/");
      if (routeParts.length === urlParts.length) {
        let match = true;
        for (let i = 0; i < routeParts.length; i++) {
          if (!routeParts[i].startsWith(":") && routeParts[i] !== urlParts[i]) {
            match = false;
            break;
          }
        }
        if (match) return routePath;
      }
    }
    return url;
  }
}

module.exports = Framework;