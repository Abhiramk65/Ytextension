// Initialize chart when popup opens
let watchTimeChart;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize chart
  initializeChart();
  
  // Load data from storage and update UI
  loadAndDisplayData();
  
  // Set up event listeners for buttons
  document.getElementById('exportCSV').addEventListener('click', exportDataAsCSV);
  document.getElementById('exportJSON').addEventListener('click', exportDataAsJSON);
  
  // View mode buttons
  document.getElementById('dayView').addEventListener('click', () => changeViewMode('day'));
  document.getElementById('weekView').addEventListener('click', () => changeViewMode('week'));
  document.getElementById('monthView').addEventListener('click', () => changeViewMode('month'));
  
  // Channel search
  document.getElementById('channelSearch').addEventListener('input', filterChannels);
});

// Initialize the watch time chart
function initializeChart() {
  const ctx = document.getElementById('watchTimeChart').getContext('2d');
  watchTimeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Watch Time (minutes)',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Load data from storage and update UI
function loadAndDisplayData() {
  chrome.storage.local.get('youtubeAnalytics', function(data) {
    if (data.youtubeAnalytics) {
      updateStatistics(data.youtubeAnalytics);
      updateChannelList(data.youtubeAnalytics.channels);
      updateChart(data.youtubeAnalytics);
    } else {
      // If no data, show placeholder
      document.getElementById('channelList').innerHTML = `
        <div class="channel-card bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-4">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          </div>
          <div class="flex-1">
            <h3 class="font-medium">No data available</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Start watching YouTube to track statistics</p>
          </div>
        </div>
      `;
    }
  });
}

// Update overview statistics
function updateStatistics(data) {
  // Calculate total watch time in hours and minutes
  const totalMinutes = data.totalWatchTime || 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  document.getElementById('totalWatchTime').textContent = `${hours}h ${minutes}m`;
  document.getElementById('videosWatched').textContent = data.videoCount || 0;
  
  // Calculate engagement rate (likes + comments / total videos)
  const likedVideos = data.likedVideos || 0;
  const commentedVideos = data.commentedVideos || 0;
  const videoCount = data.videoCount || 1; // Avoid division by zero
  const engagementRate = Math.round(((likedVideos + commentedVideos) / videoCount) * 100);
  
  document.getElementById('engagementRate').textContent = `${engagementRate}%`;
}

// Update channel list
function updateChannelList(channels) {
  if (!channels || Object.keys(channels).length === 0) {
    return;
  }
  
  const channelListEl = document.getElementById('channelList');
  channelListEl.innerHTML = '';
  
  // Convert channels object to array for sorting
  const channelArray = Object.keys(channels).map(channelId => ({
    id: channelId,
    ...channels[channelId]
  }));
  
  // Sort by watch time (highest first)
  channelArray.sort((a, b) => (b.totalWatchTime || 0) - (a.totalWatchTime || 0));
  
  channelArray.forEach(channel => {
    const watchTimeHours = Math.floor((channel.totalWatchTime || 0) / 60);
    const watchTimeMinutes = (channel.totalWatchTime || 0) % 60;
    
    const engagementRate = calculateChannelEngagement(channel);
    
    const channelEl = document.createElement('div');
    channelEl.className = 'channel-card bg-white dark:bg-gray-800 rounded-lg shadow p-4';
    channelEl.innerHTML = `
      <div class="flex items-center space-x-4 mb-3">
        <div class="flex-shrink-0">
          <img src="${channel.thumbnailUrl || ''}" class="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700" onerror="this.src='images/channel-placeholder.png'">
        </div>
        <div class="flex-1">
          <h3 class="font-medium">${channel.title || 'Unknown Channel'}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">${channel.videoCount || 0} videos watched</p>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <p class="text-xs text-gray-500 dark:text-gray-400">Watch Time</p>
          <p class="font-medium">${watchTimeHours}h ${watchTimeMinutes}m</p>
        </div>
        <div class="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <p class="text-xs text-gray-500 dark:text-gray-400">Likes</p>
          <p class="font-medium">${channel.likedVideos || 0}</p>
        </div>
        <div class="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <p class="text-xs text-gray-500 dark:text-gray-400">Engagement</p>
          <p class="font-medium">${engagementRate}%</p>
        </div>
      </div>
    `;
    
    channelListEl.appendChild(channelEl);
  });
}

// Calculate channel engagement rate
function calculateChannelEngagement(channel) {
  const likedVideos = channel.likedVideos || 0;
  const commentedVideos = channel.commentedVideos || 0;
  const videoCount = channel.videoCount || 1; // Avoid division by zero
  return Math.round(((likedVideos + commentedVideos) / videoCount) * 100);
}

// Update chart based on view mode
function updateChart(data, viewMode = 'day') {
  // Sample data for the chart
  // In a real implementation, this would use actual data from the analytics
  const chartData = [15, 25, 30, 22, 18, 35, 42];
  
  watchTimeChart.data.datasets[0].data = chartData;
  watchTimeChart.update();
}

// Change view mode (day, week, month)
function changeViewMode(mode) {
  // Update active button
  const buttons = ['dayView', 'weekView', 'monthView'];
  buttons.forEach(btn => {
    const element = document.getElementById(btn);
    if (btn === `${mode}View`) {
      element.className = 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-md text-xs font-medium';
    } else {
      element.className = 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-medium';
    }
  });
  
  // Load data and update chart for the selected time period
  chrome.storage.local.get('youtubeAnalytics', function(data) {
    if (data.youtubeAnalytics) {
      updateChart(data.youtubeAnalytics, mode);
    }
  });
}

// Filter channels by search input
function filterChannels() {
  const searchTerm = document.getElementById('channelSearch').value.toLowerCase();
  const channelCards = document.getElementById('channelList').children;
  
  Array.from(channelCards).forEach(card => {
    const channelName = card.querySelector('h3').textContent.toLowerCase();
    if (channelName.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Export data as CSV
function exportDataAsCSV() {
  chrome.storage.local.get('youtubeAnalytics', function(data) {
    if (!data.youtubeAnalytics) return;
    
    const channels = data.youtubeAnalytics.channels || {};
    const channelRows = [];
    
    // CSV header
    channelRows.push('Channel,Videos Watched,Watch Time (minutes),Likes,Comments,Engagement Rate');
    
    // Add channel data
    Object.keys(channels).forEach(channelId => {
      const channel = channels[channelId];
      const engagementRate = calculateChannelEngagement(channel);
      
      channelRows.push(`"${channel.title || 'Unknown Channel'}",${channel.videoCount || 0},${channel.totalWatchTime || 0},${channel.likedVideos || 0},${channel.commentedVideos || 0},${engagementRate}%`);
    });
    
    // Generate CSV content
    const csvContent = channelRows.join('\n');
    
    // Download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  });
}

// Export data as JSON
function exportDataAsJSON() {
  chrome.storage.local.get('youtubeAnalytics', function(data) {
    if (!data.youtubeAnalytics) return;
    
    // Generate JSON content
    const jsonContent = JSON.stringify(data.youtubeAnalytics, null, 2);
    
    // Download the JSON file
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youtube-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  });
}
