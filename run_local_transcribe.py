#!/usr/bin/env python3
"""Small wrapper to call audioToText.audio_to_text without running any script-level CLI.

This imports the function and calls it directly to avoid any argparse/duplication issues.
"""
import argparse
from audioToText import audio_to_text


def main():
    parser = argparse.ArgumentParser(description="Run local transcription via audioToText.audio_to_text")
    parser.add_argument("--audio-path", required=True, help="Path to audio file")
    parser.add_argument("--language", "-l", default="en-US", help="Language code")
    parser.add_argument("--engine", "-e", choices=["google", "sphinx"], default="google", help="Recognition engine")
    args = parser.parse_args()

    result = audio_to_text(args.audio_path, language=args.language, engine=args.engine)
    print("Transcription result:\n")
    print(result)


if __name__ == "__main__":
    main()
