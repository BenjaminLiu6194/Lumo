#!/usr/bin/env python3
"""textTotext.py

Small utility to predict emotion from an image using the project's MER model.

Usage (CLI):
  python textTotext.py --image /path/to/photo.jpg

Library usage:
  from textTotext import predict_from_image
  label = predict_from_image('/path/to/photo.jpg')
"""
import argparse
import os
import sys
from typing import Optional

import cv2
import torch
import torchvision.transforms as transforms

import MER


def _get_default_weights_path() -> str:
    return os.path.join(os.path.dirname(__file__), "MERCnn.pth")


def _load_model(weights_path: str, device: torch.device):
    if not os.path.isfile(weights_path):
        raise FileNotFoundError(f"Model weights not found at {weights_path!r}. Place 'MERCnn.pth' next to 'textTotext.py' or pass --weights.")

    model = MER.to_device(MER.MERCnnModel(), device)

    # choose map_location based on device type
    if hasattr(device, "type") and device.type == "cuda":
        map_loc = torch.device("cuda")
    else:
        map_loc = torch.device("cpu")

    try:
        model.load_state_dict(torch.load(weights_path, map_location=map_loc))
    except Exception as e:
        raise RuntimeError(f"Failed to load weights from {weights_path!r}: {e}")

    return model


def _prepare_tensor_from_image(image_path: str) -> torch.Tensor:
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image at {image_path!r}")

    # Try to find a face box first; if not present, use the whole image
    bboxes = MER.faceBox(img)
    if bboxes and len(bboxes) > 0:
        x, y, w, h = bboxes[0]
        face = img[y : y + h, x : x + w]
    else:
        face = img

    try:
        face_resized = cv2.resize(face, (80, 80))
    except Exception as e:
        raise RuntimeError(f"Failed to resize face image: {e}")

    transform = transforms.ToTensor()
    # Note: the project's MER.predict_image expects the same single-tensor shape used in meRecognition.py
    tensor = transform(face_resized)
    return tensor


def predict_from_image(image_path: str, weights_path: Optional[str] = None) -> str:
    """Load model and predict emotion label from an image path.

    Returns the predicted label string. Raises informative exceptions on error.
    """
    if weights_path is None:
        weights_path = _get_default_weights_path()

    device = MER.get_default_device()
    model = _load_model(weights_path, device)
    tensor = _prepare_tensor_from_image(image_path)
    prediction = MER.predict_image(tensor, model, device)
    return prediction


def _cli(argv):
    parser = argparse.ArgumentParser(description="Predict emotion from an image using the project's MER model")
    parser.add_argument("--image", "-i", required=True, help="Path to input image")
    parser.add_argument("--weights", "-w", default=None, help="Path to MER weights (defaults to MERCnn.pth next to this file)")
    args = parser.parse_args(argv)

    try:
        label = predict_from_image(args.image, args.weights)
        print(label)
        return 0
    except Exception as e:  # keep broad for CLI so we print helpful message
        print(f"Error: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(_cli(sys.argv[1:]))
