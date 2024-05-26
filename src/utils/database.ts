import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the db directory exists
const dbDir = './db'
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

// Database file paths
const latestUploadsDbPath = path.join(dbDir, 'latestUploads.db');
const rolesDbPath = path.join(dbDir, 'roles.db');
const analyticsDbPath = path.join(dbDir, 'analytics.db');

// Initialize and connect to the SQLite databases
const dbLatestUploads = new sqlite3.Database(latestUploadsDbPath, (err) => {
    if (err) {
        console.error('Error opening database', latestUploadsDbPath, err);
    } else {
        console.log('Database connected:', latestUploadsDbPath);
        dbLatestUploads.run(`
            CREATE TABLE IF NOT EXISTS latest_uploads (
                channel_id TEXT PRIMARY KEY UNIQUE,
                latest_upload TEXT,
                guilds_tracking TEXT,
                guild_channel_id TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table', err);
            } else {
                console.log('Table "latest_uploads" is ready');
            }
        });
    }
});

const dbRoles = new sqlite3.Database(rolesDbPath, (err) => {
    if (err) {
        console.error('Error opening database', rolesDbPath, err);
    } else {
        console.log('Database connected:', rolesDbPath);
        dbRoles.run(`
            CREATE TABLE IF NOT EXISTS roles (
                channel_id TEXT PRIMARY KEY UNIQUE,
                role_id TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table', err);
            } else {
                console.log('Table "roles" is ready');
            }
        });
    }
});

const dbAnalytics = new sqlite3.Database(analyticsDbPath, (err) => {
    if (err) {
        console.error('Error opening database', analyticsDbPath, err);
    } else {
        console.log('Database connected:', analyticsDbPath);
        dbAnalytics.run(`
            CREATE TABLE IF NOT EXISTS analytics (
                video_id TEXT PRIMARY KEY UNIQUE,
                channel_id TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table', err);
            } else {
                console.log('Table "analytics" is ready');
            }
        });
    }
});

export function updateAnalytics(data: { [s: string]: unknown; } | ArrayLike<unknown>, channelId: any, callback: (arg0: Error) => void) {
    const currentTime = Math.floor(Date.now() / 1000);
    const columnName = `views_${currentTime}`;

    dbAnalytics.serialize(() => {
        dbAnalytics.run(`
            ALTER TABLE analytics ADD COLUMN IF NOT EXISTS ${columnName} INTEGER DEFAULT 0
        `, (err) => {
            if (err) {
                console.error('Error adding new column', err);
                return callback(err);
            }

            const updateStatement = dbAnalytics.prepare(`
                INSERT INTO analytics (video_id, channel_id, ${columnName}) VALUES (?, ?, ?)
                ON CONFLICT(video_id) DO UPDATE SET ${columnName} = excluded.${columnName}
            `);

            for (const [videoId, views] of Object.entries(data)) {
                updateStatement.run(videoId, channelId, views, (err: any) => {
                    if (err) {
                        console.error('Error updating/inserting views', err);
                    }
                });
            }

            updateStatement.finalize((err) => {
                if (err) {
                    console.error('Error finalizing statement', err);
                }
                callback(err);
            });
        });
    });
}
