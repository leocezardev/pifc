const http = require('http');

const data = JSON.stringify({
    sessionType: "chat",
    title: "Teste Conexao",
    initialMessage: "Olá"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/sessions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    },
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        if (body.trim().startsWith('<')) {
            console.log("HTML DETECTADO (Provavel erro 404/500 do Frontend)");
        } else {
            console.log("JSON RECEBIDO (Backend OK)");
            console.log(body.substring(0, 200));
        }
    });
});

req.on('error', (e) => {
    console.error(`ERRO: ${e.message}`);
});

req.write(data);
req.end();
