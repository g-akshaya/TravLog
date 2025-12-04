const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const travelModel = require("./Models/travel"); 
const entryModel = require('./Models/entry');

const app = express();
app.use(express.json());
app.use(cors());

// The standard MongoDB URL connection is used here. 
// Change "travel_notes" to your actual database name if needed.
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

// 🗺️ MODIFIED ROUTE: Now accepts 'location' field
app.post('/save-travel-entry', (req, res) => {
  // Destructure the new 'location' field
  const { userEmail, title, content, location } = req.body;

  if (!userEmail || !title || !content) {
    return res.status(400).json({ error: "Required fields missing: userEmail, title, content." });
  }

  // Pass the new 'location' data to the entryModel.create method
  entryModel.create({ userEmail, title, content, location })
    .then(entry => {
      res.status(201).json({ message: "Entry saved successfully!", entry });
    })
    .catch(err => {
      console.error("Entry save error:", err);
      res.status(500).json({ error: err.message });
    });
});
// ------------------------------------------------------------------

// The GET route can remain the same, as the saved entries will now include the location data.
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