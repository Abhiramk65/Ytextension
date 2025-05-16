# YouTube Analytics Tracker Chrome Extension

A Chrome extension that tracks and analyzes your YouTube viewing habits, providing insights about your subscribed channels and watched videos.

## Features

- **Video Tracking:** Records watch duration, likes, and comments for each video you watch
- **Channel Analytics:** Groups statistics by channel to show which channels you engage with most
- **Interactive Dashboard:** Modern UI with charts and detailed statistics
- **Data Export:** Export your viewing data as CSV or JSON for further analysis
- **Privacy Focused:** All data stays on your device (no cloud sync)

## Extension Structure

- `/extension/` - Contains all extension files
  - `manifest.json` - Extension configuration
  - `popup.html` & `popup.js` - Dashboard UI and functionality
  - `content.js` - Tracks YouTube page interactions
  - `background.js` - Handles data storage and processing
  - `images/` - Extension icons
  - `index.html` - Installation guide

## Tracked Statistics

- **Video-specific:**
  - Watch duration (in seconds)
  - Liked status (true/false)
  - Commented status (true/false)
  - Channel information
  
- **Channel-specific:**
  - Total watch time
  - Number of videos watched
  - Number of videos liked
  - Number of videos commented on
  - Engagement rate

## Installation

See the detailed [Installation Guide](/app/INSTALLATION_GUIDE.md) for step-by-step instructions.

## Development

To modify or enhance this extension:

1. Make changes to the relevant files in the `/app/extension/` directory
2. Test locally by loading the unpacked extension in Chrome
3. Package for distribution when ready

## Future Enhancements

Potential improvements for future versions:

- Cloud sync functionality
- Additional metrics (subscriptions, shares, etc.)
- Video category analysis
- Watch time trends over longer periods
- Recommendations based on viewing habits

## Privacy & Data Storage

This extension stores all data in Chrome's local storage and does not transmit any information to external servers. Your YouTube viewing data remains private and is only accessible to you.
