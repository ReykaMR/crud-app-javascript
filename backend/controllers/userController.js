const userModel = require('../models/userModel');

exports.getAllUsers = (req, res) => {
    userModel.getAllUsers((err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching users' });
        } else {
            res.json(results);
        }
    });
};

exports.getUserById = (req, res) => {
    const id = req.params.id;
    userModel.getUserById(id, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching user' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(results[0]);
        }
    });
};

exports.createUser = (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    userModel.createUser({ name, email, phone }, (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: 'Email already exists' });
            } else {
                res.status(500).json({ error: 'Error creating user' });
            }
        } else {
            res.status(201).json({ id: results.insertId, name, email, phone });
        }
    });
};

exports.updateUser = (req, res) => {
    const id = req.params.id;
    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    userModel.updateUser(id, { name, email, phone }, (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: 'Email already exists' });
            } else {
                res.status(500).json({ error: 'Error updating user' });
            }
        } else if (results.affectedRows === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({ id, name, email, phone });
        }
    });
};

exports.deleteUser = (req, res) => {
    const id = req.params.id;
    userModel.deleteUser(id, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error deleting user' });
        } else if (results.affectedRows === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json({ message: 'User deleted successfully' });
        }
    });
};