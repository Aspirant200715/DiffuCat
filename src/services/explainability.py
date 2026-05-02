# src/services/explainability.py
import torch
import numpy as np
from rdkit import Chem
from rdkit.Chem import rdMolDescriptors
from typing import Optional, List, Dict  # ✅ Added Dict to imports
from src.core.logger import setup_logger

logger = setup_logger("services.explainability")

def compute_synthetic_accessibility(mol: Chem.Mol) -> float:
    """
    Estimate synthesis difficulty on 1-10 scale (1=easy, 10=hard).
    
    Simplified heuristic based on:
    - Ring complexity
    - Chiral centers
    - Rare fragments
    - Molecular weight
    
    Production: Replace with SA Score from Ertl & Schuffenhauer (2009)
    """
    if mol is None:
        return 10.0
    
    score = 1.0  # Start with easy
    
    # Penalize large molecules
    mw = rdMolDescriptors.CalcExactMolWt(mol)
    if mw > 500:
        score += min(3.0, (mw - 500) / 100)
    
    # Penalize complex ring systems
    rings = Chem.GetSymmSSSR(mol)
    for ring in rings:
        if len(ring) > 6:  # Large rings are harder
            score += 0.5
        if len(ring) < 5:  # Small strained rings
            score += 0.3
    
    # Penalize chirality
    chiral_centers = len(Chem.FindMolChiralCenters(mol, includeUnassigned=True))
    score += min(2.0, chiral_centers * 0.4)
    
    # Penalize rare elements (precious metals = hard)
    rare_elements = {44, 45, 46, 77, 78, 79}  # Ru, Rh, Pd, Ir, Pt, Au
    for atom in mol.GetAtoms():
        if atom.GetAtomicNum() in rare_elements:
            score += 1.5
    
    return min(10.0, max(1.0, score))


def generate_counterfactual_hint(
    mol: Chem.Mol,
    target_property: str,
    direction: str = "increase"
) -> str:
    """
    Generate human-readable suggestion for improving a property.
    
    Example: "Replacing aromatic C with N may increase CO₂ binding affinity"
    
    Production: Integrate with GNN attention or SHAP values for causal hints
    """
    hints = {
        "activity": {
            "increase": [
                "Add electron-donating groups near active site",
                "Increase metal coordination flexibility",
                "Introduce hydrogen-bond donors for substrate binding"
            ],
            "decrease": [
                "Add steric bulk near active site",
                "Reduce conjugation in ligand framework"
            ]
        },
        "selectivity": {
            "increase": [
                "Introduce chiral centers for enantioselectivity",
                "Add shape-complementary pockets for target substrate"
            ],
            "decrease": [
                "Simplify ligand geometry",
                "Remove stereocenters"
            ]
        },
        "stability": {
            "increase": [
                "Replace labile bonds (esters, anhydrides) with robust alternatives",
                "Add electron-withdrawing groups to reduce oxidation"
            ],
            "decrease": [
                "Introduce hydrolyzable linkages for biodegradability"
            ]
        }
    }
    
    options = hints.get(target_property, {}).get(direction, ["No specific hint available"])
    return np.random.choice(options)  # Random selection for demo; production: rank by impact


def extract_attention_hints(
    atom_features: torch.Tensor,
    prediction_gradient: Optional[torch.Tensor] = None
) -> List[Dict]:  # ✅ Dict is now imported
    """
    Identify atoms contributing most to a prediction.
    
    Production: Use GNN attention weights or integrated gradients.
    MVP: Simplified heuristic based on feature magnitude.
    """
    if prediction_gradient is None:
        # Fallback: rank atoms by feature norm
        importance = torch.norm(atom_features, dim=1)
    else:
        # Use gradient * feature as saliency
        importance = torch.abs(atom_features * prediction_gradient).sum(dim=1)
    
    # Return top-3 important atoms with indices
    top_idx = torch.topk(importance, k=min(3, len(importance))).indices.tolist()
    return [{"atom_index": int(idx), "importance": float(importance[idx])} for idx in top_idx]