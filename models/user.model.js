import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    prenom: {
      type: String,
      required: true
    },
    nom: {
      type: String
    },
    role: {
      type: String, 
      enum: ["ADMIN", "CLIENT", "VISITEUR"] 
    }
}, { timestamps: true });

userSchema.pre("save", async function(){
  if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10)
  }
})

userSchema.pre("findOneAndUpdate", async function () {
  let update = this.getUpdate();

  if (update.password) {
    const hashed = await bcrypt.hash(update.password, 10);

    this.setUpdate({
      ...update,
      password: hashed
    });
  }
})

export default mongoose.model('User', userSchema);
