import RSS from "rss";
import pd from "pretty-data";

import {
  iTunesCategory,
  iTunesSubCategory,
  maxItemsInRSSFeed,
  podcastUrl,
  showCoverArtURL,
  showDescription,
  showHostEmail,
  showHostName,
  showTitle,
} from "../constants/metadata";
import { ParsedFile } from "../types/podcast";
import { getEpisodeDescriptionFromHTMLFile } from "./aws";
import { parseMetaDataFromAudioFileName } from "./files";

export async function generateRSSFeed(podcastFiles): Promise<string> {
  const feed = new RSS({
    title: showTitle,
    description: showDescription,
    feed_url: `${podcastUrl}/rss.xml`,
    site_url: podcastUrl,
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
          { _attr: { text: iTunesCategory } },
          { "itunes:category": { _attr: { text: iTunesSubCategory } } },
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
            href: showCoverArtURL,
          },
        },
      },
      { "itunes:explicit": false },
    ],
  });

  for (let i = 0; i < podcastFiles.length && i < maxItemsInRSSFeed; i++) {
    const file = podcastFiles[i];
    const { date, title } = parseMetaDataFromAudioFileName(file) as ParsedFile;
    const url = `${podcastUrl}/${file.Key}`;

    const htmlFileName = file.Key.replace(".mp3", ".html");
    const description = await getEpisodeDescriptionFromHTMLFile(htmlFileName);

    feed.item({
      title,
      description,
      url,
      date: file.LastModified,
      enclosure: { url: url, length: file.Size, type: "audio/mpeg" },
      guid: url,
    });
  }
  const formattedXML = pd.xml(feed.xml());
  console.log("RSS feed generated successfully. 🥳");
  return formattedXML;
}
