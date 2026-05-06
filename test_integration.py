import requests
import time
import sys

BASE = 'http://127.0.0.1:8002'

def step(msg):
    print(f"\n{'='*60}\n  {msg}\n{'='*60}")

def ok(res, expected=200):
    if res.status_code != expected:
        print(f"  FAIL! Expected {expected}, got {res.status_code}")
        print(f"  {res.text[:500]}")
        sys.exit(1)
    print(f"  PASS ({res.status_code})")
    return res.json()

# ──────────────────────────────────────────────────────────
step("1/9  Health Check")
data = ok(requests.get(f"{BASE}/health"))
print(f"  Version: {data.get('version')}")

# ──────────────────────────────────────────────────────────
step("2/9  Train Pipeline (synthetic data)")
data = ok(requests.post(f"{BASE}/v1/generate/train", json={"n_candidates": 10}))
print(f"  Status: {data.get('status')}, Processed: {data.get('candidates_processed')}")

# ──────────────────────────────────────────────────────────
step("3/9  Synchronous Prediction (the endpoint the frontend calls)")
data = ok(requests.post(f"{BASE}/v1/predict/", json={"smiles_list": ["CCO", "c1ccccc1", "CC(=O)O"]}))
preds = data.get("predictions", [])
print(f"  Got {len(preds)} predictions")
for p in preds:
    m = p.get("predictions", {})
    print(f"    {p['smiles']:20s}  act={m.get('activity',0):.3f}  sel={m.get('selectivity',0):.3f}  stab={m.get('stability',0):.3f}  ucb={p.get('ucb_score',0):.3f}  pareto={p.get('pareto_optimal')}")

# ──────────────────────────────────────────────────────────
step("4/9  Async Prediction (submit + poll)")
data = ok(requests.post(f"{BASE}/v1/predict/submit", json={"smiles_list": ["CCO", "c1ccccc1"]}))
job_id = data["job_id"]
print(f"  Job ID: {job_id}")

for _ in range(15):
    time.sleep(1)
    data = ok(requests.get(f"{BASE}/v1/predict/status/{job_id}"))
    print(f"  Status: {data['status']}")
    if data["status"] == "SUCCESS":
        print(f"  Got {len(data.get('result',{}).get('predictions',[]))} predictions")
        break

# ──────────────────────────────────────────────────────────
step("5/9  Generate Novel Candidates (Diffusion)")
data = ok(requests.post(f"{BASE}/v1/generate/", json={"target_reaction": "default", "n_candidates": 3}))
cands = data.get("candidates", [])
print(f"  Generated: {cands}")

# ──────────────────────────────────────────────────────────
step("6/9  Lab Submit (Cloud DFT)")
data = ok(requests.post(f"{BASE}/v1/lab/submit", json={
    "smiles_list": ["CCO", "c1ccccc1"],
    "predicted_activity": [0.8, 0.6],
    "predicted_selectivity": [0.7, 0.5],
    "predicted_stability": [0.9, 0.8],
    "priority": "normal"
}))
lab_job = data["job_id"]
print(f"  Lab Job ID: {lab_job}")

# ──────────────────────────────────────────────────────────
step("7/9  Lab Status Poll")
for _ in range(10):
    time.sleep(1)
    data = ok(requests.get(f"{BASE}/v1/lab/status/{lab_job}"))
    print(f"  Status: {data['status']}")
    if data["status"] == "completed":
        break

# ──────────────────────────────────────────────────────────
step("8/9  Lab Results")
data = ok(requests.get(f"{BASE}/v1/lab/results/{lab_job}"))
print(f"  Got {len(data)} results")
for r in data:
    print(f"    {r['smiles']:20s}  act={r['activity']:.3f}  notes={r['notes'][:50]}")

# ──────────────────────────────────────────────────────────
step("9/9  Active Learning Retrain")
data = ok(requests.post(f"{BASE}/v1/lab/retrain", json=[lab_job]))
print(f"  {data.get('message')}")

step("ALL 9 TESTS PASSED -- PIPELINE FULLY OPERATIONAL")
