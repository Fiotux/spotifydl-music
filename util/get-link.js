import Innertube from 'youtubei.js';
import StringSimilarity from 'string-similarity';
import { logInfo } from './log-helper.js';
import { generateTemplateString } from './format-generators.js';

const youtube = await Innertube.create();
const music = youtube.music;

/**
 * This function does the actual api calls to youtube
 *
 * @param {String} searchTerms string to search on youtube with
 * @returns {String[]} youtube links
 */
const findLinks = async (searchTerms) => {
  logInfo(`searching youtube with keywords "${searchTerms}"`);
  const result = await music.search(searchTerms, {type:'song'});
  return result.contents[2].contents[0].id
};

/**
 * This function searches youtube for given songname
 * and returns the link of topmost result
 *
 * @param {String} itemName name of song
 * @param {String} albumName name of album
 * @param {String} artistName name of artist
 * @returns {String[]} youtube links
 */
const getLinks = async ({
  itemName,
  albumName,
  artistName,
  extraSearch,
  searchFormat,
}) => {
  let musicLink = [];
  if (searchFormat.length) {
    const templateString = await generateTemplateString(itemName, albumName, artistName, searchFormat);
    musicLink = ["https://youtube.com/watch?v="+findLinks(templateString)];
  }

  // custom search format failed or was never provided try the generic way
  if (!musicLink.length) {
    const similarity = StringSimilarity.compareTwoStrings(itemName, albumName);
    // to avoid duplicate song downloads
    extraSearch = extraSearch ? ` ${extraSearch}` : '';
    if (similarity < 0.5) {
      musicLink = await findLinks(
        `${albumName} - ${itemName}${extraSearch}`);
    }
    if (!musicLink.length) {
      musicLink = await findLinks(
        `${artistName} - ${itemName}${extraSearch}`);
    }
  }

return musicLink;
}

export default getLinks;
