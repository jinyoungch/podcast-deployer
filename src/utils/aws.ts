import AWS from "aws-sdk";
import { S3 } from "aws-sdk";
import { awsRegion, s3BucketName } from "../constants/metadata";

AWS.config.update({ region: awsRegion });
const s3 = new AWS.S3();
const listObjectsV2Param: S3.ListObjectsV2Request = {
  Bucket: s3BucketName,
};

export async function fetchAllS3Objects(podcastFiles): Promise<void> {
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

export async function listS3Objects(
  continuationToken?: string,
): Promise<S3.ListObjectsV2Output> {
  return await s3
    .listObjectsV2({
      ...listObjectsV2Param,
      ContinuationToken: continuationToken,
    })
    .promise();
}

export async function getEpisodeDescriptionFromHTMLFile(
  htmlFileName: string,
): Promise<string> {
  try {
    const htmlFile = await s3
      .getObject({
        Bucket: s3BucketName,
        Key: htmlFileName,
      })
      .promise();

    // Return the HTML content as a string
    return htmlFile.Body?.toString("utf-8") || "";
  } catch (error) {
    console.error(`Failed to fetch description for ${htmlFileName}:`, error);
    return "";
  }
}

export async function uploadRSSFeedToS3(xml: string): Promise<void> {
  const uploadParams: S3.PutObjectRequest = {
    Bucket: s3BucketName,
    Key: "rss.xml",
    Body: xml,
    ContentType: "application/rss+xml",
  };

  try {
    await s3.upload(uploadParams).promise();
  } catch {
    console.error(
      `Failed to upload feed to ${uploadParams.Bucket}/${uploadParams.Key}. ❌`,
    );
  }
  console.log(
    `Successfully uploaded feed to ${uploadParams.Bucket}/${uploadParams.Key}. ✅`,
  );
}
