import { S3 } from "aws-sdk";

export interface ParsedFile extends S3.Object {
  date: string;
  title: string;
}
