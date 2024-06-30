const express = require("express");
const router = express.Router();
const Partner = require("../models/partnerModels");
router.get("/", async (req, res) => {
  try {
    const allPartners = await Partner.find();
    return res.status(200).json({ allPartners });
  } catch (error) {
    console.error("Error fetching partners: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
