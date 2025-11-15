
const express = require('express');
const cors = require('cors');
const { Keychain } = require('../password-manager');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

let keychain = null;

app.post('/api/keychain/init', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }
        keychain = await Keychain.init(password);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/keychain/load', async (req, res) => {
    try {
        const { password, repr, trustedDataCheck } = req.body;
        if (!password || !repr) {
            return res.status(400).json({ error: 'Password and repr are required' });
        }
        keychain = await Keychain.load(password, repr, trustedDataCheck);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/keychain/dump', async (req, res) => {
    try {
        if (!keychain) {
            return res.status(400).json({ error: 'Keychain not initialized' });
        }
        const [repr, trustedDataCheck] = await keychain.dump();
        res.json({ repr, trustedDataCheck });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
