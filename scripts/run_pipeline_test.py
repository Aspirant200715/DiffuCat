import urllib.request, json, sys

def post(url, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return r.status, r.read().decode()

if __name__ == '__main__':
    base = 'http://127.0.0.1:8000'
    try:
        print('Triggering training...')
        status, body = post(f'{base}/v1/generate/train', {'n_candidates': 6})
        print('train status', status)
        print(body)
    except Exception as e:
        print('Training failed:', e)
        sys.exit(1)

    try:
        print('\nCalling predict...')
        status, body = post(f'{base}/v1/predict/', {'smiles_list': ['CCO', 'c1ccccc1']})
        print('predict status', status)
        print(body)
    except Exception as e:
        print('Predict failed:', e)
        sys.exit(2)
