import mongoose from 'mongoose';

const commandeSchema = new mongoose.Schema({
  numero: { 
    type: String, 
    required: true, 
    unique: true 
},
  date: { 
    type: Date, 
    default: 
    Date.now 
},
  statut: { 
    type: String, 
    enum: ["EN_ATTENTE", "PAYEE", "LIVREE"], 
    default: "EN_ATTENTE"
  },
  prixTotal: { 
    type: Number, 
    required: true 
},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  panier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Panier",
    required: false
  },
  ligneCommandes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "LigneCommande"
  }]
}, { timestamps: true });

export default mongoose.model("Commande", commandeSchema);
