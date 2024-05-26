import { dbAnalyticsGetIds } from "../utils/database"
import { CronJob } from "cron";
import { getAnalytics } from "./getAnalytics";

// Test
// import { getIdsToCheck } from "./channelFirstTracked";
// getIdsToCheck('UCX6OQ3DkcsbYNE6H8uQQuVA')

async function updateAnalytics() {
    console.log('Getting IDs')
    dbAnalyticsGetIds()
        .then(batches => {
            console.log('Batches of video IDs:', batches);
            batches.forEach((batch: string) => {
                getAnalytics(batch)
            });
        })
        .catch(err => {
            console.error('Error:', err);
        });
}

const job = new CronJob('* * * * *', updateAnalytics)
job.start()