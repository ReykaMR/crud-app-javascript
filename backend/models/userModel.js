const db = require('../config/database');

const getAllUsers = (callback) => {
    db.query('SELECT * FROM users ORDER BY created_at DESC', callback);
};

const getUserById = (id, callback) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], callback);
};

const createUser = (userData, callback) => {
    const { name, email, phone } = userData;
    db.query(
        'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
        [name, email, phone],
        callback
    );
};

const updateUser = (id, userData, callback) => {
    const { name, email, phone } = userData;
    db.query(
        'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
        [name, email, phone, id],
        callback
    );
};

const deleteUser = (id, callback) => {
    db.query('DELETE FROM users WHERE id = ?', [id], callback);
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};