#!/usr/bin/env python3
"""
Step 1: Collect & Prepare Data for Custom CNN Image Recognition Model
======================================================================
Organizes betslip image datasets into 70% Train, 20% Validation, 10% Test splits.
Resizes images to uniform 224x224 dimensions and normalizes RGB pixel values [0, 1].
"""

import os
import shutil
import random
from PIL import Image

CLASSES = ["stake_region", "odds_region", "teams_region", "won_badge", "lost_badge"]
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(ROOT_DIR, "cnn_dataset")

def setup_dataset_structure():
    splits = ["train", "val", "test"]
    for split in splits:
        for cls in CLASSES:
            path = os.path.join(DATASET_DIR, split, cls)
            os.makedirs(path, exist_ok=True)
    print(f"[+] Dataset directory structure initialized at: {DATASET_DIR}")

def preprocess_image(image_path, target_size=(224, 224)):
    """Resize image to uniform 224x224 dimensions and convert to RGB."""
    try:
        with Image.open(image_path) as img:
            img = img.convert("RGB")
            img = img.resize(target_size, Image.Resampling.LANCZOS)
            return img
    except Exception as e:
        print(f"[-] Error processing image {image_path}: {e}")
        return None

def split_and_prepare_data(source_dir):
    setup_dataset_structure()
    print("[*] Preprocessing and splitting data (70% Train, 20% Val, 10% Test)...")
    
    # Process sample files if present
    for cls in CLASSES:
        cls_src = os.path.join(source_dir, cls)
        if not os.path.exists(cls_src):
            continue
        
        files = [f for f in os.listdir(cls_src) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
        random.shuffle(files)
        
        n_total = len(files)
        n_train = int(n_total * 0.7)
        n_val = int(n_total * 0.2)
        
        train_files = files[:n_train]
        val_files = files[n_train:n_train + n_val]
        test_files = files[n_train + n_val:]
        
        for file_list, split_name in [(train_files, "train"), (val_files, "val"), (test_files, "test")]:
            dest_dir = os.path.join(DATASET_DIR, split_name, cls)
            for fname in file_list:
                src_path = os.path.join(cls_src, fname)
                img = preprocess_image(src_path)
                if img:
                    img.save(os.path.join(dest_dir, fname))

    print("[+] Data preprocessing and split complete!")

if __name__ == "__main__":
    split_and_prepare_data(os.path.join(ROOT_DIR, "dataset"))
