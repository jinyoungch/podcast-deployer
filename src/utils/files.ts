import { S3 } from "aws-sdk";
import { ParsedFile } from "../types/podcast";

export function extractBaseNameFromFilePath(filePath: string): string {
  const base = filePath.substring(filePath.lastIndexOf("/") + 1);
  return base.includes(".") ? base.substring(0, base.lastIndexOf(".")) : base;
}

export function extractDateFromFilePath(path: string): string | null {
  const dateMatch = path.match(/^[0-9]{8}/);
  if (!dateMatch) return null;

  const dateStr = dateMatch[0].replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date.toISOString().substring(0, 10);
}

export function extractTitleFromFilePath(path: string): string {
  const noExt = extractBaseNameFromFilePath(path).replace(/^[0-9]+/, "");
  const cleaned = noExt.replace(/[_-]/g, " ").trim();
  const titleCase = cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
  return titleCase;
}

export function parseMetaDataFromAudioFileName(
  file: S3.Object,
): ParsedFile | null {
  if (!file.Key) return null;

  const filename = file.Key;
  const filebase = extractBaseNameFromFilePath(filename);
  const date = extractDateFromFilePath(filebase);
  const title = extractTitleFromFilePath(filebase);

  if (!date) {
    console.log(`Skipping file ${filename} due to invalid date. 🙅🏻‍♂️`);
    return null;
  }

  return { ...file, date, title };
}

export function processFiles(podcastFiles): void {
  podcastFiles = podcastFiles.filter(
    (item, index, array) =>
      array.findIndex((i) => i.Key === item.Key) === index,
  );

  podcastFiles = podcastFiles.filter((file) => file.Key?.endsWith(".mp3"));

  podcastFiles = podcastFiles
    .map(parseMetaDataFromAudioFileName)
    .filter((file) => file !== null && file.date !== null) as ParsedFile[];

  // sort files by date in reverse chronological order (for episodic shows) 🪄
  // note: for serial shows, inverse this logic to render files in chronological order 
  podcastFiles.sort((a, b) =>
    (a as ParsedFile).date < (b as ParsedFile).date ? 1 : -1,
  );
}
