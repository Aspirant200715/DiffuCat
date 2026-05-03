import torch
p='data/raw/processed/dataset.pt'
obj=torch.load(p)
print('loaded type:', type(obj))
try:
    data, slices = obj
    print('data type:', type(data))
    print('slices keys:', list(slices.keys()))
    for k,v in slices.items():
        print(k, 'len:', len(v))
    if hasattr(data, 'z'):
        try:
            print('data.z size', data.z.size())
        except Exception as e:
            print('data.z access error', e)
except Exception as e:
    print('cannot unpack obj:', e)
    print('repr(obj)[:500]=', repr(obj)[:500])
