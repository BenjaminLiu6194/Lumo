import cv2
import json
import os
import sys
import numpy as np
from airia_trial import queryAIRIA
import textTotext
import subprocess

def process_video(video_path: str, user_input: str):
    """
    Process a video file to extract emotion, transcribe audio, and get AI response.
    
    Args:
        video_path (str): Path to the MP4 file
        user_input (str): User's input text
        
    Returns:
        dict: Dictionary containing emotion, transcribed text, AI response, and audio file paths
    
    Raises:
        FileNotFoundError: If video file doesn't exist
        ValueError: If video file is invalid
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")
    
    if not os.path.isfile(video_path):
        raise ValueError(f"Not a file: {video_path}")
        
    # Check if it's a video file
    video = cv2.VideoCapture(video_path)
    if not video.isOpened():
        video.release()
        raise ValueError(f"Could not open video file: {video_path}")
    # 1. Process video for emotion using the built-in video processing
    emotion, counts = textTotext.predict_from_video(
        video_source=video_path,
        show_window=False  # Don't show the video window while processing
    )
    dominant_emotion = emotion  # This is already the dominant emotion
        
    # Save emotion to data.json
    with open('data.json', 'r+') as f:
        data = json.load(f)
        data['emotion'] = dominant_emotion
        f.seek(0)
        json.dump(data, f, indent=4)
        f.truncate()
    
    # 2. Extract audio from video using ffmpeg
    temp_audio = "temp_video_audio.wav"
    try:
        # Extract audio from video
        subprocess.run([
            'ffmpeg', '-i', video_path,
            '-vn',  # No video
            '-acodec', 'pcm_s16le',  # PCM format
            '-ar', '44100',  # Sample rate
            '-ac', '2',  # Stereo
            '-y',  # Overwrite output file
            temp_audio
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error extracting audio: {e}")
        raise RuntimeError("Failed to extract audio from video")

    # 3. Process audio to text using audioToText
    from audioToText import audio_to_text
    transcribed_text = audio_to_text(temp_audio)
    
    # Clean up temporary audio file
    if os.path.exists(temp_audio):
        os.remove(temp_audio)

    # Get AI response first so we can generate the audio files
    airia_response = queryAIRIA(
        convo_txt=transcribed_text,
        user_input=user_input,
        emotion=dominant_emotion
    )

    # 4. Generate audio files using textTospeech.generate_speech for each response
    from textTospeech import generate_speech

    audio_files = []
    for idx, response in enumerate(airia_response.get("responses", [])):
        output_file = f"response_{idx+1}.mp3"
        try:
            # Call the TTS function directly (passes text and detected emotion)
            generate_speech(response, dominant_emotion, out_path=output_file)
            audio_files.append(output_file)
        except Exception as e:
            # If TTS fails for this response, log and continue
            print(f"Warning: TTS failed for response #{idx+1}: {e}", file=sys.stderr)
            # create an empty placeholder file to keep indexing predictable
            open(output_file, 'wb').close()
            audio_files.append(output_file)
    
    return {
        "emotion": dominant_emotion,
        "transcribed_text": transcribed_text,
        "airia_response": airia_response,
        "audio_files": audio_files
    }

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Process video for emotion and generate AI response")
    parser.add_argument("video", help="Path to the input video file")
    parser.add_argument("--input", "-i", default="", help="User input text")
    
    args = parser.parse_args()
    
    try:
        result = process_video(args.video, args.input)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)