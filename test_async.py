import requests, json, time
BASE = 'http://127.0.0.1:8002'

print('--- Submitting Prediction Task ---')
r = requests.post(f'{BASE}/v1/predict/submit', json={'smiles_list': ['CCO', 'c1ccccc1']})
print(r.status_code)
data = r.json()
print(data)

job_id = data.get('job_id')
if job_id:
    for i in range(5):
        print(f'\n--- Checking Task Status for {job_id} ---')
        r = requests.get(f'{BASE}/v1/predict/status/{job_id}')
        print(r.status_code)
        status_data = r.json()
        print(status_data)
        if status_data.get('status') == 'SUCCESS':
            break
        time.sleep(1)
