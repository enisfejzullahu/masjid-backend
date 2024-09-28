const express = require("express");
const Announcement = require("../models/announcement");

const router = express.Router();

// Get all announcements
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.json(announcements);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get announcements for a specific mosque
router.get("/mosque/:mosqueId", async (req, res) => {
  try {
    const announcements = await Announcement.find({
      mosqueId: req.params.mosqueId,
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
