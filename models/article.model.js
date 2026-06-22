import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    nom: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    prix: {
      type: Number,
    },
    origine: {
      type: String,
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categorie",
    }],
    images: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    }]
}, { timestamps: true,
  collection: "articles"
});

export default mongoose.model('Article', articleSchema);
