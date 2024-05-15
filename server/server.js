import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import cors from 'cors';
import AWS from 'aws-sdk';
import Blog from './Schema/Blog.js';
// import { Storage } from '@google-cloud/storage';


//Schema import

import User from "./Schema/User.js"
import { nanoid } from 'nanoid';
// import Multer from 'multer';


const server = express();
let PORT = 3000;
// const Minio = require('minio');

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors());

mongoose.connect(process.env.DB_LOCATION, { autoIndex: true})

// const minioClient = new Minio.Client({
//     endPoint: 'localhost',
//     port: 9000,
//     useSSL: false,
//     accessKey: 'minioadmin',
//     secretKey: 'minioadmin',
// });

// minioClient.makeBucket('my-bucket', 'us-east-1', function(err) {
//     if (err) {
//       console.error('Error:', err);
//     } else {
//       console.log('Bucket created successfully');
//     }
// });

// const multer = Multer({
//     storage: Multer.memoryStorage(),
//     limits : {
//         fileSize: 5*1024*1024
//     }
// })

// let projectId = 'agile-falcon-415016'
// let keyFilename = ''
// const storage = new Storage({
//     projectId,
//     keyFilename
// });
// const bucket = storage.bucket('')

// server.post('get-upload-url', multer.single('imgfile'), (req,res)=>{
//     try {
//         if (req.file) {
//             const blob = bucket.file(req.file.originalname);
//             const blobStream = blob.createWriteStream();
//         }
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // endpoint: process.env.AWS_ENDPOINT,
    // s3ForcePathStyle: true,
    // sslEnabled: false
})

const generateUploadUrl = async () => {

    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket: process.env.AWS_BUCKET,
        Key: imageName,
        Expires: 1000,
        ContentType: "image/jpeg"
    })
}

const verifyJWT = (req, res, next) => {
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null){
        return res.status(401).json({error:"Accés refusé à cet élément"});
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY,(err, user) => {
        if(err){
            return res.status(403).json({error: "Code d'accés invalide"})
        }

        req.user = user.id 
        next()
    })
}

const formatDatatoSend = (user) => {

    const access_token = jwt.sign({ id:user._id }, process.env.SECRET_ACCESS_KEY)

    return {
        access_token,
        profile_img : user.personal_info.profile_img,
        username : user.personal_info.username,
        fullname : user.personal_info.fullname
    }
}

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    let isUsernameNotUnique = await User.exists({
        "personal_info.username": username
    }).then((result) => result)

    isUsernameNotUnique ? username += nanoid().substring(0, 5): "";

    return username
}

server.get('/get-upload-url', (req, res) => {
    generateUploadUrl().then(url => res.status(200).json({uploadUrl : url}))
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({error: err.message})
    })
})

server.post("/signup", (req, res) => {

    let {fullname, email, password} = req.body;

    //Validating the data from frontend
    
    if(fullname.length < 3) {
        return res.status(403).json({ "error" : "Le nom doit contenir au moins de 03 caractères"})
    }
    if(!email.length){
        return res.status(403).json({"error" : "Entrez votre adresse Email SVP"})
    }
    if(!emailRegex.test(email)){
        return res.status(403).json({"error" : "Votre adresse Email est invalide"})
    }
    if(!passwordRegex.test(password)){
        return res.status(403).json({"error" : "Le mot de passe doit être compris entre 6 et 20 caractères de long, avec des caractères alphanumériques, 01 minuscule et une majuscule"})
    }

    bcrypt.hash(password, 10, async (err, hashed_password) => {
        
        let username = await generateUsername(email);

        let user = new User({
            personal_info: { fullname, email, password: hashed_password, username }
        }) 

        user.save().then((u) => {

            return res.status(200).json(formatDatatoSend(u))
        })
        .catch(err =>{

            if(err.code == 11000) {
                return res.status(500).json({
                    "error" : "L'adresse Email existe déjà"
                })
            }
            
            return res.status(500).json({"error" : err.message})
        })

    })

})

