#!/usr/bin/env python3
import argparse
import os
import sys
import json
from typing import Optional

import cv2
import torch
import torchvision.transforms as transforms

import MER

EMOTIONS = ['anger', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise']


def _get_default_weights_path() -> str:
    return os.path.join(os.path.dirname(__file__), "MERCnn.pth")


def _load_model(weights_path: str, device: torch.device):
    if not os.path.isfile(weights_path):
        raise FileNotFoundError(f"Model weights not found at {weights_path!r}. Place 'MERCnn.pth' next to this file or pass --weights.")

    model = MER.to_device(MER.MERCnnModel(), device)
    map_loc = torch.device("cuda") if hasattr(device, "type") and device.type == "cuda" else torch.device("cpu")
    model.load_state_dict(torch.load(weights_path, map_location=map_loc))
    model.eval()  # evaluation mode
    return model


def _prepare_tensor_from_frame(frame) -> torch.Tensor:
    bboxes = MER.faceBox(frame)
    if bboxes and len(bboxes) > 0:
        x, y, w, h = bboxes[0]  # only first face
        face = frame[y:y+h, x:x+w]
    else:
        face = frame

    face_resized = cv2.resize(face, (80, 80))
    transform = transforms.ToTensor()
    tensor = transform(face_resized)
    return tensor


def predict_from_video(weights_path: Optional[str] = None, video_source=1, fps=2, show_window=True):
    """Predict dominant emotion from a video source until 'q' is pressed or video ends."""

    if weights_path is None:
        weights_path = _get_default_weights_path()

    device = MER.get_default_device()
    model = _load_model(weights_path, device)

    label_counts = [0] * len(EMOTIONS)

    # Determine if source is a video file (string path) or webcam (integer)
    is_file = isinstance(video_source, str) and os.path.isfile(video_source)

    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video source {video_source}")

    # Compute frame interval
    original_fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_interval = max(int(original_fps // fps), 1)
    frame_idx = 0

    if not is_file:
        print("Press 'q' in the window to stop measuring emotions and return result.")

    while True:
        ret, frame = cap.read()

        # Webcam: retry if frame fails
        if not ret:
            if is_file:
                break  # video ended → auto exit
            else:
                continue  # webcam → keep trying

        if frame_idx % frame_interval == 0:
            try:
                tensor = _prepare_tensor_from_frame(frame)
                prediction = MER.predict_image(tensor, model, device)
                idx = EMOTIONS.index(prediction)
                label_counts[idx] += 1

                if show_window:
                    bboxes = MER.faceBox(frame)
                    if bboxes:
                        x, y, w, h = bboxes[0]
                        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                        cv2.putText(frame, prediction, (x, y-10),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
                    cv2.imshow("MER Video", frame)

                    if not is_file:  # only require 'q' for webcam
                        if cv2.waitKey(1) & 0xFF == ord('q'):
                            break

            except Exception as e:
                print(f"Skipping frame due to error: {e}", file=sys.stderr)

        frame_idx += 1

    cap.release()
    if show_window:
        cv2.destroyAllWindows()

    max_idx = max(range(len(label_counts)), key=lambda i: label_counts[i])
    return EMOTIONS[max_idx], label_counts


def _cli(argv):
    parser = argparse.ArgumentParser(description="Predict dominant emotion from video using MER model")
    parser.add_argument("--weights", "-w", default=None, help="Path to MER weights (defaults to MERCnn.pth)")
    parser.add_argument("--video", "-v", default="1", type=str, help="Video source (1 for webcam or path to video file)")
    parser.add_argument("--no-window", action="store_true", help="Disable live video display")
    parser.add_argument("--json", "-j", default="data.json", help="Path to JSON file to update with emotion")
    args = parser.parse_args(argv)

    video_source = args.video
    if video_source.isdigit():
        video_source = int(video_source)

    try:
        emotion, counts = predict_from_video(args.weights, video_source, show_window=not args.no_window)
        print(f"\nPredicted dominant emotion: {emotion}")
        print(f"Counts per emotion: {dict(zip(EMOTIONS, counts))}")

        # Update JSON file
        if os.path.isfile(args.json):
            with open(args.json, "r") as f:
                data = json.load(f)
        else:
            data = {}

        data["emotion"] = emotion

        with open(args.json, "w") as f:
            json.dump(data, f, indent=4)

        print(f"Updated '{args.json}' with emotion: {emotion}")
        return 0
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(_cli(sys.argv[1:]))
