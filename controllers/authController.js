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
const authController = {

    showRegisterForm(req, res) {
        const userCookie = req.cookies.user;
    
        if (userCookie) {
            return res.redirect('/user/users');
        }
    
        res.render('index'); 
    },
    

    async registerUser(req, res) {
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
                res.send("<script>alert('msg: User registered successfully! Check your email for verification.'); window.location.href='/auth/login';</script>");
            } catch (error) {
                res.send("<script>alert('msg: Error registering user.'); window.location.href='/auth/register';</script>");
            }
        });
    },

    async verifyUser(req, res) {
        try {
            const { token } = req.params;
            const user = await User.findOne({ verify_token: token });
    
            if (!user) {
                return res.status(404).send('Invalid verification link');
            }
    
            if (user.verify_status === 1) {
                return res.status(200).send('Email already verified. You can log in.');
            }
    
            user.verify_status = 1;
            user.verify_token = '';
            await user.save();
    
            res.status(200).send('Email verified successfully! You can now log in.');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },    

    showLoginForm(req, res) {
        if (req.cookies.user) {
            res.redirect('/user/users');
        } else {
            res.render('login');
        }
    },
    

    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            if (email && password) {
                const user = await User.findOne({ email });

                if (user) {
                    const passwordMatch = await bcrypt.compare(password, user.password);

                    if (passwordMatch) {
                        if (user.verify_status === 1) {
                            res.cookie('user', JSON.stringify({ email: user.email, name: user.username }));
                            console.log(req.cookies.user);
                            res.redirect('/user/users');
                        } else {
                            res.send("<script>alert('msg: Please Verify your Email Address to Login'); window.location.href='/auth/login';</script>");
                        }
                    } else {
                        res.send("<script>alert('msg: Invalid username or password'); window.location.href='/auth/login';</script>");

                    }
                } else {
                    res.send("<script>alert('msg: User not found'); window.location.href='/auth/login';</script>");

                }
            } else {
                res.send("<script>alert('msg: All fields are mandatory'); window.location.href='/auth/login';</script>");

                
            }
        } catch (error) {            
            const errorMessage = "Error logging in. Please try again later.";
            const alertScript = `<script>alert('${errorMessage}'); window.location.href='/auth/login';</script>`;
            res.send(alertScript);

        }
    },

    logout(req, res) {
        console.log('Logout function called');
        res.clearCookie('user');
        console.log('User cookie cleared');
        res.redirect('/auth/login'); 
    },    
};

module.exports = authController;
