# YouTube Analytics Tracker Extension - Installation Guide

## Extension Files

The extension consists of the following files:

- `manifest.json` - Extension configuration
- `popup.html` - Dashboard UI
- `popup.js` - Dashboard functionality
- `content.js` - YouTube page interaction tracking
- `background.js` - Data processing and storage
- `images/` - Directory containing extension icons
- `README.md` - Extension documentation

## Installation Steps

1. **Download the Extension Files**
   - Download all the files in the `/app/extension` directory

2. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" using the toggle in the top-right corner
   - Click "Load unpacked" and select the directory containing the extension files
   - The extension should now appear in your extensions list

3. **Verify Installation**
   - You should see the YouTube Analytics Tracker icon in your browser toolbar
   - If the icon is not visible, click the puzzle piece icon and pin the extension

## Usage Guide

1. **Tracking YouTube Activity**
   - The extension automatically tracks your activity on YouTube
   - It records when you watch videos, how long you watch them, and whether you like or comment

2. **Viewing Your Analytics**
   - Click the extension icon in your browser toolbar to open the dashboard
   - The dashboard shows overall statistics and channel-specific metrics
   - Use the day/week/month buttons to view different time periods

3. **Exporting Data**
   - Click the "Export CSV" or "Export JSON" buttons to download your analytics data
   - CSV is useful for importing into spreadsheet software
   - JSON retains all details for more advanced analysis

## Privacy Information

- All data is stored locally on your device using Chrome's local storage
- No data is transmitted to external servers
- Your YouTube viewing habits remain private and secure

## Troubleshooting

If the extension is not working as expected:

1. Make sure you're visiting `youtube.com` (the extension only works on YouTube)
2. Check if the extension is enabled in Chrome's extensions page
3. Try reloading the YouTube page
4. If issues persist, try reloading the extension by clicking the refresh icon on the extensions page

## Features Overview

- **Watch Time Tracking:** Records the duration you watch each video
- **Engagement Tracking:** Tracks likes and comments
- **Channel Analytics:** See statistics grouped by channel
- **Data Visualization:** Modern charts and graphs
- **Export Options:** Download your data for further analysis
