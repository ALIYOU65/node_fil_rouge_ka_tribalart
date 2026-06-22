import mongoose from "mongoose";

const ligneCommandeSchema = new mongoose.Schema({
  quantite: { 
    type: Number, 
    required: true 
  },
  prixTotal: { 
    type: Number, 
    required: true 
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
    required: true
  },
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Commande",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("LigneCommande", ligneCommandeSchema);



























// import mongoose from "mongoose";

// const ligneCommandeSchema = new mongoose.Schema({
//   quantite: { 
//     type: Number, 
//     required: true 
// },
//   prixTotal: { 
//     type: Number, 
//     required: true 
// },
//   article: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Article",
//     required: true
//   },
//   commande: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Commande",
//     required: true
//   }
// }, { timestamps: true });

// export default mongoose.model("LigneCommande", ligneCommandeSchema);
