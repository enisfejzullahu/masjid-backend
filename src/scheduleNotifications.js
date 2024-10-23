const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { sendPushNotification } = require('../notificationService'); // Ensure your sendPushNotification function is imported
const loadPrayerTimes = require('../database/loadPrayerTimes'); 
const db = require('../database/db'); 

// Helper function to calculate notification time
const calculateNotificationTime = (prayerTime, minutesBefore) => {
  const [hour, minute] = prayerTime.split(':').map(Number);
  const notificationTime = new Date();
  notificationTime.setHours(hour);
  notificationTime.setMinutes(minute - minutesBefore);
  console.log(`Calculated notification time for ${prayerTime}: ${notificationTime}`);
  return notificationTime;
};

const sendPrayerTimeNotifications = async () => {
  console.log('Fetching prayer times...');
  const prayerTimesDataKS = loadPrayerTimes();

  const prayerTimesWithNotifications = {
    Imsaku: {
      time: prayerTimesDataKS.Imsaku,
      notificationTime: calculateNotificationTime(prayerTimesDataKS.Imsaku, 5),
    },
    Agimi: {
      time: prayerTimesDataKS.Agimi,
      notificationTime: calculateNotificationTime(prayerTimesDataKS.Agimi, 5),
    },
    Dreka: {
      time: prayerTimesDataKS.Dreka,
      notificationTime: calculateNotificationTime(prayerTimesDataKS.Dreka, 5),
    },
    Ikindia: {
      time: prayerTimesDataKS.Ikindia,
      notificationTime: calculateNotificationTime(prayerTimesDataKS.Ikindia, 5),
    },
    Akshami: {
      time: prayerTimesDataKS.Akshami,
      notificationTime: calculateNotificationTime(prayerTimesDataKS.Akshami, 5),
    },
    Jacia: {
      time: prayerTimesDataKS.Jacia,
      notificationTime: calculateNotificationTime(prayerTimesDataKS.Jacia, 5),
    },
  };

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  console.log(`Current time: ${now.toLocaleTimeString()}`);

  for (const [prayer, details] of Object.entries(prayerTimesWithNotifications)) {
    const notificationTime = details.notificationTime;
    const notificationHour = notificationTime.getHours();
    const notificationMinute = notificationTime.getMinutes();

    // Check if the current time matches the notification time
    if (currentHour === notificationHour && currentMinute === notificationMinute) {
      console.log(`Sending notification for ${prayer} at ${now.toLocaleTimeString()}`);
      
      // Fetch users' Expo push tokens (assuming you have a way to get these)
      const users = await db.collection('users').get();
      console.log(`Found ${users.size} users to send notifications to.`);

      users.forEach((userDoc) => {
        const userData = userDoc.data();
        const expoPushToken = userData.expoPushToken; // Ensure this field exists
        
        if (expoPushToken) {
          console.log(`Sending notification to user with token: ${expoPushToken}`);
          sendPushNotification(expoPushToken, `${prayer} Time`, `It's time for ${prayer}.`);
        } else {
          console.warn('No expoPushToken found for user:', userData);
        }
      });
    }
  }
};

// Schedule the job to run every minute
cron.schedule('* * * * *', sendPrayerTimeNotifications);
console.log('Scheduled prayer time notifications to run every minute.');
