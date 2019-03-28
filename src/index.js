/* @flow */
const port = 8081;
const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

http.createServer(function(request, response) {
    const parsedUrl = url.parse(request.url, true);
    let pathname = parsedUrl.pathname;

    console.log(`Got ${pathname || ''}`);

    if(pathname === "/events") {
        response.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*"
        });

        const padding = new Array(2049);
        response.write(":" + padding.join(" ") + "\n"); // 2kb padding
        response.write("retry: 2000\n");

        const lastEventId: number = Number(request.headers["last-event-id"]) || 0;
        let timeoutId;
        let i = lastEventId;
        const maxCount = i + 10;

        function f() {
            if(++i < maxCount) {
                response.write("id: " + i + "\n");
                response.write("data: " + i + "\n\n");
                timeoutId = setTimeout(f, 1000);
            } else {
                response.end();
            }
        }

        f();

        response.on('close', () => clearTimeout(timeoutId));
    }
    else {
        if(pathname === "/") {
            pathname = "/index.html";
        }
        if(pathname === "/index.html") {
            response.writeHead(200, {
                "Content-Type": "text/html"
            });

            response.write(fs.readFileSync(__dirname + pathname));
        }
        if(pathname === "/eventsource.js") {
            response.writeHead(200, {
                "Content-Type": "text/javascript"
            });

            response.write(fs.readFileSync(path.resolve(__dirname, "../node_modules/event-source-polyfill/src/eventsource.min.js")));
        }

        response.end();
    }
}).listen(port, () => {
    console.log(`WebServer listening on port ${port}...`);
});