// YouTube Analytics Tracker - Content Script
// This script runs on YouTube pages and collects data about user interaction

// Initialize tracking data when the page loads
let videoData = {
  videoId: null,
  channelId: null,
  channelTitle: null,
  channelThumbnail: null,
  title: null,
  liked: false,
  commented: false,
  startTime: null,
  watchDuration: 0,
  intervalId: null
};

// Track if we've already set up listeners for this page
let trackingInitialized = false;

// Initialize tracking based on the current URL
function initializeTracking() {
  // Reset tracking state
  resetTracking();
  
  // Only set up listeners once
  if (!trackingInitialized) {
    setupEventListeners();
    trackingInitialized = true;
  }
  
  // Check if we're on a video page
  if (window.location.pathname === '/watch') {
    startVideoTracking();
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Listen for URL changes (YouTube is a SPA)
  observeUrlChanges();
  
  // Listen for like button clicks
  document.addEventListener('click', function(event) {
    // Check if the clicked element is a like button
    if (isLikeButton(event.target)) {
      videoData.liked = true;
      saveVideoData();
    }
    
    // Check if user is leaving a comment
    if (isCommentSubmitButton(event.target)) {
      videoData.commented = true;
      saveVideoData();
    }
  });
}

// Check if element is a like button
function isLikeButton(element) {
  // This selector might need to be updated based on YouTube's DOM structure
  const likeButton = element.closest('ytd-toggle-button-renderer, button[aria-label*="like"]');
  return likeButton !== null && likeButton.ariaLabel && likeButton.ariaLabel.toLowerCase().includes('like');
}

// Check if element is a comment submit button
function isCommentSubmitButton(element) {
  // This selector might need to be updated based on YouTube's DOM structure
  const commentButton = element.closest('button[aria-label="Comment"]');
  return commentButton !== null;
}

// Observe URL changes since YouTube is a SPA
function observeUrlChanges() {
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      
      // If we were tracking a video, save the data before changing
      if (videoData.videoId) {
        stopWatchTimeTracking();
        saveVideoData();
      }
      
      // Reset for the new page
      resetTracking();
      
      // If we navigated to a video page, start tracking
      if (window.location.pathname === '/watch') {
        setTimeout(startVideoTracking, 1000); // Give the page time to load
      }
    }
  });
  
  urlObserver.observe(document, { subtree: true, childList: true });
}

// Start tracking for a video page
function startVideoTracking() {
  try {
    // Extract video ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    videoData.videoId = urlParams.get('v');
    
    if (!videoData.videoId) return;
    
    // Start timing video watch
    videoData.startTime = Date.now();
    
    // Extract video metadata
    extractVideoMetadata();
    
    // Start interval to track watch time
    startWatchTimeTracking();
    
    console.log('Started tracking video:', videoData.title);
  } catch (error) {
    console.error('Error starting video tracking:', error);
  }
}

// Extract metadata about the current video
function extractVideoMetadata() {
  // Title from the page
  try {
    videoData.title = document.querySelector('h1.title') ? 
      document.querySelector('h1.title').textContent.trim() : 
      document.title.replace(' - YouTube', '');
  } catch (e) {
    videoData.title = 'Unknown Video';
  }
  
  // Channel info - this may need to be updated based on YouTube's DOM structure
  try {
    // Channel name
    const channelElement = document.querySelector('#channel-name a, #owner-name a');
    if (channelElement) {
      videoData.channelTitle = channelElement.textContent.trim();
      
      // Channel URL will contain the ID
      const channelUrl = channelElement.href;
      const channelUrlMatch = channelUrl.match(/\/(@[^\/]+|channel\/([^\/]+))/);
      if (channelUrlMatch) {
        videoData.channelId = channelUrlMatch[1];
      }
    }
    
    // Channel thumbnail
    const thumbnailElement = document.querySelector('#owner img, #channel-thumbnail img');
    if (thumbnailElement) {
      videoData.channelThumbnail = thumbnailElement.src;
    }
  } catch (e) {
    console.error('Error extracting channel data:', e);
  }
}

// Start tracking watch time
function startWatchTimeTracking() {
  // Clear any existing interval
  if (videoData.intervalId) {
    clearInterval(videoData.intervalId);
  }
  
  // Create an interval that increments watch time
  videoData.intervalId = setInterval(() => {
    const videoElement = document.querySelector('video');
    
    if (videoElement && !videoElement.paused) {
      // Only increment if the video is actually playing
      videoData.watchDuration += 1; // Add 1 second
      
      // Save data periodically (every 30 seconds)
      if (videoData.watchDuration % 30 === 0) {
        saveVideoData();
      }
    }
  }, 1000); // Check every second
}

