#!/usr/bin/env python3
"""
Download real catalytic datasets for DiffuCat.
Supports CatBench, OC20, and Materials Project via DVC or direct URLs.
PDF Alignment: Data Infrastructure, MLOps & Deployment.
"""
import os
import sys
import hashlib
import requests
from pathlib import Path
from src.core.logger import setup_logger

logger = setup_logger("scripts.download")

# Dataset registry: name → {url, checksum, description}
DATASETS = {
    "catbench_small": {
        "url": "https://figshare.com/ndownloader/files/XXXXXXX",  # Replace with real URL
        "checksum": "sha256:abc123...",  # Replace with real checksum
        "description": "CatBench small subset (1k catalysts) for MVP testing",
        "filename": "catbench_small.csv"
    },
    "oc20_train": {
        "url": "https://dl.fbaipublicfiles.com/opencatalystproject/data/oc20_train.tar.gz",
        "checksum": "sha256:def456...",
        "description": "Open Catalyst 2020 training set (adsorption energies)",
        "filename": "oc20_train.tar.gz"
    },
    "materials_project": {
        "url": "https://api.materialsproject.org/...",  # Requires API key
        "checksum": None,  # API responses don't have checksums
        "description": "Materials Project formation energies (requires API key)",
        "filename": "materials_project.json"
    }
}

def download_file(url: str, output_path: Path, checksum: str = None) -> bool:
    """Download a file with optional checksum verification."""
    logger.info(f"⬇️  Downloading {url} → {output_path}")
    
    try:
        response = requests.get(url, stream=True, timeout=300)
        response.raise_for_status()
        
        # Write in chunks to handle large files
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Verify checksum if provided
        if checksum:
            logger.info("🔐 Verifying checksum...")
            if not verify_checksum(output_path, checksum):
                logger.error(f"❌ Checksum mismatch for {output_path}")
                output_path.unlink(missing_ok=True)
                return False
        
        logger.info(f"✅ Downloaded {output_path.name} ({output_path.stat().st_size / 1e6:.1f} MB)")
        return True
        
    except Exception as e:
        logger.error(f"❌ Download failed: {e}")
        if output_path.exists():
            output_path.unlink()
        return False

def verify_checksum(file_path: Path, expected: str) -> bool:
    """Verify file checksum (supports sha256:...)."""
    if not expected.startswith("sha256:"):
        logger.warning(f"Unknown checksum format: {expected}")
        return True  # Skip verification for unknown formats
    
    expected_hash = expected.split(":")[1]
    sha256 = hashlib.sha256()
    
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    
    actual_hash = sha256.hexdigest()
    if actual_hash == expected_hash:
        logger.info("✅ Checksum verified")
        return True
    else:
        logger.error(f"❌ Checksum mismatch: expected {expected_hash}, got {actual_hash}")
        return False

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Download catalytic datasets for DiffuCat")
    parser.add_argument("dataset", choices=DATASETS.keys(), help="Dataset to download")
    parser.add_argument("--output", type=str, default="data/raw", help="Output directory")
    parser.add_argument("--force", action="store_true", help="Force re-download if file exists")
    
    args = parser.parse_args()
    dataset_info = DATASETS[args.dataset]
    output_dir = Path(args.output)
    output_path = output_dir / dataset_info["filename"]
    
    # Check if file already exists
    if output_path.exists() and not args.force:
        logger.info(f"✅ File already exists: {output_path}")
        # Optional: verify checksum anyway
        if dataset_info["checksum"]:
            if verify_checksum(output_path, dataset_info["checksum"]):
                return 0
            else:
                logger.warning("⚠️  Checksum mismatch; re-downloading with --force")
                args.force = True
    
    # Download
    success = download_file(
        dataset_info["url"],
        output_path,
        dataset_info["checksum"]
    )
    
    if success:
        logger.info(f"🎉 Dataset '{args.dataset}' ready at {output_path}")
        return 0
    else:
        logger.error(f"❌ Failed to download '{args.dataset}'")
        return 1

if __name__ == "__main__":
    sys.exit(main())