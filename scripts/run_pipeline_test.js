const http = require('http');
function post(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: '127.0.0.1',
      port: 8000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    console.log('Triggering training...');
    const t = await post('/v1/generate/train', { n_candidates: 6 });
    console.log('train', t.status, t.body);

    console.log('\nCalling predict...');
    const p = await post('/v1/predict/', { smiles_list: ['CCO', 'c1ccccc1'] });
    console.log('predict', p.status, p.body);
  } catch (e) {
    console.error('error', e);
    process.exit(1);
  }
})();
