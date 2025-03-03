const express = require("express");
const router = express.Router();
const firebaseAdmin = require("../firebaseadmin"); // Importing the whole module
const { db, admin } = firebaseAdmin; // Destructure messaging from the imported object
const {
  collection,
  getDocs,
  Timestamp,
  query,
  where,
} = require("firebase/firestore");
const jwt = require("jsonwebtoken");
const {
  authenticate,
  authorize,
  authorizeSuperAdmin,
} = require("../authMiddleware");

// Middleware to verify the Firebase token
// const authenticate = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1]; // Extract the token from "Bearer <token>"

//   if (!token) {
//     return res.status(401).send("Unauthorized: No token provided");
//   }

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(token);
//     // console.log("Decoded Token:", decodedToken); // Log the entire decoded token
//     req.user = decodedToken; // Attach the user's details to the request
//     next();
//   } catch (error) {
//     console.error("Authentication error:", error);
//     res.status(401).send("Unauthorized: Invalid token");
//   }
// };

// const authorize = (req, res, next) => {
//   const { role, mosqueId, fullName } = req.user; // Extract user details from the request
//   const requestedMosqueId = req.params.id; // Get the mosqueId from the request parameters

//   console.log("User role:", role);
//   console.log("User mosqueId:", mosqueId);
//   console.log("Requested mosqueId:", requestedMosqueId);
//   console.log("Requested Full Name:", fullName);

//   // Allow super-admins to edit any mosque
//   if (role === "super-admin") {
//     return next();
//   }

//   // Ensure mosque-admins have an assigned mosqueId
//   if (role === "mosque-admin") {
//     if (!mosqueId) {
//       return res.status(403).send("Forbidden: mosque-admin must have a mosqueId assigned");
//     }

//     // Ensure the mosque-admin can only edit their assigned mosque
//     if (mosqueId !== requestedMosqueId) {
//       return res.status(403).send("Forbidden: Cannot edit this mosque");
//     }

//     return next();
//   }

//   // If the user is neither a super-admin nor a valid mosque-admin
//   return res.status(403).send("Forbidden: Insufficient permissions");
// };

// // Middleware to authorize only super-admin to delete mosque
// const authorizeSuperAdmin = (req, res, next) => {
//   const { role } = req.user; // Get user role from the request

//   // Allow only super-admin to delete a mosque
//   if (role === "super-admin") {
//     return next(); // Proceed to the next middleware (route handler)
//   }

//   // If the user is not a super-admin, deny access
//   return res.status(403).send("Forbidden: Only super-admins can delete a mosque");
// };

// // Add a new mosque
// router.post("/", async (req, res) => {
//   try {
//     const newMosque = req.body;
//     const docRef = await db.collection("mosques").add(newMosque);
//     res.status(201).send({ id: docRef.id });
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });
router.post("/add-mosque", async (req, res) => {
  try {
    const {
      emri,
      adresa,
      imageUrl,
      kontakti,
      website,
      disponueshmeria,
      customId,
    } = req.body;

    // Use the custom ID if provided, otherwise fallback to a default generated ID
    const mosqueRef = db
      .collection("mosques")
      .doc(customId || emri.toLowerCase().replace(/\s+/g, "-"));

    // Create a new mosque document with the custom ID
    await mosqueRef.set({
      emri,
      adresa,
      imageUrl,
      kontakti,
      website,
      disponueshmeria,
    });

    res.status(201).send({ id: mosqueRef.id });
  } catch (error) {
    console.error("Error adding mosque: ", error);
    res.status(500).send("Error adding mosque");
  }
});

