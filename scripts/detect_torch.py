import torch
cuda = torch.version.cuda or 'cpu'
tag = ('cpu' if cuda == 'cpu' else 'cu' + cuda.replace('.', ''))
print(torch.__version__)
print(cuda)
print(tag)
