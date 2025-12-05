# TravLog: MERN Stack Travel Journal 🗺️

TravLog is a full-stack web application designed to be a personal travel journal. Users can register, log in, record their travel experiences, including details like location (using maps), expenses, and upload multiple photos. The application features a modular structure with a dedicated React frontend and an Express.js/MongoDB backend.

-----

## ✨ Features

  * **User Authentication**
      * User registration and login using email and password.
  * **Travel Entry Management**
      * Create, view, and delete detailed travel entries.
      * Entries support fields like `title`, `content`, `country`, `currency`, `expenses`, and geographical `location`.
  * **Image Uploads**
      * Supports multiple image uploads (up to 5) per entry, using **Multer** to handle file storage on the server.
  * **Mapping Integration**
      * Interactive map display for tagging and viewing the location of travel entries using **Leaflet** and **React-Leaflet**.

-----

## 💻 Tech Stack

The project is built using the **MERN** stack.

### Frontend (`/Frontend`)

| Technology | Purpose | Version |
| :--- | :--- | :--- |
| **React** | Frontend library | `^19.2.1` |
| **Vite** | Build tool | `^6.3.5` |
| **Axios** | HTTP client | `^1.13.2` |
| **Leaflet** / **React-Leaflet** | Mapping functionality | `^1.9.4` / `^5.0.0` |
| **Bootstrap** | UI components/styling | `^5.3.8` |
| **React Router DOM** | Client-side routing | `^7.10.1` |

### Backend (`/Backend`)

| Technology | Purpose | Version |
| :--- | :--- | :--- |
| **Node.js** / **Express.js** | Server framework | `~5.2.1` |
| **Mongoose** | MongoDB ORM | `^8.20.1` |
| **Multer** | Handles multi-part form data (file uploads) | `^2.0.2` |
| **Nodemon** | Auto-restarts server during development | `^3.1.10` |
| **CORS** | Middleware for Cross-Origin Resource Sharing | `^2.8.5` |

-----

## ⚙️ Setup and Installation

### Prerequisites

1.  **Node.js and npm/yarn**
2.  **MongoDB** running locally on default port `27017`.

### 1\. Backend Setup

1.  Navigate to the `/Backend` directory.
    ```bash
    cd Backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Start the MongoDB database** if it is not already running. The application expects a database named `travel_notes` at `mongodb://localhost:27017`.
4.  Create the `/uploads` directory in the `/Backend` folder to store uploaded images locally.
5.  Start the backend server using nodemon:
    ```bash
    npm start
    ```
    The backend should start and run on **port 3001**.

### 2\. Frontend Setup

1.  Navigate to the `/Frontend` directory.
    ```bash
    cd ../Frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend should start on a local port (usually `5173` if using Vite).

-----

## 🚀 API Endpoints (Backend)

The backend exposes the following API endpoints (running on `http://localhost:3001`):

| Method | Endpoint | Description | Details |
| :--- | :--- | :--- | :--- |
| **`POST`** | `/register` | Register a new user | Accepts `name`, `email`, `password` in request body. |
| **`POST`** | `/login` | Authenticate and log in a user | Accepts `email`, `password` in request body. |
| **`POST`** | `/save-travel-entry` | Save a new travel entry | Accepts `userEmail`, `title`, `content`, `location`, `expenses`, `currency`, `country` (as form fields) and up to 5 images (via `multer`). |
| **`GET`** | `/entries/:userEmail` | Fetch all entries for a user | `:userEmail` is passed as a route parameter. |
| **`DELETE`** | `/entries/:id` | Delete a specific entry | `:id` is the MongoDB document ID. |

-----

## 📂 Project Structure (Simplified)

```
.
├── Backend/
│   ├── index.js             # Main Express server file
│   ├── package.json         # Backend dependencies (Express, Mongoose, Multer, etc.)
│   ├── Models/
│   │   ├── travel.js        # Mongoose Schema for user login/registration
│   │   └── entry.js         # Mongoose Schema for travel entries (with images, location, etc.)
│   └── uploads/             # Directory where uploaded images are stored
├── Frontend/
│   ├── package.json         # Frontend dependencies (React, Leaflet, Axios, etc.)
│   ├── src/                 # React components
│   │   ├── App.jsx          # Main component
│   │   ├── login.jsx        # Login page component
│   │   ├── signup.jsx       # Signup page component
│   │   ├── home.jsx         # Home/dashboard component
│   │   ├── entries.jsx      # View all entries component
│   │   ├── MapInput.jsx     # Map component for selecting location
│   │   └── ...
└── README.md
```
