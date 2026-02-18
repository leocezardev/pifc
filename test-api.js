const http = require('http');

console.log("Testando conexão com API na porta 5000...");

const data = JSON.stringify({
    sessionType: "chat",
    title: "Teste Script",
    initialMessage: "Olá, teste de API"
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
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('CORPO DA RESPOSTA:');
        console.log(body.substring(0, 500)); // Loga os primeiros 500 chars
        if (body.trim().startsWith('<')) {
            console.error("ERRO: A resposta parece ser HTML (provavelmente 404 ou 500 servido pelo frontend).");
            console.error("Isso indica que a rota da API não está registrada no servidor backend.");
        }
    });
});

req.on('error', (e) => {
    console.error(`ERRO DE REQUISIÇÃO: ${e.message}`);
    console.error("Verifique se o servidor backend está rodando na porta 5000.");
});

req.write(data);
req.end();
