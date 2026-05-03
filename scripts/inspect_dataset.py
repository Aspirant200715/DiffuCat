import torch
p='data/raw/processed/dataset.pt'
obj = torch.load(p)
print('type(obj)=', type(obj))
if isinstance(obj, tuple):
    data, slices = obj
    print('data type', type(data))
    try:
        print('slices keys', list(slices.keys()))
        if 'z' in slices:
            print('num examples (z slice):', len(slices['z'])-1)
    except Exception as e:
        print('slices info error', e)
else:
    print('obj repr', repr(obj)[:200])
