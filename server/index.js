
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Keychain } = require('../password-manager');

const app = express();
const port = 8080;
const DB_FILE = path.resolve(__dirname, 'database', 'db.json');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running');
});


app.get('/api/keychain', (req, res) => {
    fs.readFile(DB_FILE, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'Keychain not found' });
            }
            return res.status(500).json({ error: 'Failed to read keychain' });
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/keychain', (req, res) => {
    const { repr, trustedDataCheck } = req.body;
    if (!repr) {
        return res.status(400).json({ error: 'Keychain data is required' });
    }

    fs.writeFile(DB_FILE, JSON.stringify({ repr, trustedDataCheck }), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save keychain' });
        }
        res.json({ success: true });
    });
});

let keychain = null;

app.post('/api/keychain/get', async (req, res) => {
    try {
        if (!keychain) {
            return res.status(400).json({ error: 'Keychain not initialized' });
        }
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const value = await keychain.get(name);
        res.json({ value });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/keychain/set', async (req, res) => {
    try {
        if (!keychain) {
            return res.status(400).json({ error: 'Keychain not initialized' });
        }
        const { name, value } = req.body;
        if (!name || !value) {
            return res.status(400).json({ error: 'Name and value are required' });
        }
        await keychain.set(name, value);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/keychain/remove', async (req, res) => {
    try {
        if (!keychain) {
            return res.status(400).json({ error: 'Keychain not initialized' });
        }
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const result = await keychain.remove(name);
        res.json({ success: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
