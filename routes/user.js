const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Punch = require('../models/Punch');
const router = express.Router();
const authToken = "gowriGAPFoods"
const moment = require('moment'); // Moment.js for handling dates
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');

// // Middleware for authenticating JWT tokens
// const authenticateToken = (req, res, next) => {
//     const token = req.header('auth-token');
//     if (!token) return res.status(401).json({ error: 'Access Denied' });

//     try {
//         const verified = jwt.verify(token,authToken);
//         req.user = verified;
//         next();
//     } catch (err) {
//         res.status(400).json({ error: 'Invalid Token' });
//     }
// };

const transporter = nodemailer.createTransport({
  service: 'gmail', // use your email service
  auth: {
      user: 'harsha@iglulabs.com', // replace with your email
      pass: 'Harshaiglu1506@', // replace with your email password
  },
});

// Get all users
router.get('/all', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Register a new user
router.post('/register', async (req, res) => {
  console.log("register",req.body)
  try{
    const { name, roleId, phoneNo, password } = req.body;

    // Validate input
    if (!name || !roleId || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }
    console.log("hehe")
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("hehe")

    // Create a new user
    const user = new User({
        name,
        roleId,
        password: hashedPassword,
        phoneNo
    });
    console.log("hehe")

   
        const savedUser = await user.save();
        res.json(savedUser);
    } catch (err) {
      console.log(err.message )
        res.status(500).json({ message: err.message });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    const { phoneNo, password } = req.body;

    // Validate input
    if (!phoneNo || !password) {
      console.log("invalid details")
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Find the user by name
        const user = await User.findOne({ phoneNo });
        if (!user) return res.status(400).json({ message: 'User does not exist' });
        console.log("NO USER ails")

        // Check the password
        console.log(password,user.password)
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: 'Invalid password' });
        console.log("NO PASS")

        // Create and assign a JWT token
        const token = jwt.sign({ _id: user._id },authToken, { expiresIn: '1h' });
        // res.header('auth-token', token).json({ token });
        user.token = token;
        // Update login time
        await user.save();
        res.status(200).json({token:token,id:user.id})
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Punch-in/out logic
router.post('/punch', async (req, res) => {
    const { userId } = req.body; // Assume `qrCodeData` contains relevant info
  
    try {
      // Validate user
      let user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get today's date in 'YYYY-MM-DD' format
      const today = moment().format('YYYY-MM-DD');
  
      // Check if the user already has a punch record for today
      let punchRecord = await Punch.findOne({ userId, date: today });
  
      if (!punchRecord) {
        // If no punch-in for today, create a new record
        punchRecord = new Punch({
          userId: user._id,
          punchInTime: new Date(),
          date: today
        });
        await punchRecord.save();
        return res.json({ message: 'Punched in successfully', punchRecord });
      } else if (!punchRecord.punchOutTime) {
        // If punch-in exists but no punch-out, record punch-out time
        punchRecord.punchOutTime = new Date();
        await punchRecord.save();
        return res.json({ message: 'Punched out successfully', punchRecord });
      } else {
        // If both punch-in and punch-out exist for today, reset for a new day
        return res.status(400).json({ message: 'Already punched in and out for today' });
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


router.post('/resetPassword', async (req, res) => {
  try {
      const { id, password } = req.body;
    console.log(req.body)
      // Validate input
      if (!id || !password) {
          return res.status(400).json({ message: 'User ID and password are required' });
      }

      // Find the user by ID
      const user = await User.findById(id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user's password
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});


// Route to get punch data within a time range and send it via email as an Excel file
router.post('/getAllData', async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) return res.status(404).send("No user data found.");

    // Step 3: Generate Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      // { header: 'Address', key: 'address', width: 30 },
    ];
     // Add rows
     users.forEach(user => {
      worksheet.addRow({
        name: user.name,
        // email: user.email,
        phone: user.phoneNo,
        // address: user.address,
      });
    });

    // Save workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Step 4: Send the Excel file via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user:'harsha@iglulabs.com',
        pass: 'pvrr aeaa vyqg kmah'
      },
    });
    const mailOptions = {
      from: 'harsha@iglulabs.com',
      to: 'harshasagar1506@gmail.com', // Change to your recipient email
      subject: 'User Data',
      text: 'Please find attached the user data in Excel format.',
      attachments: [
        {
          filename: 'user_data.xlsx',
          content: buffer,
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send("Error sending email.");
      }
      console.log('Email sent: ' + info.response);
      res.send("User data email sent successfully.");
    });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;