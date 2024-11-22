# podcast-deployer.lambda

An AWS Lambda function that scans an Amazon S3 bucket and generates an RSS feed for podcast distribution.

Note: this tool was written specifically for Apple Podcasts, but is extensible to other platforms.
All Apple Podcasts-specific logic was based off of official guidelines: https://help.apple.com/itc/podcasts_connect/#/itcb54353390.

## Instructions

### 1. Initialise an AWS S3 bucket, where you'll save your podcast episodes' audio file and its corresponding episode-specific description file (in HTML).

For this function to execute successfully, the files need to be saved in the following format:

```
root of s3 bucket:

<Date_Of_Publication>-<Title_Of_Episode>.mp3
<Date_Of_Publication>-<Title_Of_Episode>.html
```

For example, this could look like:

```
root

20241117-Episode 1.mp3
20241117-Episode 1.html
```

Note: Apple Podcasts supports the MP3 file format, as well as M4A, MOV, MP4, M4V, and PDF.

### 2. Initialise a Lambda function, and upload the built version (ie dist/) of this Lambda's handler to the AWS console.

### 3. To be continued!
