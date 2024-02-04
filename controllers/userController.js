const fs = require('fs');
const path = require('path');
const User = require(path.join(__dirname, '../models/user'));
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/profile_images');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    },
});

const upload = multer({ storage: storage }).single('profileImage');

const editUserGet = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render('edit', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const editUserPost = async (req, res) => {
  try {
    const existingUserData = await User.findById(req.params.id);

    upload(req, res, async function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Error uploading file');
      }

      const { username, email, password } = req.body;

      if (req.file) {
        const profileImagePath = req.file ? `uploads/profile_images/${req.file.filename}` : null;

        await User.findByIdAndUpdate(req.params.id, {
          username,
          email,
          password,
          profileImage: profileImagePath,
        });

        if (existingUserData.profileImage) {
          const previousImagePath = path.join(__dirname, '../', existingUserData.profileImage);
          fs.unlinkSync(previousImagePath);
        }
      } else {
        await User.findByIdAndUpdate(req.params.id, { username, email, password });
      }

      res.redirect('/user/users');
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const displayUsers = async (req, res) => {
  try {
      const userCookie = req.cookies.user;

      if (!userCookie) {
          return res.redirect('/auth/login');
      }

      const users = await User.find();
      res.render('users', { users });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (user.profileImage) {
      const imagePath = path.join(__dirname, '../', user.profileImage);

      await fs.promises.unlink(imagePath);
    }

    await User.findByIdAndDelete(req.params.id);
    res.redirect('/user/users');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


module.exports = {
  editUserGet,
  editUserPost,
  deleteUser,
  displayUsers
};
