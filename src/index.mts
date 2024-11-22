import { S3 } from "aws-sdk";

import { generateRSSFeed } from "./utils/rss";
import { processFiles } from "./utils/files";
import { fetchAllS3Objects, uploadRSSFeedToS3 } from "./utils/aws";

export const handler = async (): Promise<void> => {
  console.log("Listing files from S3 bucket...⏳");
  let podcastFiles: S3.Object[] = [];
  try {
    await fetchAllS3Objects(podcastFiles);
    console.log(`Total files fetched: ${podcastFiles.length}`);
    processFiles(podcastFiles);
    const rssFeed = await generateRSSFeed(podcastFiles);
    await uploadRSSFeedToS3(rssFeed);
  } catch (error) {
    console.error("Error during execution:", error);
  }
};
