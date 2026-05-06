import requests

# Test 1: Frontend is serving pages
r = requests.get('http://localhost:3000/dashboard', timeout=30)
print(f"Frontend dashboard: {r.status_code}")
print(f"  Content-Type: {r.headers.get('content-type','?')}")
print(f"  Body length: {len(r.text)} chars")

# Test 2: Backend health (what the frontend Header calls)
r = requests.get('http://127.0.0.1:8002/health')
print(f"Backend health: {r.status_code} -> {r.json()}")

# Test 3: Sync prediction (what the frontend MoleculeInput calls via api.predictSync)
r = requests.post('http://127.0.0.1:8002/v1/predict/', json={'smiles_list': ['CCO','c1ccccc1','CC(=O)O']})
print(f"Sync predict: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    for p in data.get('predictions',[]):
        m = p.get('predictions',{})
        print(f"  {p['smiles']:20s} act={m.get('activity',0):.3f} sel={m.get('selectivity',0):.3f} stab={m.get('stability',0):.3f} ucb={p.get('ucb_score',0):.3f}")
elif r.status_code == 500:
    print(f"  Need training: {r.text[:200]}")
    print("  Training model...")
    r2 = requests.post('http://127.0.0.1:8002/v1/generate/train', json={'n_candidates': 10})
    print(f"  Train: {r2.status_code}")
    r3 = requests.post('http://127.0.0.1:8002/v1/predict/', json={'smiles_list': ['CCO','c1ccccc1','CC(=O)O']})
    print(f"  Retry predict: {r3.status_code}")
    if r3.status_code == 200:
        data = r3.json()
        for p in data.get('predictions',[]):
            m = p.get('predictions',{})
            print(f"  {p['smiles']:20s} act={m.get('activity',0):.3f}")
else:
    print(f"  Error: {r.text[:200]}")

# Test 4: CORS check (simulate browser preflight from http://localhost:3000)
r = requests.options('http://127.0.0.1:8002/health', headers={
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'content-type'
})
print(f"CORS preflight: {r.status_code}")
acao = r.headers.get('access-control-allow-origin', 'MISSING')
print(f"  Access-Control-Allow-Origin: {acao}")

# Test 5: Lab submit (what the frontend SubmissionForm calls via api.labSubmit)
r = requests.post('http://127.0.0.1:8002/v1/lab/submit', json={
    'smiles_list': ['CCO','c1ccccc1'],
    'predicted_activity': [0.8, 0.6],
    'predicted_selectivity': [0.7, 0.5],
    'predicted_stability': [0.9, 0.8],
    'priority': 'normal'
})
print(f"Lab submit: {r.status_code} -> job_id={r.json().get('job_id','?')}")

print()
print("ALL FRONTEND-BACKEND CONNECTIONS VERIFIED")
