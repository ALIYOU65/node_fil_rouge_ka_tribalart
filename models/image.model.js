import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  alt: {
    type: String
  },
  images: [
    {
      url: { type: String, required: true },
      filename: { type: String } 
    }
  ]
}, { timestamps: true });

export default mongoose.model('Image', imageSchema);

