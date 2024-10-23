const fs = require('fs');
const path = require('path');

// Load prayer times from local JSON file
const loadPrayerTimes = () => {
  const filePath = path.join(__dirname, '', 'PrayerTimesKS.json'); // Construct the file path
  console.log('Loading prayer times from:', filePath); // Log the file path for verification

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath); // Log an error if the file is not found
    return null; // Return null if the file doesn't exist
  }

  try {
    const rawData = fs.readFileSync(filePath, 'utf8'); // Read the file as a string
    return JSON.parse(rawData); // Parse the JSON string into an object
  } catch (error) {
    console.error('Error loading prayer times:', error.message); // Log any errors
    return null; // Return null if there was an error
  }
};

module.exports = loadPrayerTimes;
