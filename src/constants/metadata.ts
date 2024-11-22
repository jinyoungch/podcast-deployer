/* AWS constants */
const awsRegion = "us-east-1"; // choose the one closest to you, more info: https://aws.amazon.com/about-aws/global-infrastructure/regions_az/
const podcastUrl = "http://sumofallpeople.com";
const s3BucketName = "sumofallpeople.com";

/* podcast constants */
const showTitle = "Sum Of All People";
const showDescription =
  "'You are the sum of five people you surround yourself with': an all too common saying that underscores the impact a select group of people can have on one's life.\n\n In Sum Of All People, Jin Young invites a wide array of individuals who have left an imprint on his life and aims to expand on the aforementioned phrase; for it is the sum total of all people that, in ways big or small, hold the potential to shape the trajectory of each of our lives.";
const showHostName = "Jin Young Choi";
const showHostEmail = "jinyoungchoi@alumni.emory.edu";
const showCoverArtURL = "http://sumofallpeople.com/media/SOAP.png"; // this can also point to the file in S3.

// refer to https://podcasters.apple.com/support/1691-apple-podcasts-categories
const iTunesCategory = "Society &amp; Culture";
const iTunesSubCategory = "Personal Journals";

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
};
