const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Place = require('./models/Place');
const Booking = require('./models/Booking');
const CookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const { resolve } = require('path');
const { rejects } = require('assert');

require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.jwtSecret;

app.use(cors({
    credentials: true,
    origin: 'http://127.0.0.1:5173',
}));
app.use(express.json());
app.use(CookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'))


mongoose.connect(process.env.MONGODB_URL);

function getUserDataFromReq(req) {
    return new Promise( (resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if(err) {
                return res.status(401).json(
                    { error: "Token verification failed" });
            }   
            resolve(userData)            
           
        
        })
        
    })

}





app.get('/test', (req, res) => {
    res.json('test ok');
});

app.post('/register', async (req, res) => {
    const {name, email, password} = req.body; 
    try {
        const user = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt)
    
        });
        
        res.json(user);
    } catch(err) {
        res.status(422).json(err);
    }
});

app.post('/login', async (req, res) => {
    
    const {email,password} = req.body; 
    
        const user = await User.findOne({email});

        if(user) {
            
            const pwdOk = bcrypt.compareSync(password, user.password);
            
            if(pwdOk){
                
                jwt.sign({
                    email: user.email,
                    id: user._id
                    
                }, jwtSecret, {}, (err,token) => {
                    if(err) {
                        console.log(err);
                        return res.status(500).json({ error: "Internal Server Error" });
                        
                    } 
                res.cookie('token', token).json(user);
            });
                
            } else {
                res.status(422).json('pass not valid');
            }
        } else {
            res.json('not valid');
        }
        
   
   
});


app.get('/profile', (req, res) => {
    const {token} = req.cookies;

    if(token) {
                
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            
            if(err) {
                return res.status(401).json({ error: "Token verification failed" });
            }
            const {name,email,_id} = await User.findById(userData.id);
            
            res.json({name,email,_id});
        })

    } else {
        res.json(null);

    }
});

app.post('/logout', (req, res) => {
    res.cookie('token','').json(true);
});

app.post('/upload-by-link', async (req,res)=> {

    const {link} = req.body;
    const newName = 'photo'+ Date.now() +'.jpg';
    
    await imageDownloader.image({
        url: link,
        dest: __dirname + '/uploads/'+ newName
    })
    .then(res => {
        console.log('res:' , res)
    })
    .catch(err =>{
        console.log('err:', err)
    });
    res.json(newName);
})


const photosMiddleware = multer({dest:'uploads'})
app.post('/upload', photosMiddleware.array('photos', 100), (req,res)=> {
        
    
    console.log('req.files: ',req.files)

    const uploadedFiles = [];
    for (let i=0; i <req.files.length; i++) {
        const {path, originalname} = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length-1];
        const newPath = path + '.' + ext;
        const pathSeparator = require('path').sep;
        fs.renameSync(path, newPath);
        
        uploadedFiles.push(newPath.replace(`uploads${pathSeparator}`, ''));
        
                        
        
    }
    console.log('uploadedFiles: ',uploadedFiles)
 res.json(uploadedFiles);
})

app.post('/places', (req, res) => {
    const { token } = req.cookies;
    const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
            return res.status(401).json({ error: "Token verification failed" });
        }

        try {
            
            const placeData = await Place.create({
                owner: userData.id,
                title,
                address,
                photo: addedPhotos,
                description,
                perks,
                extraInfo,
                checkIn,
                checkOut,
                maxGuests,
                price
            });
            
            res.status(201).json(placeData); 
        } catch (error) {
            console.error("Database error:", error);
            res.status(500).json({ error: "Failed to create a new place" });
        }
    });
});

    app.get('/user-places', (req,res) => {
        const {token} = req.cookies;
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if(err) {
                return res.status(401).json(
                    { error: "Token verification failed" });
            }
            const {id} = userData;
            
            res.json( await Place.find({owner:id}) ) 
        
        })
    });

    app.get('/places/:id', async (req,res) => {
        const {id} = req.params;
        
        res.json(await Place.findById(id));
    });

    app.put('/places/:id', async (req,res) => {
        
        const {token} = req.cookies;
        
        const {id, title, address, addedPhotos, description,
        perks, extraInfo, checkIn, checkOut, maxGuests, price} = req.body;
        
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
                return res.status(401).json(
                    { error: "Token verification failed" });
            } 

            const placeData = await Place.findById(id);

            if (userData.id === placeData.owner.toString()) {
              placeData.set({
                title, address, photo:addedPhotos, description,
                perks, extraInfo, checkIn, checkOut, maxGuests, price
              })
              await placeData.save();
              res.json('ok');
            } else {
                res.status(403).json({ error: "Unauthorized" });
            }

            
        })
    })

    app.get('/places', async (req,res) => {

        res.json( await Place.find());

    });

    app.post('/bookings', async (req, res) => {
        const userData = await getUserDataFromReq(req);
        const {place, checkIn, checkOut, 
            maxGuests, name, mobile, price} = req.body;

        await Booking.create({
            place, checkIn, checkOut, 
            maxGuests, name, mobile, price,
            user:userData.id
        })
        .then ((data) => {
            res.json(data)
        })
        .catch (err => {
            console.error(err)

        })
    })


    app.get('/bookings', async (req,res) => {
        const userData = await getUserDataFromReq(req);
        res.json( await Booking.find({user:userData.id}).populate('place'))
    })






app.listen(4000);
 