# rss-deployer.lambda

An AWS Lambda function that generates an RSS feed for podcast distribution. 

Note: this tool was written specifically for Apple Podcasts, but can be extended to be compatible with other platforms.

## Instructions

1. Initialise an AWS S3 bucket, where you'll save your podcast episodes' audio file and its corresponding episode-specific description file (in HTML).

For this function to execute successfully, the files need to be saved in the following format:

```
root of s3 bucket:

<Date_Of_Publication>-<Title_Of_Episode>.html
<Date_Of_Publication>-<Title_Of_Episode>.html
```

For example, this could look like:

```
root

20241117-Episode 1.mp3
20241117-Episode 1.html
```

2. Initialise a Lambda function, and upload the built version of this Lambda's handler to the AWS console.

3. To be continued!
