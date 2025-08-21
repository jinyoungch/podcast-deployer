# podcast-deployer.lambda

An AWS Lambda function that scans an Amazon S3 bucket and generates an RSS feed for podcast distribution.

This tool was written specifically for Apple Podcasts, based off of [official guidelines](https://help.apple.com/itc/podcasts_connect/#/itcb54353390), but is extensible to other platforms.

Update (11/22/2024): Further research on the cost-benefit of self-hosting podcasts vs. using a dedicated hosting platform made me realise that it's better to go with the latter when prospective scalability/outsized bandwidth is concerned.

This project is therefore abandoned, but forks are welcome for those who still wish to self-host.

Relevant links:
[How much does it cost to host a podcast on Amazon AWS?
](https://podnews.net/article/podcast-hosted-on-amazon-aws)

[Is anyone using Amazon S3 to host a podcast?
](https://www.reddit.com/r/podcasting/comments/5y2bjs/is_anyone_using_amazon_s3_to_host_a_podcast/)

## Instructions

### 1. Create an S3 bucket

In the AWS console, initialise an AWS S3 bucket where you'll save your podcast episodes' audio file and its corresponding episode-specific description file (in HTML).

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

### 2. Create a Lambda function

In the AWS console, initialise a Lambda function and set its trigger to point to the above-mentioned S3 bucket's PUT events.

If the trigger is set up correctly, you'll see the below diagram in the Lambda console:

<img width="575" alt="Screenshot 2024-11-22 at 12 20 14 AM" src="https://github.com/user-attachments/assets/0c5bde2e-bbae-4a8f-90b9-ac27a8366ca9">

### 3. Build and upload the lambda's source code to AWS

Run `npm run build` in the root directory, then copy and paste the resulting `/dist` folder (or .zip file) to the Lambda console.
