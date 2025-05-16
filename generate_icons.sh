#!/bin/bash

# Download a sample image
curl -s https://via.placeholder.com/128/4285f4/ffffff?text=YT -o /app/extension/images/icon128.png
curl -s https://via.placeholder.com/48/4285f4/ffffff?text=YT -o /app/extension/images/icon48.png
curl -s https://via.placeholder.com/16/4285f4/ffffff?text=YT -o /app/extension/images/icon16.png

echo "Icons downloaded successfully!"
ls -la /app/extension/images/
