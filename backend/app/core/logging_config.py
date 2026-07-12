# app/core/logging_config.py

import logging
import sys

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),   # prints to console
            logging.FileHandler("app.log"),       # also writes to a file
        ],
    )