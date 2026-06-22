import mongoose from 'mongoose';

const panierSchema = new mongoose.Schema({
  statut: {
    type: String,
    enum: ["EN_COURS", "VALIDE"],
    default: "EN_COURS",
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  montantTotal: {
    type: Number,
    default: 0
  },
  
    articles: [
    {
      articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true,
      },
       prix: {
      type: Number,
      required: true,
      },
      quantite: {
        type: Number,
        default: 1,
      },
    },
  ],

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true 
  },
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Commande"
  }
}, { timestamps: true });

export default mongoose.model("Panier", panierSchema);