// Stop tracking watch time
function stopWatchTimeTracking() {
  if (videoData.intervalId) {
    clearInterval(videoData.intervalId);
    videoData.intervalId = null;
  }
}

// Reset tracking data
function resetTracking() {
  stopWatchTimeTracking();
  
  videoData = {
    videoId: null,
    channelId: null,
    channelTitle: null,
    channelThumbnail: null,
    title: null,
    liked: false,
    commented: false,
    startTime: null,
    watchDuration: 0,
    intervalId: null
  };
}

// Save data to Chrome storage
function saveVideoData() {
  if (!videoData.videoId || !videoData.channelId) return;
  
  // Format data for storage
  const videoStats = {
    id: videoData.videoId,
    title: videoData.title,
    channelId: videoData.channelId,
    channelTitle: videoData.channelTitle,
    watchDuration: videoData.watchDuration, // in seconds
    liked: videoData.liked,
    commented: videoData.commented,
    timestamp: Date.now()
  };
  
  // Get existing data
  chrome.storage.local.get('youtubeAnalytics', function(data) {
    let analytics = data.youtubeAnalytics || {
      totalWatchTime: 0, // in minutes
      videoCount: 0,
      likedVideos: 0,
      commentedVideos: 0,
      videos: {},
      channels: {}
    };
    
    // Update total stats
    const isNewVideo = !analytics.videos[videoData.videoId];
    if (isNewVideo) {
      analytics.videoCount++;
    }
    
    // Calculate watch duration in minutes for adding to totals
    const watchMinutes = Math.floor(videoData.watchDuration / 60);
    
    // Update like/comment counts if they changed
    if (videoData.liked && (!analytics.videos[videoData.videoId] || !analytics.videos[videoData.videoId].liked)) {
      analytics.likedVideos++;
    }
    
    if (videoData.commented && (!analytics.videos[videoData.videoId] || !analytics.videos[videoData.videoId].commented)) {
      analytics.commentedVideos++;
    }
    
    // Store video data
    analytics.videos[videoData.videoId] = {
      ...videoStats,
      // If we already have data for this video, use the maximum watch duration
      watchDuration: Math.max(
        videoData.watchDuration,
        analytics.videos[videoData.videoId]?.watchDuration || 0
      ),
      // Preserve existing like/comment status if already set
      liked: videoData.liked || analytics.videos[videoData.videoId]?.liked || false,
      commented: videoData.commented || analytics.videos[videoData.videoId]?.commented || false
    };
    
    // Update channel data
    if (!analytics.channels[videoData.channelId]) {
      analytics.channels[videoData.channelId] = {
        title: videoData.channelTitle,
        thumbnailUrl: videoData.channelThumbnail,
        videoCount: 0,
        totalWatchTime: 0,
        likedVideos: 0,
        commentedVideos: 0,
        lastWatched: Date.now()
      };
    }
    
    const channel = analytics.channels[videoData.channelId];
    
    // Update channel stats
    if (isNewVideo) {
      channel.videoCount++;
    }
    
    // Update channel like/comment count if needed
    if (videoData.liked && (!analytics.videos[videoData.videoId] || !analytics.videos[videoData.videoId].liked)) {
      channel.likedVideos++;
    }
    
    if (videoData.commented && (!analytics.videos[videoData.videoId] || !analytics.videos[videoData.videoId].commented)) {
      channel.commentedVideos++;
    }
    
    // Add watch time to channel total (in minutes)
    const oldWatchDuration = analytics.videos[videoData.videoId]?.watchDuration || 0;
    const watchDurationDifference = videoData.watchDuration - oldWatchDuration;
    
    if (watchDurationDifference > 0) {
      const minutesDifference = Math.floor(watchDurationDifference / 60);
      channel.totalWatchTime += minutesDifference;
      analytics.totalWatchTime += minutesDifference;
    }
    
    channel.lastWatched = Date.now();
    
    // Save updated analytics
    chrome.storage.local.set({ youtubeAnalytics: analytics }, function() {
      console.log('Saved video data for', videoData.title);
    });
  });
}

// Set up visibility change detection to detect when user leaves page
document.addEventListener('visibilitychange', function() {
  if (document.hidden && videoData.videoId) {
    // User is navigating away, save current data
    stopWatchTimeTracking();
    saveVideoData();
  } else if (!document.hidden && videoData.videoId) {
    // User came back to the page, restart tracking
    startWatchTimeTracking();
  }
});

// Set up before unload handler to save data when page is closed
window.addEventListener('beforeunload', function() {
  if (videoData.videoId) {
    stopWatchTimeTracking();
    saveVideoData();
  }
});

// Start tracking when the content script loads
window.addEventListener('load', function() {
  // Give the page a moment to fully load
  setTimeout(initializeTracking, 1500);
});

// Initialize immediately for faster response
initializeTracking();
