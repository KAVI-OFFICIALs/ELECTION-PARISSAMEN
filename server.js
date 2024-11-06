const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// GitHub repository details
const GITHUB_REPO = "KAVI-BOTCREATE/Election-2024"; // replace with your GitHub repo
const FILE_PATH = "votes.json"; // replace with your file path in the repo
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Get results
app.get('/get-results', async (req, res) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        const data = JSON.parse(Buffer.from(response.data.content, 'base64').toString('utf-8'));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch results" });
    }
});

// Submit vote
app.post('/submit-vote', async (req, res) => {
    const option = req.body.option;
    if (!["Sketch", "Figma", "Photoshop"].includes(option)) {
        return res.status(400).json({ error: "Invalid option" });
    }

    try {
        // Fetch current data
        const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        const data = JSON.parse(Buffer.from(response.data.content, 'base64').toString('utf-8'));
        data[option]++;

        // Update file content
        const updatedContent = Buffer.from(JSON.stringify(data)).toString('base64');
        await axios.put(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            message: "Update votes",
            content: updatedContent,
            sha: response.data.sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        res.json({ message: "Vote submitted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit vote" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
