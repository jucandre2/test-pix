const http = require('http');

function withServer(app, handler) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      try {
        await handler(server);
        server.close(resolve);
      } catch (error) {
        server.close(() => reject(error));
      }
    });
  });
}

function requestJson(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const payload = body ? JSON.stringify(body) : null;

    const request = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: payload
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload)
            }
          : {}
      },
      (response) => {
        let raw = '';

        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          raw += chunk;
        });
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            body: raw ? JSON.parse(raw) : null
          });
        });
      }
    );

    request.on('error', reject);

    if (payload) {
      request.write(payload);
    }

    request.end();
  });
}

module.exports = {
  withServer,
  requestJson
};
