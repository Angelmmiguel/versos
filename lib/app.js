// External libs
import frontMatter from 'front-matter';

// Styles
import './css/app.scss';

// Development flag
const DEBUG = false;
const RAW_GIT_PROD = 'https://cdn.rawgit.com/Angelmmiguel/versos/master';
const RAW_GIT_DEV = 'https://rawgit.com/Angelmmiguel/versos/master';

// Strip HTML
const stripHTML = (html) => {
  let tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// Buil the URL from a given date
const buildUrl = (endpoint) => {
  return `${DEBUG ? RAW_GIT_DEV : RAW_GIT_PROD}/poems/${endpoint}`;
}

// Build the URL based on the current date
const buildUrlForDate = () => {
  const date = new Date();
  const day = date.getDate().toString().padStart('2', '0');
  const month = (date.getMonth() + 1).toString().padStart('2', '0');
  const year = date.getFullYear().toString();
  return buildUrl(`daily/${year}/${month}/${day}.md`);

}

// Alias...
const q = (selector) => document.querySelector(selector);

// Set the poem in the UI
const setPoem = (data) => {
  q('.poem__title').innerHTML = stripHTML(data.attributes.title);
  q('.poem__author').innerHTML = stripHTML(data.attributes.author);
  q('.poem__body').innerHTML = stripHTML(data.body);
}

// Save the poem in the storage
const savePoem = (url, poem) => {
  chrome.storage.local.set({ [url]: poem });
}

// Get the markdown data from the given URL
async function fetchMarkdown(url) {
  let res = await fetch(url);
  if (res.status === 200) {
    let text = await res.text();
    return frontMatter(text);
  } else {
    return false;
  }
}

async function fetchLatestAvailablePoem(url) {
  let poem = await fetchMarkdown(url);

  if (!poem) {
    // Try to fetch the latest one
    let latest = await fetch(buildUrl('latest'));
    if (latest.status === 200) {
      let text = await latest.text();
      poem = await fetchMarkdown(buildUrl(`daily/${text}.md`));
    }
  }

  if (poem) {
    setPoem(poem);
    savePoem(url, poem);
  } else {
    // TODO: SHOW ERR
  }
}

// -----------------
// Application
// -----------------

// Set the URL for the current date
const date = new Date();
const url = buildUrlForDate();

// Try to get from the storage before get it!
chrome.storage.local.get(url, (items) => {
  const poem = items[url];
  if (poem !== undefined) {
    setPoem(poem);
  } else {
    chrome.storage.local.clear();
    fetchLatestAvailablePoem(url);
  }
});
