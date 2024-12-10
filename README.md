
# OSI Visualizer
## Overview

The OSI Visualizer is a web application designed to visualize the Open Systems Interconnection (OSI) model in real-time. It fetches network packet data from a backend server and displays the data interactively, helping users understand the flow and structure of network communication.

**Features**

- Visualizes the OSI model layers.

- Displays real-time packet data.

- Easy-to-understand interface for network analysis.

## Prerequisites
- **Node.js and npm:** Ensure you have Node.jsand npm installed on your machine.

- **Python 3:** Required for the backend server.

- **Flask:** Python web framework to handle API requests.

# Getting Started
## Backend Setup

- Navigate to the Backend directory:
```
sh
cd Backend
```
> Create a virtual environment (optional but recommended):
```
sh
python -m venv venv
source venv/bin/activate 
```
> On Windows use `venv\Scripts\activate`

## Install the dependencies:
```
sh
pip install -r requirements.txt
```
## Run the Flask server:
```
sh
python app.py
```
> The backend server should now be running on http://127.0.0.1:5000.

# Frontend Setup
- Navigate to the FrontEnd directory:
```
sh
cd ../FrontEnd
```
## Install the dependencies:
```
sh
npm install
```
## Start the development server:
```
sh
npm run dev
```
> The frontend should now be running on http://<your-ip>:3000 (if you've changed the default port).

# Accessing the Application

## Open your browser and navigate to:
```
http://<your-ip>:3000 to view the OSI Visualizer.
```
# Usage

- The application fetches packet data from the backend every 5 seconds.

- The LayerView component displays the OSI model layers.

- The PacketTable component lists the packets received from the backend.

# Contributing
Feel free to contribute to the project by opening issues or submitting pull requests. Any contributions are greatly appreciated!

# License
This project is licensed under the MIT License. See the LICENSE file for details.

# Acknowledgements
Inspired by network visualization tools and educational materials on the OSI model.

# Built with React and Flask.

Feel free to modify and expand upon this as needed to better suit your project's specifics and needs! If there's anything more you need, just let me know. 😊
