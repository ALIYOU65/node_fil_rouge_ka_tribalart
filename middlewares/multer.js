import multer from "multer";
import path from "node:path"; // permet de manipuler les fichiers/dossiers
import fs from "node:fs"; // permet de lire/écrire/supprimer/créer des fichiers/dossiers
import { fileURLToPath } from "node:url"; // permet d'accéder à __dirname et __filename avec ES Modules ({"type": dans package.json})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// création du dossier /uploads
const uploadDir = path.join(__dirname, '../uploads')
if(!fs.existsSync(uploadDir)) {fs.mkdirSync(uploadDir, {recursive: true})}

// config du stockage de multer
const storage = multer.diskStorage({
    // destination du fichier
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    // On renomme le fichier pour éviter les doublons
    filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${baseName}_${Date.now()}${ext}`);
}
})

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
    if(allowedMimeTypes.includes(file.mimetype)){
       cb(null, true)
    }else{
        cb(new Error("Type de fichier non autorisé"), false)
    }
}
 
export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024,
        files: 5,
    }
})

// Middleware pour accepter plusieurs fichiers sous le champ "images"
export const uploadImages = upload.array('images', 5) // 'images' = nom du champ, 5 = nombre max de fichiers










