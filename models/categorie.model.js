import mongoose from 'mongoose';

const categorieSchema = new mongoose.Schema({
    nom: {  
      type: String, 
      required: true, 
      // unique: true
    }
}, { timestamps: true });

export default mongoose.model('Categorie', categorieSchema);
