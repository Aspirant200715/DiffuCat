import requests, time

BASE = 'http://127.0.0.1:8002'

print("--- Submitting to Lab ---")
r = requests.post(f"{BASE}/v1/lab/submit", json={
    "smiles_list": ["CCO", "c1ccccc1"],
    "predicted_activity": [0.8, 0.6],
    "predicted_selectivity": [0.7, 0.5],
    "predicted_stability": [0.9, 0.8],
    "priority": "normal"
})
print("Submit Status:", r.status_code)
job_id = r.json().get("job_id")
print("Job ID:", job_id)

print("\n--- Waiting for Lab Results ---")
for i in range(10):
    r = requests.get(f"{BASE}/v1/lab/status/{job_id}")
    status = r.json().get("status")
    print(f"Status: {status}")
    if status == "completed":
        break
    time.sleep(1)

print("\n--- Fetching Results ---")
r = requests.get(f"{BASE}/v1/lab/results/{job_id}")
print("Results fetched:", len(r.json()))

print("\n--- Triggering Retrain ---")
r = requests.post(f"{BASE}/v1/lab/retrain", json=[job_id])
print("Retrain Response:", r.json())

print("\nDONE")
