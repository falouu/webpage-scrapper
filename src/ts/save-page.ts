/**
 * TODO:
 * * scraper should handle redirects from puppeteer - it should modify url of resources accordingly
 * * compress result binary
 *   * use UPX, it compress binary to 33% size: https://blog.filippo.io/shrink-your-go-binaries-with-this-one-weird-trick/
 * * maybe switch to other implementation of packer: https://tech.townsourced.com/post/embedding-static-files-in-go/#reproducible-builds
 */

import scrape from 'website-scraper';
import MyPuppeteerPlugin from './puppeteer/scraper-puppeteer-plugin';
import path from 'path';
import yargs from 'yargs'
import { exit } from 'process';

const args = yargs.options({
  "url": {required: true, type: "string", description: "webpage to save"},
  "outputDir": {default: "", type: "string", description: "custom output directory for scraped files"}
}).argv
const url = args.url;
const outputDir = args.outputDir;

const hostname = new URL(url).hostname;

let result = scrape({
    urls: [url],
    directory: path.join(outputDir, hostname),
    plugins: [ 
      new MyPuppeteerPlugin({
        launchOptions: {headless: false},
        scrollToBottom: false, 
        //blockNavigation: false, /* TODO: check */
      })
    ]
});

result.catch(reason => {
  console.error(reason);
  exit(2)
});