import sys
import os
sys.path.append(os.getcwd())

try:
    print("Testing generate...")
    from src.backend.api.v1 import generate
    print("Success")
    
    print("Testing predict...")
    from src.backend.api.v1 import predict
    print("Success")
    
    print("Testing rank...")
    from src.backend.api.v1 import rank
    print("Success")
    
    print("Testing lab...")
    from src.backend.api.v1 import lab
    print("Success")
    
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
