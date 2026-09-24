require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false
});

// Test backend
app.get('/', (req, res) => {
    res.send('IT Support backend is working!');
});

// Save suggestion
app.post('/suggestions', async (req, res) => {
    const { fullName, contact, profession, suggestion } = req.body;

    try {
        await pool.query(
            `INSERT INTO suggestions
            (full_name, contact, profession, suggestion)
            VALUES ($1, $2, $3, $4)`,
            [fullName, contact, profession, suggestion]
        );

        res.json({ message: 'Suggestion saved successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to save suggestion' });
    }
});

// Save profile
app.post('/profiles', async (req, res) => {
    const { fullName, gmail, contact, profession } = req.body;

    try {
        await pool.query(
            `INSERT INTO profiles
            (full_name, gmail, contact, profession)
            VALUES ($1, $2, $3, $4)`,
            [fullName, gmail, contact, profession]
        );

        res.json({ message: 'Profile saved successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to save profile' });
    }
});

// Get profile
app.get('/profiles/:gmail', async (req, res) => {
    const { gmail } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM profiles WHERE gmail = $1 LIMIT 1',
            [gmail]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Profile not found'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to get profile'
        });
    }
});

// Update profile
app.put('/profiles/:gmail', async (req, res) => {
    const { gmail } = req.params;
    const { fullName, contact, profession } = req.body;

    try {
        const result = await pool.query(
            `UPDATE profiles
             SET full_name = $1,
                 contact = $2,
                 profession = $3
             WHERE gmail = $4
             RETURNING *`,
            [fullName, contact, profession, gmail]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Profile not found'
            });
        }

        res.json({
            message: 'Profile updated successfully',
            profile: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Failed to update profile'
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`IT Support backend running on port ${PORT}`);
});