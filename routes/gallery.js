import express from "express";
import { Gallery } from "../models/gallery.js";

const router = express.Router();

//Api to add new photo
router.post("/add-photo", async (req, res) => {
  const { title, photoUrl, photoDescription } = req.body;
  try {
    const newPhoto = await new Gallery({
      title,
      photoUrl,
      photoDescription,
    }).save();
    if (!newPhoto) {
      return res
        .status(400)
        .send({ error: "Error occured while saving the photo" });
    }
    res
      .status(201)
      .json({ photoData: newPhoto, message: "Photo saved successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

export const galleryRouter = router;