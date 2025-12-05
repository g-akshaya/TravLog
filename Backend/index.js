const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const multer = require('multer'); // 📸 NEW: Import multer
const path = require('path'); // 📸 NEW: Import path for file handling
const travelModel = require("./Models/travel"); 
const entryModel = require('./Models/entry');

const app = express();
// Note: We only use express.json() for non-file uploads (like login/register).
// Multer handles the body parsing for '/save-travel-entry'.
app.use(express.json());
app.use(cors());

// 📸 NEW: Serve static images from the 'uploads' directory
// Create this directory in your Backend folder!
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 📸 MULTER CONFIGURATION FOR FILE STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be saved in a folder named 'uploads' in the Backend directory
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // File name will be timestamp + original file extension
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});
const upload = multer({ storage: storage });


mongoose.connect("mongodb://localhost:27017/travel_notes")
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  console.log("Received data:", { name, email, password }); 
  
  travelModel.create({ name, email, password })
    .then(travel => {
      console.log("Saved document:", travel); 
      res.status(201).json({
        message: 'User registered successfully',
        user: travel 
      });
    })
    .catch(err => {
      console.error("Error:", err);
      res.status(500).json({ error: err.message });
    });
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  travelModel.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.password === password) {
          res.status(200).json({ 
            message: 'Login successful',
            user: user
          });
        } else {
          res.status(401).json({ error: 'Incorrect password' });
        }
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});


// 📸 MODIFIED POST ROUTE: Use Multer middleware to handle up to 5 files
app.post('/save-travel-entry', upload.array('images', 5), async (req, res) => {
  // Multer populates req.body and req.files (for multiple files)
  const { userEmail, title, content, location, expenses, currency, country } = req.body;
  
  // 📸 Extract paths of uploaded files
  const imagePaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  // Note: req.body.location and req.body.expenses come as strings from FormData.
  // We must parse them back into JSON objects/arrays.
  const parsedLocation = location ? JSON.parse(location) : null;
  const parsedExpenses = expenses ? JSON.parse(expenses) : [];

  if (!userEmail || !title || !content) {
    return res.status(400).json({ error: "Required fields missing: userEmail, title, and content." });
  }

  try {
    const newEntry = await entryModel.create({ 
      userEmail, 
      title, 
      content, 
      location: parsedLocation, 
      expenses: parsedExpenses,
      currency,
      country,
      images: imagePaths // 📸 Saving image paths
    });
    res.status(201).json({ message: "Entry saved successfully!", entry: newEntry });

  } catch (err) {
    console.error("Entry save error:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🗑️ NEW DELETE ROUTE
app.delete('/entries/:id', (req, res) => {
  const { id } = req.params;

  entryModel.findByIdAndDelete(id)
    .then(entry => {
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.status(200).json({ message: "Entry deleted successfully" });
    })
    .catch(err => {
      console.error("Entry delete error:", err);
      res.status(500).json({ error: err.message });
    });
});


app.get('/entries/:userEmail', (req, res) => {
  const { userEmail } = req.params;

  entryModel.find({ userEmail }).sort({ createdAt: -1 })
    .then(entries => res.status(200).json(entries))
    .catch(err => {
      console.error("Error fetching entries:", err);
      res.status(500).json({ error: err.message });
    });
});


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});