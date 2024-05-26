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
            CREATE TABLE IF NOT EXISTS analytics_views (
                video_id TEXT UNIQUE,
                time_published NUMBER,
                channel_id TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table', err);
            } else {
                console.log('Table "analytics_views" is ready');
            }
        });
        dbAnalytics.run(`
            CREATE TABLE IF NOT EXISTS analytics_likes (
                video_id TEXT UNIQUE
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table', err);
            } else {
                console.log('Table "analytics_likes" is ready');
            }
        });
        dbAnalytics.run(`
            CREATE TABLE IF NOT EXISTS analytics_comments (
                video_id TEXT UNIQUE
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table', err);
            } else {
                console.log('Table "analytics_comments" is ready');
            }
        });
    }
});

export function dbAnalyticsInsertAnalytics(data: { videos: { [videoId: string]: { views: number; likes: number; comments: number; timePublished: number }; }; }) {
    const d = new Date();
    const timestamp = (Math.floor(d.getTime() / 1000) - (d.getUTCSeconds())) * 1000
    const columnName = "t_" + timestamp.toString()

    // Add a new column for the timestamp in each table
    const addColumnQueries = [
        `ALTER TABLE analytics_views ADD COLUMN ${columnName} INTEGER DEFAULT 0;`,
        `ALTER TABLE analytics_likes ADD COLUMN ${columnName} INTEGER DEFAULT 0;`,
        `ALTER TABLE analytics_comments ADD COLUMN ${columnName} INTEGER DEFAULT 0;`
    ];

    // Add columns
    addColumnQueries.forEach(query => {
        dbAnalytics.exec(query, (err: any) => {
            if (err) {
                console.error(`Error adding column ${columnName}`, err);
            } else {
                console.log(`Column ${columnName} added`);
            }
        });
    });

    // Insert or update data into respective tables
    for (const videoId in data.videos) {
        const { views, likes, comments, timePublished } = data.videos[videoId];

        // Insert or update views
        dbAnalytics.run(`
            INSERT INTO analytics_views (video_id, time_published, ${columnName})
            VALUES (?, ?, ?)
            ON CONFLICT(video_id) DO UPDATE SET ${columnName} = ${columnName} + excluded.${columnName}
        `, [videoId, timePublished, views], (err) => {
            if (err) {
                console.error(`Error inserting/updating views for video_id: ${videoId}`, err);
            }
        });

        // Insert or update likes
        dbAnalytics.run(`
            INSERT INTO analytics_likes (video_id, ${columnName})
            VALUES (?, ?)
            ON CONFLICT(video_id) DO UPDATE SET ${columnName} = ${columnName} + excluded.${columnName}
        `, [videoId, likes], (err) => {
            if (err) {
                console.error(`Error inserting/updating likes for video_id: ${videoId}`, err);
            }
        });

        // Insert or update comments
        dbAnalytics.run(`
            INSERT INTO analytics_comments (video_id, ${columnName})
            VALUES (?, ?)
            ON CONFLICT(video_id) DO UPDATE SET ${columnName} = ${columnName} + excluded.${columnName}
        `, [videoId, comments], (err) => {
            if (err) {
                console.error(`Error inserting/updating comments for video_id: ${videoId}`, err);
            }
        });
    }
}

export async function dbAnalyticsInsertVideosToTrack(videos: {videoId: string, videoPublishedAt: number}[], channelId: string) {
    videos.forEach(({ videoId, videoPublishedAt }) => {
        dbAnalytics.run(`
            INSERT INTO analytics_views (video_id, channel_id, time_published) VALUES (?, ?, ?)
        `, [videoId, channelId, videoPublishedAt], (err) => {
            if (err) {
                console.error(`Error inserting new video IDs into the analytics database: ${err}`)
            }
        });
    });
}

export async function dbAnalyticsGetIds() {
    return new Promise((resolve, reject) => {
        dbAnalytics.all('SELECT video_id FROM analytics_views', (err, rows) => {
            if (err) {
                return reject(`Error fetching video IDs: ${err}`);
            }
            const videoIds = rows.map((row: any) => row.video_id);
            const batches = [];
            for (let i = 0; i < videoIds.length; i += 50) {
                batches.push(videoIds.slice(i, i + 50).join(','));
            }
            resolve(batches);
        });
    });
}
