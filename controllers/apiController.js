const path = require('path');
const User = require(path.join(__dirname, '../models/user'));
const multer = require('multer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const saltRounds = 10;

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/profile_images');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    },
});

const upload = multer({ storage: storage }).single('profileImage');

function sendVerificationEmail(name, email, verifyToken) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'YOUR EMAIL',
        pass: 'YOUR PASSWORD' 
      }
    });
  
    const mailOptions = {
      from: 'YOUR EMAIL',
      to: email,
      subject: 'Email Verification',
    html: `<h2>You have Registered with FOOD HUB</h2>
        <h5>Verify your email address to Login with the below given link</h5>
        <a href="http://localhost:3000/auth/verify/${verifyToken}">Click Me</a>`


    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }

const apiController = {
    async registerUserApi(req, res) {
        upload(req, res, async function (err) {
            try {
                if (err instanceof multer.MulterError) {
                    return res.status(500).json({ "msg": "Error uploading file.", "success": false });
                } else if (err) {
                    return res.status(500).json({ "msg": "Unknown error occurred.", "success": false });
                }

                const profileImagePath = req.file ? `uploads/profile_images/${req.file.filename}` : null;

                const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

                const verifyToken = Math.random().toString(36).substring(7);

                const newUser = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: hashedPassword,
                    profileImage: profileImagePath,
                    verify_token: verifyToken,
                    verify_status: 0,
                });

                await newUser.save();

                sendVerificationEmail(req.body.username, req.body.email, verifyToken);

                res.status(201).json({ "msg": "User registered successfully! Check your email for verification.", "success": true });
            } catch (error) {
                console.error(error);
                res.status(500).json({ "msg": "Error registering user.", "success": false });
            }
        });
    },

    async loginUserApi(req, res) {
        try {
            const { email, password } = req.body;

            if (email && password) {
                const user = await User.findOne({ email });

                if (user) {
                    const passwordMatch = await bcrypt.compare(password, user.password);

                    if (passwordMatch) {
                        if (user.verify_status === 1) {
                            res.status(200).json({
                                status: 'success',
                                message: 'You are Logged In Successfully.',
                                user: {
                                    username: user.username,
                                    email: user.email,
                                },
                            });
                        } else {
                            res.status(401).json({
                                status: 'error',
                                message: 'Please Verify your Email Address to Login',
                            });
                        }
                    } else {
                        res.status(401).json({
                            status: 'error',
                            message: 'Invalid username or password',
                        });
                    }
                } else {
                    res.status(401).json({
                        status: 'error',
                        message: 'User not found',
                    });
                }
            } else {
                res.status(400).json({
                    status: 'error',
                    message: 'All fields are mandatory',
                });
            }
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: `Error logging in: ${error.message}`,
            });
        }
    },    
}

module.exports = apiController;