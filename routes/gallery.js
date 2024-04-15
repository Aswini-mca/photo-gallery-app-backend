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

//Api to get all photos
router.get("/all-photos", async (req, res) => {
  try {
    const photos = await Gallery.find();
    if (photos) {
      return res.status(202).json({ photos });
    } else {
      return res
        .status(400)
        .send({ error: "Error occured while getting the photos" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

//Api to edit a photo
router.put("/edit-photo/:id", async (req, res) => {
  const { title, photoUrl, photoDescription } = req.body;
  try {
    const { id } = req.params;
    //update photo details
    const photo = await Gallery.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          title,
          photoUrl,
          photoDescription,
        },
      },
      { new: true }
    );
    return res
      .status(201)
      .send({ photo: photo, message: "Updated photo details successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

//Api to delete a photo
router.delete("/delete-photo/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const photo = await Gallery.findByIdAndDelete({ _id: id });
    if (!photo) {
      return res.status(400).send({ error: "Not able to delete" });
    }
    return res.status(200).send({ message: "Photo deleted Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

export const galleryRouter = router;