server.post("/signin", (req, res) => {

    let {email, password} = req.body;

    User.findOne({"personal_info.email": email})
    .then((user) => {
        if(!user){
            return res.status(403).json({"error": "Adresse Email introuvable"})
        }

        bcrypt.compare(password, user.personal_info.password, (err, result) => {

            if(err){
                return res.status(403).json({"error": "Erreur rencontrée lors de la connexion, réssayer s'il vous plait"});
            }

            if(!result){
                return res.status(403).json({"error": "Mot de passe incorrect"})
            } else{
                return res.status(200).json(formatDatatoSend(user))
            }
        })

    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({"error": err.message})
    })

})

server.post('/latest-blogs', (req, res) => {

    let { page } = req.body;

    let maxLimit =5 ;

    Blog.find({ draft: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id ")
    .sort({"publishedAt": -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page -1 ) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
        return res.status(200).json({blogs})
    })
    .catch(err =>{
        return res.status(500).json({error: err.message})
    })
})

server.post("/all-latest-blogs-count", (req, res) => {
    
    Blog.countDocuments({ draft: false })
    .then( count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message })
    })
})

server.get("/trending-blogs", (req, res) =>{

    Blog.find({ draft:false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id ")
    .sort({ "activity.total_reads": -1, "activity.total_likes" : -1, "publishedAt": -1})
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err =>{
        return res.status(500).json({ error: err.message })
    })
})

server.post("/search-blogs", (req,res) =>{

    let { tag, query, author, page } = req.body;

    let findQuery

    if(tag){
        findQuery = { tags: tag, draft: false };
    // }else if(query){
    //     findQuery = {draft: false, title: new RegExp(query, 'i')}
    }else if(author){
        findQuery = { author, draft: false}
    }

    let maxLimit = 2;

    Blog.find(findQuery)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id ")
    .sort({ "publishedAt": -1})
    .select("blog_id title activity des banner tags publishedAt -_id")
    .skip((page -1)*maxLimit )
    .limit(maxLimit)
    .then(blogs => {
        return res.status(200).json({ blogs })
    })
    .catch(err =>{
        return res.status(500).json({ error: err.message })
    })

})

server.post("/search-blogs-count", (req, res) => {

    let { tag, author, query } = req.body;

    let findQuery

    if(tag){
        findQuery = { tags: tag, draft: false };
    // }else if(query){
    //     findQuery = {draft: false, title: new RegExp(query, 'i')}
    }else if(author){
        findQuery = { author, draft: false}
    }

    Blog.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(err =>{
        console.log(err.message);
        return res.status(500).json({ error: err.message})
    })
})

server.post("/get-profile", (req,res) => {
    
    let { username } = req.body;

    User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then(user => {
        return res.status(200).json(user)
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({error: err.message})
    })
} )

server.post('/create-blog', verifyJWT, (req, res) => {
    
    let authorId = req.user;

    let {title, des, banner, tags, content, draft} = req.body

    if(!title.length){
        return res.status(403).json({error: "Vous devez définir un titre pour votre publication"})
    }

    if(!draft){
        if(!des.length || des.length > 200){
            return res.status(403).json({error: "Vous devez fournir un description (max 200 caractères)"})
        }
    
        if(!banner.length){
            return res.status(403).json({error: "Vous devez fournir la miniatuare de votre publication"})
        }
    
        if(!content.blocks.length){
            return res.status(403).json({error: "Vous devez avoir un minimun de contenu pour votre publication"})
        }
    
        if (!tags.length || tags.length > 3){
            return res.status(403).json({error: "Vous devez définir des sujets pour vos publications"})
        }
    }

    

    tags = tags.map(tag => tag.toLowerCase());

    let blog_id = title.replace(/[^a-zA-Z0-9]/g, '').replace(/\s+/g, "-").trim()+nanoid();

    let blog = new Blog({
        title, des, banner, tags, content, author: authorId, blog_id, draft: Boolean(draft)
    })

    blog.save().then(blog => {

        let incrementVal = draft ? 0 : 1;

        User.findOneAndUpdate({_id: authorId}, { $inc: {"account_info.total_posts" : incrementVal }, $push: {"blogs": blog._id} })
        .then(user => {
            return res.status(200).json({id: blog.blog_id})
        })
        .catch(err =>{
            return res.status(500).json({error: "Echec de mise à jour du nombre de publication"})
        })

    })
    .catch(err => {
        return res.status(500).json({error: err.message})
    })

})

server.listen(PORT, () => {
    console.log('listening on the port -> ' + PORT)
})