// Get all mosques
router.get("/", async (req, res) => {
  try {
    const mosquesSnapshot = await db.collection("mosques").get();
    const mosques = mosquesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).send(mosques);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update mosque details
router.put("/:id", authenticate, authorize, async (req, res) => {
  try {
    const mosqueRef = db.collection("mosques").doc(req.params.id);
    await mosqueRef.update(req.body);
    res.status(200).send("Mosque updated successfully");
  } catch (error) {
    console.error("Error updating mosque:", error);
    res.status(500).send("Error updating mosque");
  }
});

// DELETE mosque details (only super-admin can delete)
router.delete("/:id", authenticate, authorizeSuperAdmin, async (req, res) => {
  try {
    const mosqueRef = db.collection("mosques").doc(req.params.id);
    await mosqueRef.delete();
    res.status(200).send("Mosque deleted successfully");
  } catch (error) {
    console.error("Error deleting mosque:", error);
    res.status(500).send("Error deleting mosque");
  }
});

// Get mosque by ID and its subcollection
router.get("/:id", async (req, res) => {
  const mosqueId = req.params.id;

  try {
    // Get the mosque document
    const mosqueDoc = await db.collection("mosques").doc(mosqueId).get();
    if (!mosqueDoc.exists) {
      return res.status(404).send("Mosque not found");
    }

    // Get the subcollection documents (e.g., "prayerTimes")
    const prayerTimesSnapshot = await db
      .collection("mosques")
      .doc(mosqueId)
      .collection("kohet-e-namazit")
      .get();

    const prayerTimes = prayerTimesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        Date: data.Date.toDate().toLocaleDateString("en-GB"), // Format: "DD/MM/YYYY"
        Imsaku: data.Imsaku.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Dreka: data.Dreka.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Ikindia: data.Ikindia.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Akshami: data.Akshami.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Jacia: data.Jacia.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
      };
    });

    res.status(200).send({
      id: mosqueDoc.id,
      ...mosqueDoc.data(),
      prayerTimes,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get mosque by ID and its subcollection
router.get("/:id/today", async (req, res) => {
  const mosqueId = req.params.id;

  try {
    // Get the mosque document
    const mosqueDoc = await db.collection("mosques").doc(mosqueId).get();
    if (!mosqueDoc.exists) {
      return res.status(404).send("Mosque not found");
    }

    // Get today's date as a string in the same format as the Date field in your documents
    const today = new Date();
    const todayDateString = today.toLocaleDateString("en-GB"); // Format: "M/D/YYYY" or "MM/DD/YYYY"

    const prayerTimesSnapshot = await db
      .collection("mosques")
      .doc(mosqueId)
      .collection("kohet-e-namazit")
      .get();

    const prayerTimes = prayerTimesSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        Date: data.Date.toDate().toLocaleDateString("en-GB"), // Format: "DD/MM/YYYY"
        Imsaku: data.Imsaku.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Agimi: data.Agimi
          ? data.Agimi.toDate().toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "N/A", // Handle cases where Agimi might be undefined or null
        Dreka: data.Dreka.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Ikindia: data.Ikindia.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Akshami: data.Akshami.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Jacia: data.Jacia.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
      };
    });

    // Filter prayer times to include only those for today's date
    const todaysPrayerTimes = prayerTimes.filter(
      (pt) => pt.Date === todayDateString
    );

    res.status(200).send({
      id: mosqueDoc.id,
      ...mosqueDoc.data(),
      prayerTimes: todaysPrayerTimes,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get mosque by ID and its subcollection for tomorrow's prayer times
router.get("/:id/tomorrow", async (req, res) => {
  const mosqueId = req.params.id;

  try {
    // Get the mosque document
    const mosqueDoc = await db.collection("mosques").doc(mosqueId).get();
    if (!mosqueDoc.exists) {
      return res.status(404).send("Mosque not found");
    }

    // Get tomorrow's date as a string in the same format as the Date field in your documents
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Move to the next day
    const tomorrowDateString = tomorrow.toLocaleDateString("en-GB"); // Format: "DD/MM/YYYY"

    const prayerTimesSnapshot = await db
      .collection("mosques")
      .doc(mosqueId)
      .collection("kohet-e-namazit")
      .get();

    const prayerTimes = prayerTimesSnapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        Date: data.Date.toDate().toLocaleDateString("en-GB"), // Format: "DD/MM/YYYY"
        Imsaku: data.Imsaku.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Agimi: data.Agimi
          ? data.Agimi.toDate().toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "N/A", // Handle cases where Agimi might be undefined or null
        Dreka: data.Dreka.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Ikindia: data.Ikindia.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Akshami: data.Akshami.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
        Jacia: data.Jacia.toDate().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }), // 24-hour format
      };
    });

    // Filter prayer times to include only those for tomorrow's date
    const tomorrowsPrayerTimes = prayerTimes.filter(
      (pt) => pt.Date === tomorrowDateString
    );

    res.status(200).send({
      id: mosqueDoc.id,
      ...mosqueDoc.data(),
      prayerTimes: tomorrowsPrayerTimes,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Endpoint to get donation types for a specific mosque
router.get("/:id/donacionet", async (req, res) => {
  const mosqueId = req.params.id;

  try {
    // Get the mosque document to ensure it exists
    const mosqueDoc = await db.collection("mosques").doc(mosqueId).get();
    if (!mosqueDoc.exists) {
      return res.status(404).send("Mosque not found");
    }

    // Get the donation types from the 'donacionet' collection
    const donationsSnapshot = await db
      .collection("mosques")
      .doc(mosqueId)
      .collection("donacionet")
      .get();

    // Map the donation types to an array of objects
    const donations = donationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title, // Title of the donation type
        description: data.description, // Description of the donation type
        goal: data.goal, // Goal amount for the donation
        currentAmount: data.currentAmount, // Current amount raised for the donation
      };
    });

    res.status(200).send({
      id: mosqueDoc.id,
      ...mosqueDoc.data(),
      donations: donations,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:mosqueId/donacionet/:typeId/donors", async (req, res) => {
  const { mosqueId, typeId } = req.params;

  try {
    // Check if the mosque document exists
    const mosqueDoc = await db.collection("mosques").doc(mosqueId).get();
    if (!mosqueDoc.exists) {
      return res.status(404).send("Mosque not found");
    }

    // Check if the donation type document exists
    const typeDoc = await db
      .collection("mosques")
      .doc(mosqueId)
      .collection("donacionet")
      .doc(typeId)
      .get();
    if (!typeDoc.exists) {
      return res.status(404).send("Donation type not found");
    }

    // Get the donations from the 'donors' subcollection under the donation type
    const donorsRef = db
      .collection("mosques")
      .doc(mosqueId)
      .collection("donacionet")
      .doc(typeId)
      .collection("donors");

    // Fetch the donors from Firestore
    const donorsSnapshot = await donorsRef.orderBy("date", "desc").get();

    // Map the donors to an array of objects
    const donations = donorsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        donorName: data.donorName,
        donorEmail: data.donorEmail,
        amount: data.amount,
        donationType: data.donationType,
        state: data.state,
        date: data.date.toDate().toLocaleDateString("en-GB"), // Format the timestamp
      };
    });

    // Send the response including mosque data and donations
    res.status(200).send({
      id: mosqueDoc.id,
      ...mosqueDoc.data(),
      donations: donations,
    });
  } catch (error) {
    console.error("Error fetching donations: ", error);
    res.status(500).send("Error fetching donations");
  }
});

router.post("/:mosqueId/donacionet/:typeId/donors", async (req, res) => {
  const { mosqueId, typeId } = req.params;
  const {
    donorName,
    donorEmail,
    amount,
    cardNumber,
    cvc,
    expiryMonth,
    expiryYear,
    state,
  } = req.body;

  try {
    // Validate required fields
    if (
      !donorName ||
      !donorEmail ||
      !amount ||
      !cardNumber ||
      !cvc ||
      !expiryMonth ||
      !expiryYear
    ) {
      return res.status(400).send("All required fields must be provided.");
    }

    // Add a new donation to the 'donors' collection under the specified donation type
    const newDonation = {
      donorName,
      donorEmail,
      amount,
      cardNumber, // Note: Sensitive data should be handled securely in a real-world scenario
      cvc, // Consider using third-party services to tokenize this information
      expiryMonth,
      expiryYear,
      state: state || "Pending", // Default to 'Pending' if no state is provided
      date: new Date(), // Use current timestamp for the donation
    };

    await db
      .collection("mosques")
      .doc(mosqueId)
      .collection("donacionet")
      .doc(typeId)
      .collection("donors")
      .add(newDonation);

    res.status(201).send("Donation successfully created.");
  } catch (error) {
    console.error("Error adding donation: ", error);
    res.status(500).send("Error creating donation.");
  }
});

// Get all announcements for a specific mosque by ID
router.get("/:id/announcements", async (req, res) => {
  const mosqueId = req.params.id;

  try {
    // Get the mosque document to ensure it exists
    const mosqueDoc = await db.collection("mosques").doc(mosqueId).get();
    if (!mosqueDoc.exists) {
      return res.status(404).send("Mosque not found");
    }

    // Get the announcements from the 'njoftimet' collection
    const announcementsSnapshot = await db
      .collection("mosques")
      .doc(mosqueId)
      .collection("njoftimet")
      .orderBy("Date", "desc") // Order announcements by Date, descending
      .get();

    // Map the announcements to an array of objects
    const announcements = announcementsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.Text,
        date: data.Date.toDate().toLocaleDateString("en-GB"), // Format the date
        imageUrl: data.Image || null, // Handle the image URL, if available
      };
    });

    res.status(200).send({
      id: mosqueDoc.id,
      ...mosqueDoc.data(),
      announcements: announcements,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all events for a specific mosque by ID
router.get("/:id/eventet", async (req, res) => {
  const mosqueId = req.params.id;

  try {
    // Get the mosque document to ensure it exists
    const mosqueDoc = await db.collection("mosques").doc(mosqueId).get();
    if (!mosqueDoc.exists) {
      return res.status(404).send("Mosque not found");
    }

    // Get the events from the 'events' collection
    const eventsSnapshot = await db
      .collection("mosques")
      .doc(mosqueId)
      .collection("eventet")
      .orderBy("date", "asc") // Order events by date, ascending
      .get();

    // Map the events to an array of objects
    const events = eventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        date: data.date, // Convert timestamp to ISO string
      };
    });

    res.status(200).send({
      id: mosqueDoc.id,
      events: events,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get the "Historiku" for a specific mosque by ID
// router.get("/:id/historiku", async (req, res) => {
//   const mosqueId = req.params.id;

//   try {
//     // Get the mosque document to ensure it exists
//     const mosqueDoc = await db.collection("mosques").doc(mosqueId).get();
//     if (!mosqueDoc.exists) {
//       return res.status(404).send("Mosque not found");
//     }

//     // Get the first document from the 'historiku' subcollection
//     const historikuSnapshot = await db
//       .collection("mosques")
//       .doc(mosqueId)
//       .collection("historiku")
//       .limit(1) // Get the first document (if any)
//       .get();

//     if (historikuSnapshot.empty) {
//       return res.status(404).send("Historiku not found for this mosque");
//     }

//     // Assuming there's only one document in 'historiku'
//     const historikuDoc = historikuSnapshot.docs[0];
//     const data = historikuDoc.data();

//     // Return the historiku data
//     res.status(200).send({
//       id: mosqueDoc.id,
//       title: data.title,
//       text: data.text,
//       image: data.image,
//       photos: data.photos,
//     });
//   } catch (error) {
//     res.status(500).send("Error fetching historiku: " + error.message);
//   }
// });
// POST: Add Historiku Only If None Exists
router.post("/:id/historiku", authenticate, authorize, async (req, res) => {
  const mosqueId = req.params.id;
  const { title, text, imageUrl, photos } = req.body;

  if (!title || !text || !imageUrl) {
    return res.status(400).send("Title, text, and imageUrl are required.");
  }

  try {
    const historikuCollection = admin
      .firestore()
      .collection("mosques")
      .doc(mosqueId)
      .collection("historiku");

    const existingHistoriku = await historikuCollection.limit(1).get();

    if (!existingHistoriku.empty) {
      return res
        .status(400)
        .send(
          "A Historiku document already exists. Please use the PUT endpoint to update it."
        );
    }

    const newHistorikuRef = historikuCollection.doc(); // Randomly generated ID
    await newHistorikuRef.set({
      title,
      text,
      imageUrl,
      photos: photos || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).send("Historiku added successfully.");
  } catch (error) {
    console.error("Error adding historiku entry:", error);
    res.status(500).send("Failed to add historiku entry.");
  }
});

// PUT: Update the Single Historiku Document
router.put("/:id/historiku", authenticate, authorize, async (req, res) => {
  const mosqueId = req.params.id;
  const { title, text, imageUrl, photos } = req.body;

  if (!title || !text || !imageUrl) {
    return res.status(400).send("Title, text, and imageUrl are required.");
  }

  try {
    const historikuCollection = admin
      .firestore()
      .collection("mosques")
      .doc(mosqueId)
      .collection("historiku");

    const existingHistoriku = await historikuCollection.limit(1).get();

    if (existingHistoriku.empty) {
      return res
        .status(404)
        .send(
          "No Historiku found. Please use the POST endpoint to create one."
        );
    }

    const historikuDoc = existingHistoriku.docs[0];
    await historikuCollection.doc(historikuDoc.id).set(
      {
        title,
        text,
        imageUrl,
        photos: photos || [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true } // Merge fields instead of overwriting completely
    );

    res.status(200).send("Historiku updated successfully.");
  } catch (error) {
    console.error("Error updating historiku entry:", error);
    res.status(500).send("Failed to update historiku entry.");
  }
});

// GET Historiku Entries
router.get("/:id/historiku", async (req, res) => {
  const mosqueId = req.params.id;

  try {
    const historikuSnapshot = await admin
      .firestore()
      .collection("mosques")
      .doc(mosqueId)
      .collection("historiku")
      .get();

    if (historikuSnapshot.empty) {
      return res.status(404).send("No historiku entries found.");
    }

    const historiku = historikuSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(historiku);
  } catch (error) {
    console.error("Error fetching historiku entries:", error);
    res.status(500).send("Failed to fetch historiku entries.");
  }
});

// DELETE Historiku Entry
router.delete(
  "/:id/historiku/:historikuId",
  authenticate,
  authorize,
  async (req, res) => {
    const mosqueId = req.params.id;
    const historikuId = req.params.historikuId;

    try {
      const historikuRef = admin
        .firestore()
        .collection("mosques")
        .doc(mosqueId)
        .collection("historiku")
        .doc(historikuId);

      await historikuRef.delete();
      res.status(200).send("Historiku entry deleted successfully.");
    } catch (error) {
      console.error("Error deleting historiku entry:", error);
      res.status(500).send("Failed to delete historiku entry.");
    }
  }
);

// Announcements
router.post("/:id/njoftimet", authenticate, authorize, async (req, res) => {
  const mosqueId = req.params.id;
  const { title, text, datePosted, imageUrl } = req.body;

  if (!title || !text || !datePosted) {
    return res.status(400).send("Title, text, and datePosted are required.");
  }

  try {
    const announcementsCollection = admin
      .firestore()
      .collection("mosques")
      .doc(mosqueId)
      .collection("njoftimet");

    const newAnnouncementRef = announcementsCollection.doc();
    await newAnnouncementRef.set({
      title,
      text,
      datePosted,
      imageUrl: imageUrl || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).send("Announcement added successfully.");
  } catch (error) {
    console.error("Error adding announcement:", error);
    res.status(500).send("Failed to add announcement.");
  }
});

router.get("/:id/njoftimet", authenticate, authorize, async (req, res) => {
  const mosqueId = req.params.id;

  try {
    const announcementsSnapshot = await admin
      .firestore()
      .collection("mosques")
      .doc(mosqueId)
      .collection("njoftimet")
      .get();

    if (announcementsSnapshot.empty) {
      return res.status(404).send("No announcements found.");
    }

    const announcements = announcementsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).send("Failed to fetch announcements.");
  }
});

// PUT request to update an announcement
router.put(
  "/:id/njoftimet/:announcementId",
  authenticate,
  authorize,
  async (req, res) => {
    const mosqueId = req.params.id;
    const announcementId = req.params.announcementId;
    const updatedData = req.body;

    try {
      const announcementRef = admin
        .firestore()
        .collection("mosques")
        .doc(mosqueId)
        .collection("njoftimet")
        .doc(announcementId);

      const announcementSnapshot = await announcementRef.get();

      if (!announcementSnapshot.exists) {
        return res.status(404).send("Announcement not found.");
      }

      await announcementRef.update(updatedData);
      res.status(200).send("Announcement updated successfully.");
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).send("Failed to update announcement.");
    }
  }
);

// DELETE request to delete an announcement
router.delete(
  "/:id/njoftimet/:announcementId",
  authenticate,
  authorize,
  async (req, res) => {
    const mosqueId = req.params.id;
    const announcementId = req.params.announcementId;

    try {
      const announcementRef = admin
        .firestore()
        .collection("mosques")
        .doc(mosqueId)
        .collection("njoftimet")
        .doc(announcementId);

      const announcementSnapshot = await announcementRef.get();

      if (!announcementSnapshot.exists) {
        return res.status(404).send("Announcement not found.");
      }

      await announcementRef.delete();
      res.status(200).send("Announcement deleted successfully.");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).send("Failed to delete announcement.");
    }
  }
);

module.exports = router;
