/**
 * TODO:
 * * scraper should handle redirects - it should modify url of resources accordingly
 */

import scrape from 'website-scraper';
import MyPuppeteerPlugin from './puppeteer/scraper-puppeteer-plugin';
import path from 'path';
import yargs from 'yargs'

const args = yargs.options({
  "url": {required: true, type: "string", description: "webpage to save"},
  "outputDir": {default: ".", type: "string", description: "custom output directory for scraped files"}
}).argv
const url = args.url;
const outputDir = args.outputDir;

const hostname = new URL(url).hostname;

scrape({
    urls: [url],
    directory: path.join(outputDir, hostname),
    plugins: [ 

      new MyPuppeteerPlugin({
        launchOptions: {headless: false},
        scrollToBottom: { timeout: 10000, viewportN: 10 }, 
        //blockNavigation: false, /* TODO: check */
      })
    ]
});