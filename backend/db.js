const sqlite3 = require('sqlite3').verbose();

const openDb = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('./database.db', (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
            } else {
                console.log('Connected to the SQLite database.');
                resolve(db);
            }
        });
    });
};

const initializeDb = async () => {
    const db = await openDb();

    try {
        // Enable foreign key constraints
        db.run('PRAGMA foreign_keys = ON');

        // Create the tables
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS treatment_types (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating treatment_types table:', err.message);
                } else {
                    console.log('Table "treatment_types" created or already exists.');
                }
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS steps (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    treatment_type_id INTEGER,
                    title TEXT NOT NULL,
                    FOREIGN KEY(treatment_type_id) REFERENCES treatment_types(id) ON DELETE SET NULL
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating steps table:', err.message);
                } else {
                    console.log('Table "steps" created or already exists.');
                }
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS videos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT NOT NULL
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating videos table:', err.message);
                } else {
                    console.log('Table "videos" created or already exists.');
                }
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT NOT NULL
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating images table:', err.message);
                } else {
                    console.log('Table "images" created or already exists.');
                }
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS animations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT NOT NULL
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating animations table:', err.message);
                } else {
                    console.log('Table "animations" created or already exists.');
                }
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS sections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    step_id INTEGER,
                    section TEXT NOT NULL,
                    content TEXT,
                    video_id INTEGER,
                    image_id INTEGER,
                    animation_id INTEGER,
                    audioText TEXT,
                    FOREIGN KEY(step_id) REFERENCES steps(id) ON DELETE SET NULL,
                    FOREIGN KEY(video_id) REFERENCES videos(id) ON DELETE SET NULL,
                    FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE SET NULL,
                    FOREIGN KEY(animation_id) REFERENCES animations(id) ON DELETE SET NULL
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating sections table:', err.message);
                } else {
                    console.log('Table "sections" created or already exists.');
                }
            });
        });

        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
    }

    // Close the database connection gracefully
    process.on('SIGINT', () => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
            process.exit(0);
        });
    });
};

module.exports = { initializeDb };
