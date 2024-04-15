import mongoose from "mongoose";

//gallery schema
const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  photoUrl: {
    type: String,
    trim: true,
  },
  photoDescription: {
    type: String,
    trim: true,
  },
});

const Gallery = mongoose.model("Gallery", gallerySchema);
export { Gallery };
