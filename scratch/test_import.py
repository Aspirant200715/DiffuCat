try:
    from src.backend.api.v1 import generate
    print("Generate router imported successfully")
except Exception as e:
    print(f"Failed to import generate router: {e}")
    import traceback
    traceback.print_exc()
