#!/usr/bin/env python3
"""Local audio-to-text helper.

Usage examples:
    python audioToText.py --audio-path ./audios/sample.mp3 --language en-US
    python audioToText.py ./audios/sample.mp3 -l en-US

This script converts non-wav audio to WAV (using pydub/ffmpeg) and uses
the SpeechRecognition package (Google Web Speech API by default) to transcribe.
It is intended for local development (no Modal).
"""
import argparse
import os
from pathlib import Path

def audio_to_text(audio_path: str, language: str = "en-US", engine: str = "google") -> str:
    """Transcribe an audio file locally.

    Args:
        audio_path: Path to the audio file.
        language: Language code for transcription (default: en-US).
        engine: 'google' or 'sphinx'

    Returns:
        The transcribed text (or an error message string).
    """
    try:
        import speech_recognition as sr
    except Exception as e:
        return f"Missing dependency: speech_recognition not installed ({e})"

    try:
        from pydub import AudioSegment
    except Exception:
        AudioSegment = None

    p = Path(audio_path)
    if not p.exists():
        return f"Audio file not found: {audio_path}"

    ext = p.suffix[1:].lower()
    temp_wav = None

    # Convert non-wav to wav using pydub if available
    if ext != "wav":
        if AudioSegment is None:
            return (
                "pydub (and ffmpeg) are required to convert non-wav audio. "
                "Install pydub and ensure ffmpeg is on PATH."
            )
        try:
            audio = AudioSegment.from_file(str(p), format=ext)
            temp_wav = str(p.with_suffix(".tmp.wav"))
            audio.export(temp_wav, format="wav")
            audio_path_to_use = temp_wav
        except Exception as e:
            return f"Error converting audio to WAV: {e}"
    else:
        audio_path_to_use = str(p)

    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(audio_path_to_use) as source:
            audio_data = recognizer.record(source)
        try:
            if engine == "google":
                text = recognizer.recognize_google(audio_data, language=language)
            elif engine == "sphinx":
                text = recognizer.recognize_sphinx(audio_data, language=language)
            else:
                return f"Unsupported engine: {engine}"
            return text
        except sr.UnknownValueError:
            return "Speech recognition could not understand the audio"
        except sr.RequestError as e:
            return f"Could not request results from recognition service; {e}"
    finally:
        # Cleanup temporary WAV
        if temp_wav and os.path.exists(temp_wav):
            try:
                os.remove(temp_wav)
            except Exception:
                pass


def _main():
    parser = argparse.ArgumentParser(description="Local audio to text (dev)")
    # Accept either positional path or --audio-path for backwards compatibility
    parser.add_argument("audio_path", nargs="?", help="Path to audio file (positional)")
    parser.add_argument("--audio-path", dest="audio_path_opt", help="Path to audio file (optional flag)")
    parser.add_argument("--language", "-l", default="en-US", help="Language code (default: en-US)")
    parser.add_argument("--engine", "-e", choices=["google", "sphinx"], default="google", help="Recognition engine to use")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    args = parser.parse_args()

    audio_path = args.audio_path_opt or args.audio_path
    if not audio_path:
        parser.error("please provide an audio file path (positional or --audio-path)")

    if args.verbose:
        print(f"Transcribing {audio_path} (engine={args.engine}, lang={args.language})...")

    result = audio_to_text(audio_path, language=args.language, engine=args.engine)
    print("Transcription result:\n")
    print(result)


if __name__ == "__main__":
    _main()
#!/usr/bin/env python3
"""Local audio-to-text helper.

Usage:
    python audioToText.py --audio-path ./audios/sample.mp3 --language en-US

This script converts non-wav audio to WAV (using pydub/ffmpeg) and uses
the SpeechRecognition package (Google Web Speech API by default) to transcribe.
It is intended for local development (no Modal).
"""
import argparse
import os
from pathlib import Path

def audio_to_text(audio_path: str, language: str = "en-US") -> str:
    """Transcribe an audio file locally.

    Args:
        audio_path: Path to the audio file.
        language: Language code for transcription (default: en-US).

    Returns:
        The transcribed text (or an error message string).
    """
    try:
        import speech_recognition as sr
    except Exception as e:
        return f"Missing dependency: speech_recognition not installed ({e})"

    try:
        from pydub import AudioSegment
    except Exception:
        AudioSegment = None

    p = Path(audio_path)
    if not p.exists():
        return f"Audio file not found: {audio_path}"

    ext = p.suffix[1:].lower()
    temp_wav = None

    # If pydub is available and the file is not WAV, convert it
    if ext != "wav":
        if AudioSegment is None:
            return (
                "pydub (and ffmpeg) are required to convert non-wav audio. "
                "Install pydub and ensure ffmpeg is on PATH."
            )
        try:
            audio = AudioSegment.from_file(str(p), format=ext)
            temp_wav = str(p.with_suffix(".tmp.wav"))
            audio.export(temp_wav, format="wav")
            audio_path_to_use = temp_wav
        except Exception as e:
            return f"Error converting audio to WAV: {e}"
    else:
        audio_path_to_use = str(p)

    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(audio_path_to_use) as source:
            audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data, language=language)
            return text
        except sr.UnknownValueError:
            return "Speech recognition could not understand the audio"
        except sr.RequestError as e:
            return f"Could not request results from recognition service; {e}"
    finally:
        # Cleanup temporary WAV
        if temp_wav and os.path.exists(temp_wav):
            try:
                os.remove(temp_wav)
            except Exception:
                pass


