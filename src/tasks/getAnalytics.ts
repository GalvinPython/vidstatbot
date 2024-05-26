import { dbAnalyticsInsertAnalytics } from "../utils/database"

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export async function getAnalytics(videoIds: string) {
    fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`)
        .then(res => {
            return res.json()
        })
        .then((data: any) => {
            console.dir(data, { depth: null })
            const dataToUpdate = {
                videos: {}
            }

            data.items.forEach((item: {
                id: any, statistics: any
            }) => {
                const videoKey = item.id;
                const statistics = item.statistics;

                dataToUpdate.videos[videoKey] = {
                    views: parseInt(statistics.viewCount),
                    likes: parseInt(statistics.likeCount),
                    comments: parseInt(statistics.commentCount),
                };
            });

            dbAnalyticsInsertAnalytics(dataToUpdate)
        })
}