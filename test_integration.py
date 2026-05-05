import requests
import time
import sys

BASE = 'http://127.0.0.1:8002'

def print_step(msg):
    print(f"\n{'='*50}\n{msg}\n{'='*50}")

def check(res, expected=200):
    if res.status_code != expected:
        print(f"FAILED! Expected {expected}, got {res.status_code}")
        print(res.text)
        sys.exit(1)
    print("OK")
    return res.json()

# 1. Health
print_step("1. Checking API Health")
res = requests.get(f"{BASE}/health")
check(res)

# 2. Train Initial Model
print_step("2. Training Initial Model (Synthetic Data)")
res = requests.post(f"{BASE}/v1/generate/train", json={"n_candidates": 10})
check(res)

# 3. Generate Novel Candidates (Diffusion)
print_step("3. Generating Novel Candidates (Diffusion Model)")
res = requests.post(f"{BASE}/v1/generate/", json={"target_reaction": "default", "n_candidates": 3})
gen_data = check(res)
candidates = gen_data.get("candidates", [])
print(f"Generated: {candidates}")

if not candidates:
    print("No candidates generated!")
    sys.exit(1)

# 4. Async Prediction (Celery/Local fallback)
print_step("4. Async Prediction (Celery/Local Fallback)")
res = requests.post(f"{BASE}/v1/predict/submit", json={"smiles_list": candidates})
job_data = check(res)
pred_job_id = job_data["job_id"]
print(f"Prediction Job ID: {pred_job_id}")

# 5. Poll Prediction Status
print_step("5. Polling Prediction Status")
predictions = None
for _ in range(15):
    res = requests.get(f"{BASE}/v1/predict/status/{pred_job_id}")
    status_data = check(res)
    print(f"Status: {status_data['status']}")
    if status_data['status'] == "SUCCESS":
        predictions = status_data['result']['predictions']
        break
    time.sleep(1)

if not predictions:
    print("Prediction failed or timed out!")
    sys.exit(1)

# Prepare lab submission
print_step("6. Submitting to Lab Validation (Cloud DFT Engine)")
submit_payload = {
    "smiles_list": [p["smiles"] for p in predictions],
    "predicted_activity": [p["predictions"]["activity"] for p in predictions],
    "predicted_selectivity": [p["predictions"]["selectivity"] for p in predictions],
    "predicted_stability": [p["predictions"]["stability"] for p in predictions],
    "priority": "high"
}
res = requests.post(f"{BASE}/v1/lab/submit", json=submit_payload)
lab_job = check(res)
lab_job_id = lab_job["job_id"]
print(f"Lab Job ID: {lab_job_id}")

# 7. Poll Lab Status
print_step("7. Polling Lab Status")
for _ in range(15):
    res = requests.get(f"{BASE}/v1/lab/status/{lab_job_id}")
    status_data = check(res)
    print(f"Status: {status_data['status']}")
    if status_data['status'] == "completed":
        break
    time.sleep(1)

# 8. Fetch Lab Results
print_step("8. Fetching Lab Results (Cloud DFT Properties)")
res = requests.get(f"{BASE}/v1/lab/results/{lab_job_id}")
lab_results = check(res)
for r in lab_results:
    print(f"SMILES: {r['smiles']} | Activity: {r['activity']:.2f}")

# 9. Active Learning Loop Retrain
print_step("9. Triggering Active Learning Retraining")
res = requests.post(f"{BASE}/v1/lab/retrain", json=[lab_job_id])
check(res)

print_step("ALL SYSTEMS OPERATIONAL AND INTEGRATED!")
