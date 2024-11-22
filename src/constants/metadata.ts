/* AWS constants */
const awsRegion = "us-east-1"; // choose the one closest to you, more info: https://aws.amazon.com/about-aws/global-infrastructure/regions_az/
const podcastUrl = "<REPLACE_ME_WITH_PODCAST_URL>";
const s3BucketName = "<REPLACE_ME_WITH_S3_BUCKET_NAME>";

/* show constants */
const showTitle = "<REPLACE_ME_WITH_SHOW_TITLE>";
const showDescription ="<REPLACE_ME_WITH_SHOW_DESCRIPTION";
  const showHostName = "<REPLACE_ME_WITH_HOST_NAME>";
  const showHostEmail = "<REPLACE_ME_WITH_EMAIL_ADDRESS>";
  const showCoverArtURL = "<REPLACE_ME_WITH_IMAGE_URL>"; // this can also point to the file in S3.

/* Apple Podcasts constants  */
const iTunesCategory = "Society &amp; Culture"; // refer to https://podcasters.apple.com/support/1691-apple-podcasts-categories
const iTunesSubCategory = "Personal Journals";
const maxItemsInRSSFeed = 2000;

export {
  awsRegion,
  podcastUrl,
  s3BucketName,
  showTitle,
  showDescription,
  showHostName,
  showHostEmail,
  showCoverArtURL,
  iTunesCategory,
  iTunesSubCategory,
  maxItemsInRSSFeed,
};
