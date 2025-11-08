# Lumo
Multimodal Agentic AI Communication Tool for Nonverbal Users

Make sure python version > 3.10
In your VENV, make sure to install the following pip dependencies:
pip install opencv-python
pip install torch
pip install torchvision
pip install mediapipe


Data Collection and Cleaning: https://github.com/k-m-irfan/MER_dataset_cleaning
Dataset: https://www.kaggle.com/datasets/kmirfan/micro-expressions
Notebook: https://www.kaggle.com/code/kmirfan/micro-expression-classification
Weights: https://drive.google.com/file/d/19N4wP8bRsdR9VRf84ex2YFolUhF8qT6k/view?usp=sharing


How to run run_local_transcribe.py:

python run_local_transcribe.py --audio-path ./audios/damn-son-whered-you-find-this.mp3 --language en-US


how to run textTotext.py: python textTotext.py --image ./imgs/sad.jpg 