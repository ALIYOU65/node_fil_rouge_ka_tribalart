import User from "../models/user.model.js"
import userValidation from "../validations/user.validation.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const register = async(req,res)=>{
    try {
        const {body} = req
        if(!body){
            return res.status(400).json({message: "Pas de données dans la requête"})
        }
        const {error} = userValidation(body).userCreate
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        const searchUser = await User.findOne({email: body.email})
        if(searchUser){
            return res.status(401).json({message: "L'utilisateur n'existe pas"})
        }
        const user = new User(body)
        const newUser = await user.save()
        return res.status(201).json(newUser)        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const login = async(req, res) => {
    try {
        const {email, password } = req.body
        const { error } = userValidation(req.body).userLogin
    
        if(error){
            return res.status(401).json(error.details[0].message)
        }

        const user = await User.findOne({ email: email})
        if(!user){
            return res.status(400).json({message: "Les informations d'identification invalides"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message: "invalide invalides"})
        }
        res.status(200).json({
            message: user.email+" est connecté",
             role: user.role,  // Ajout du rôle
            token: jwt.sign({ id: user._id, email:  user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: "24h" }) // Ajout du rôle dans le token
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error}) 
    }
}

const getAllUsers = async(req, res) => {
    try {
        const users = await User.find()

        console.log('Users found:', users); // Loguez les résultats bruts
        console.log('Total users:', users.length); // Loguez le nombre des utilisateurs

        return res.status(200).json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const getUserById = async(req,res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user){
            return res.status(404).json({message: "L'utilisateur n'existe pas"})
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const updateUser = async(req,res) => {
    try {
        const {body} = req
        if(!body){
            return res.status(400).json({message: "Pas de données dans la requête"})
        }

        const {error} = userValidation(body).userUpdate
        if(error){
            return res.status(401).json(error.details[0].message)
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id, body, {new: true})
        if(!updatedUser){
            res.status(404).json({message: "L'utilisateur n'existe pas"})
        }
        return res.status(200).json(updatedUser)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

const deleteUser = async(req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            return res.status(404).json({message: "L'utilisateur n'existe pas"})
        }
        return res.status(200).json({message: "L'utilisateur a été supprimé"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Erreur serveur", error: error})
    }
}

export { register, login, getAllUsers, getUserById, updateUser, deleteUser }