import { dbAnalyticsInsertVideosToTrack } from "../utils/database";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function getLatestUpload(playlistId: string) {
    console.log('Getting the latest upload and saving it to the database!')
}

export async function getIdsToCheck(channelId: string) {
    console.log(`Channel ID ${channelId} has been tracked for the first time!`)
    const playlistId = channelId.replace('UC', 'UU')
    await getLatestUpload(playlistId)

    // Get 1000 videos to do
    let nextPageToken: string = ""
    let reachedMax: boolean = false
    for (let i = 0; i < 20; i++) {
        if (reachedMax) return
        await fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=1000&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}&pageToken=${nextPageToken}`)
            .then(res => {
                if (res.status == 400) reachedMax = true
                return res.json()
            }).then(async (data: any) => {
                console.dir(data, { depth: null })
                nextPageToken = data.nextPageToken

                const videoData = data.items.map((item: { contentDetails: { videoId: any; videoPublishedAt: string | number | Date; }; }) => ({
                    videoId: item.contentDetails.videoId,
                    videoPublishedAt: Math.floor(new Date(item.contentDetails.videoPublishedAt).getTime() / 1000)
                }))
                await dbAnalyticsInsertVideosToTrack(videoData, channelId)
            })
            .catch(error => {
                console.error(error)
            })
    }
}
