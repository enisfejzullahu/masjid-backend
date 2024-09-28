const express = require('express');
const router = express.Router();
const db = require('../firebaseadmin'); // Adjust the path as needed

// Add new prayer times
router.post('/', async (req, res) => {
  try {
    const newPrayerTimes = req.body;
    const docRef = await db.collection('prayerTimes').add(newPrayerTimes);
    res.status(201).send({ id: docRef.id });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/together', async (req, res) => {
  const getCombinedMosquesWithPrayerTimes = async () => {
    try {
      const mosquesSnapshot = await db.collection('mosques').get();
      const prayerTimesSnapshot = await db.collection('prayerTimes').get();
  
      const mosques = mosquesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const prayerTimes = prayerTimesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      const combinedData = mosques.map(mosque => {
        const mosquePrayerTimes = prayerTimes.filter(pt => pt.mosqueId === mosque.id);
        return { ...mosque, prayerTimes: mosquePrayerTimes };
      });
  
      return combinedData;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  // Example usage
  getCombinedMosquesWithPrayerTimes().then(combinedData => {
    console.log(JSON.stringify(combinedData, null, 2));
  });
  
})

router.get('/', async(req,res) => {
  try {
    const prayerTimesSnapshot = await db.collection('prayerTimes').get();
    const prayerTimes = prayerTimesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(prayerTimes);
  }
catch (error) {
  res.status(500).send(error);
}
})

// Get all prayer times for a specific mosque
router.get('/:mosqueId', async (req, res) => {
  try {
    const mosqueId = req.params.mosqueId;
    const prayerTimesSnapshot = await db.collection('prayerTimes').where('mosqueId', '==', mosqueId).get();
    const prayerTimes = prayerTimesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(prayerTimes);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