def _main():
    parser = argparse.ArgumentParser(description="Local audio to text (dev)")
    parser.add_argument("--audio-path", required=True, help="Path to audio file")
    parser.add_argument("--language", default="en-US", help="Language code (default: en-US)")
    args = parser.parse_args()

    result = audio_to_text(args.audio_path, args.language)
    print("Transcription result:\n")
    print(result)


if __name__ == "__main__":
    _main()
#!/usr/bin/env python3
"""audioToText.py

Utility to convert audio files to text using speech recognition.

Supported audio formats:
- WAV
- MP3
- OGG
- FLAC
- AIFF
- AU

Usage:
    from audioToText import audio_to_text
    
    # Basic usage (uses Google Speech Recognition)
    text = audio_to_text('path/to/audio.wav')
    print(text)
    
    # With specific language
    text = audio_to_text('path/to/audio.mp3', language='es-ES')
    
    # Using different recognition engine
    text = audio_to_text('path/to/audio.wav', engine='sphinx')
"""

import os
from typing import Optional

import speech_recognition as sr
from pydub import AudioSegment

def audio_to_text(
    audio_path: str,
    language: str = "en-US",
    engine: str = "google",
    verbose: bool = False
) -> str:
    """Convert audio file to text using speech recognition.
    
    Args:
        audio_path: Path to audio file
        language: Language code (e.g., 'en-US', 'es-ES')
        engine: Recognition engine ('google' or 'sphinx')
        verbose: If True, print recognition progress
    
    Returns:
        Transcribed text as string
    
    Raises:
        ValueError: If file doesn't exist or format not supported
        RuntimeError: If speech recognition fails
    """
    if not os.path.exists(audio_path):
        raise ValueError(f"Audio file not found: {audio_path}")
    
    # Get file extension (without dot)
    ext = os.path.splitext(audio_path)[1][1:].lower()
    
    # Initialize recognizer
    recognizer = sr.Recognizer()
    
    # Convert to WAV if needed (speech_recognition only works with WAV)
    if ext != 'wav':
        if verbose:
            print(f"Converting {ext} to WAV...")
        
        if ext in ['mp3', 'ogg', 'flac', 'aiff', 'au']:
            audio = AudioSegment.from_file(audio_path, format=ext)
            wav_path = audio_path + '.wav'
            audio.export(wav_path, format='wav')
            audio_path = wav_path
        else:
            raise ValueError(
                f"Unsupported audio format: {ext}. "
                "Supported formats: WAV, MP3, OGG, FLAC, AIFF, AU"
            )
    
    # Read the audio file
    if verbose:
        print("Reading audio file...")
        
    with sr.AudioFile(audio_path) as source:
        audio_data = recognizer.record(source)
    
    # Delete temporary WAV if we created one
    if ext != 'wav' and os.path.exists(audio_path):
        os.remove(audio_path)
    
    if verbose:
        print("Recognizing speech...")
    
    try:
        if engine == 'google':
            text = recognizer.recognize_google(audio_data, language=language)
        elif engine == 'sphinx':
            text = recognizer.recognize_sphinx(audio_data, language=language)
        else:
            raise ValueError(
                f"Unsupported engine: {engine}. "
                "Supported engines: 'google', 'sphinx'"
            )
    except sr.UnknownValueError:
        raise RuntimeError("Speech recognition could not understand the audio")
    except sr.RequestError as e:
        raise RuntimeError(f"Could not request results from service: {e}")
    
    return text


def _cli():
    """Command line interface for quick testing."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Convert audio file to text")
    parser.add_argument("audio_path", help="Path to audio file")
    parser.add_argument(
        "--language", "-l",
        default="en-US",
        help="Language code (e.g., en-US, es-ES)"
    )
    parser.add_argument(
        "--engine", "-e",
        choices=["google", "sphinx"],
        default="google",
        help="Speech recognition engine to use"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print progress information"
    )
    
    args = parser.parse_args()
    
    try:
        text = audio_to_text(
            args.audio_path,
            language=args.language,
            engine=args.engine,
            verbose=args.verbose
        )
        print(text)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(_cli())