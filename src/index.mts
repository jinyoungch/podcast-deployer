import AWS from "aws-sdk";
import { S3 } from "aws-sdk";
import RSS from "rss";
import { pd } from "pretty-data";

AWS.config.update({ region: "us-east-1" });

const s3 = new AWS.S3();

const listObjectsV2Param: S3.ListObjectsV2Request = {
  Bucket: "sumofallpeople.com",
};

const podcastURL = "http://sumofallpeople.com";
const maxItemsInRSSFeed = 2000; // Apple Podcasts cap (2000 items); need to double check!

let podcastFiles: S3.Object[] = [];

export const handler = async (): Promise<void> => {
  console.log("Listing files from S3 bucket...⏳");
  try {
    await fetchAllS3Objects();
    console.log(`Total files fetched: ${podcastFiles.length}`);
    processFiles();
    const rssFeed = await generateRSSFeed();
    await uploadRSSFeedToS3(rssFeed);
  } catch (error) {
    console.error("Error during execution:", error);
  }
};

async function fetchAllS3Objects(): Promise<void> {
  let continuationToken: string | undefined;
  do {
    const response = await listS3Objects(continuationToken);
    continuationToken = response.NextContinuationToken;
    podcastFiles.push(...(response.Contents || []));
    console.log(
      `Fetched ${response.Contents?.length || 0} files, continuationToken: ${continuationToken}`,
    );
  } while (continuationToken);
}

/** Helper function to list objects from S3 **/
async function listS3Objects(
  continuationToken?: string,
): Promise<S3.ListObjectsV2Output> {
  return await s3
    .listObjectsV2({
      ...listObjectsV2Param,
      ContinuationToken: continuationToken,
    })
    .promise();
}

/** Process and Filter Files **/
function processFiles(): void {
  // Remove duplicates
  podcastFiles = podcastFiles.filter(
    (item, index, array) =>
      array.findIndex((i) => i.Key === item.Key) === index,
  );

  // Filter wav files and therefore exclude non episode-specific files
  podcastFiles = podcastFiles.filter((file) => file.Key?.endsWith(".wav"));

  // Parse files and filter by valid dates
  podcastFiles = podcastFiles
    .map(parseAudioFile)
    .filter((file) => file !== null && file.date !== null) as ParsedFile[];

  // Sort files by date in reverse chronological order
  // note to self: will revise whether reverse chronological is what i want to render on apple podcasts
  // vs chronological, which would convey a more coherent narrative.
  podcastFiles.sort((a, b) =>
    (a as ParsedFile).date < (b as ParsedFile).date ? 1 : -1,
  );
}

/** Parse Audio File Metadata **/
function parseAudioFile(file: S3.Object): ParsedFile | null {
  if (!file.Key) return null;

  const filename = file.Key;
  const filebase = baseName(filename);
  const date = filePathToDateString(filebase);
  const title = filePathToTitle(filebase);

  if (!date) {
    console.log(`Skipping file ${filename} due to invalid date. 🙅🏻‍♂️`);
    return null;
  }

  return { ...file, date, title };
}

/** Extract Base Name of a File **/
function baseName(filePath: string): string {
  const base = filePath.substring(filePath.lastIndexOf("/") + 1);
  return base.includes(".") ? base.substring(0, base.lastIndexOf(".")) : base;
}

/** Parse Date from File Path **/
function filePathToDateString(path: string): string | null {
  const dateMatch = path.match(/^[0-9]{8}/);
  if (!dateMatch) return null;

  const dateStr = dateMatch[0].replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toISOString().substring(0, 10);
}

/** Generate a Title from File Path **/
function filePathToTitle(path: string): string {
  const noExt = baseName(path).replace(/^[0-9]+/, "");
  const cleaned = noExt.replace(/[_-]/g, " ").trim();
  const titleCase = cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
  return titleCase;
}

/** Generate RSS Feed **/
async function generateRSSFeed(): Promise<string> {
  const showDescription =
    "'You are the sum of five people you surround yourself with': an all too common saying that underscores the impact a select group of people can have on one's life.\n\n In Sum Of All People, Jin Young invites a wide array of individuals who have left an imprint on his life and aims to expand on the aforementioned phrase; for it is the sum total of all people that, in ways big or small, hold the potential to shape the trajectory of each of our lives.";
  const showHostName = "Jin Young Choi";
  const showHostEmail = "jinyoungchoi@alumni.emory.edu";
  const coverArtURL = "http://sumofallpeople.com/media/SOAP.png";
  const feed = new RSS({
    title: "Sum Of All People",
    description: showDescription,
    feed_url: `${podcastURL}/rss.xml`,
    site_url: podcastURL,
    webMaster: showHostName,
    copyright: "Sum Of All People 2024",
    language: "en",
    pubDate: new Date().toUTCString(),
    ttl: 60,
    custom_namespaces: {
      itunes: "http://www.itunes.com/dtds/podcast-1.0.dtd",
    },
    custom_elements: [
      {
        "itunes:category": [
          { _attr: { text: "Society &amp; Culture" } },
          { "itunes:category": { _attr: { text: "Personal Journals" } } },
        ],
      },
      {
        "itunes:owner": [
          { "itunes:name": showHostName },
          { "itunes:email": showHostEmail },
        ],
      },
      {
        "itunes:image": {
          _attr: {
            href: coverArtURL,
          },
        },
      },
      { "itunes:explicit": false },
    ],
  });

  // Iterate over the files and generate RSS items
  for (let i = 0; i < podcastFiles.length && i < maxItemsInRSSFeed; i++) {
    const file = podcastFiles[i];
    const { date, title } = parseAudioFile(file) as ParsedFile;
    const url = `${podcastURL}/${file.Key}`;

    // Grab individual descriptions for each episode (in HTML)
    const htmlFileName = file.Key.replace(".mp3", ".html");
    const description = await getHTMLDescription(htmlFileName);

    feed.item({
      title,
      description, // Populated with the HTML description
      url,
      date: file.LastModified,
      enclosure: { url: url, length: file.Size, type: "audio/mpeg" },
      guid: url,
    });
  }

  console.log("RSS Feed generated successfully. 🥳");
  return pd.xml(feed.xml());
}

/** Retrieve the HTML content for a given episode's description **/
async function getHTMLDescription(htmlFileName: string): Promise<string> {
  try {
    const htmlFile = await s3
      .getObject({
        Bucket: "sumofallpeople.com",
        Key: htmlFileName,
      })
      .promise();

    // Return the HTML content as a string
    return htmlFile.Body?.toString("utf-8") || "";
  } catch (error) {
    console.error(`Failed to fetch description for ${htmlFileName}:`, error);
    return ""; // Return empty string in case of error
  }
}

/** Upload RSS Feed to S3 */
/* Note to self: This is mainly catered to Apple Podcasts, following 'A Podcaster's Guide to RSS' */
/* https://help.apple.com/itc/podcasts_connect/#/itcb54353390 */
/* Additional Note: To generate other platform-specific RSS feed, modify below logic accordingly 💅🏼*/
async function uploadRSSFeedToS3(xml: string): Promise<void> {
  const uploadParams: S3.PutObjectRequest = {
    Bucket: "sumofallpeople.com",
    Key: "rss.xml",
    Body: xml,
    ContentType: "application/rss+xml",
  };

  await s3.upload(uploadParams).promise();
  console.log(
    `Successfully uploaded feed to ${uploadParams.Bucket}/${uploadParams.Key}. ✅`,
  );
}

/** Type Definitions */
interface ParsedFile extends S3.Object {
  date: string;
  title: string;
}
