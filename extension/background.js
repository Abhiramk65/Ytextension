// YouTube Analytics Tracker - Background Script

// Initialize extension data when installed
chrome.runtime.onInstalled.addListener(function() {
  console.log('YouTube Analytics Tracker installed');
  
  // Initialize analytics storage if not exists
  chrome.storage.local.get('youtubeAnalytics', function(data) {
    if (!data.youtubeAnalytics) {
      console.log('Initializing analytics storage');
      
      chrome.storage.local.set({
        youtubeAnalytics: {
          totalWatchTime: 0, // in minutes
          videoCount: 0,
          likedVideos: 0,
          commentedVideos: 0,
          videos: {},
          channels: {},
          lastReset: Date.now()
        }
      });
    }
  });
});

// Listen for messages from content or popup scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getAnalytics') {
    chrome.storage.local.get('youtubeAnalytics', function(data) {
      sendResponse({ analytics: data.youtubeAnalytics || {} });
    });
    return true; // Required for async response
  }
  
  if (request.action === 'resetAnalytics') {
    chrome.storage.local.set({
      youtubeAnalytics: {
        totalWatchTime: 0,
        videoCount: 0,
        likedVideos: 0,
        commentedVideos: 0,
        videos: {},
        channels: {},
        lastReset: Date.now()
      }
    }, function() {
      sendResponse({ success: true });
    });
    return true; // Required for async response
  }
});

// Set up message handler to receive data from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'videoData') {
    // Process video data
    processVideoData(message.data);
    sendResponse({ status: 'received' });
  }
});

// Process and store video data
function processVideoData(videoData) {
  if (!videoData || !videoData.videoId) return;
  
  // Get existing analytics data
  chrome.storage.local.get('youtubeAnalytics', function(data) {
    let analytics = data.youtubeAnalytics || {
      totalWatchTime: 0,
      videoCount: 0,
      likedVideos: 0,
      commentedVideos: 0,
      videos: {},
      channels: {}
    };
    
    // Update analytics with new video data
    // Code here will be similar to the saveVideoData function in content.js
    
    // Save updated analytics
    chrome.storage.local.set({ youtubeAnalytics: analytics });
  });
}
