/**
 * TODO:
 * * create also a PDF representation
 * * maybe switch to other implementation of packer: https://tech.townsourced.com/post/embedding-static-files-in-go/#reproducible-builds
 */

import scrape from 'website-scraper';
import MyPuppeteerPlugin from './puppeteer/scraper-puppeteer-plugin';
import path from 'path';
import yargs from 'yargs'
import { exit } from 'process';

const argParser = yargs
    .options({
      "url": {required: true, type: "string", description: "webpage to save"},
      "outputDir": {default: "", type: "string", description: "custom output directory for scraped files"}
    })
    .usage("Example: $0 --url google.pl\n It will create a single linux binary file in the current directory. When you run the file, it will start the webserwer and print the url which you can type in your webbrowser to access the local copy of the scrapped website")

argParser.exit = (() => {
      const exitFn = yargs.exit
      return (code: number, err: Error) => {
        if (code == 0) {
          code = -1
        }
        return exitFn(code, err)
      }
    })()

const args = argParser.argv

const url = args.url;
const outputDir = args.outputDir;

const hostname = new URL(url).hostname;

let result = scrape({
    urls: [url],
    directory: path.join(outputDir, hostname),
    plugins: [ 
      new MyPuppeteerPlugin({
        launchOptions: {headless: false, defaultViewport: null},
        scrollToBottom: false, 
        //blockNavigation: false, /* TODO: check */
      })
    ]
});

result.catch(reason => {
  console.error(reason);
  exit(2)
});