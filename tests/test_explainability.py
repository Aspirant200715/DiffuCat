# tests/test_explainability.py
import pytest
import torch  # 🔑 CRITICAL: Required for torch.randn()
from rdkit import Chem
from src.services.explainability import (
    compute_synthetic_accessibility,
    generate_counterfactual_hint,
    extract_attention_hints
)

def test_sa_score_range():
    """Verify SA score stays in [1, 10] range."""
    mol_easy = Chem.MolFromSmiles("CCO")  # Ethanol
    mol_hard = Chem.MolFromSmiles("CC1=CC=CC=C1C2=CC=CC=C2C3=CC=CC=C3")  # Triphenylmethane
    
    assert 1.0 <= compute_synthetic_accessibility(mol_easy) <= 10.0
    assert 1.0 <= compute_synthetic_accessibility(mol_hard) <= 10.0
    # Harder molecule should have higher (worse) SA score
    assert compute_synthetic_accessibility(mol_hard) >= compute_synthetic_accessibility(mol_easy)

def test_counterfactual_hint_format():
    """Verify hints are human-readable strings."""
    mol = Chem.MolFromSmiles("CCO")
    hint = generate_counterfactual_hint(mol, "activity", "increase")
    assert isinstance(hint, str)
    assert len(hint) > 10  # Not a trivial response

def test_attention_hints_shape():
    """Verify attention extraction returns valid structure."""
    # Simulate atom features for 5 atoms
    features = torch.randn(5, 64)  # 🔑 Uses torch, so import is required
    hints = extract_attention_hints(features)
    
    assert len(hints) <= 3  # Top-3
    assert all("atom_index" in h and "importance" in h for h in hints)
    assert all(0 <= h["atom_index"] < 5 for h in hints)