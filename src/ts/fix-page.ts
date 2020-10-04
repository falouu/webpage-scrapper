import * as fs from 'fs';
import puppeteer from 'puppeteer';
import yargs from 'yargs';
import { exit } from 'process';

const argParser = yargs
    .options({
      "dir": {required: true, type: "string", description: "directory where webpage content is located (index.html)"},
    })
    .usage("It will run chrome, let you fix some thing and then it will save the index.html with your fixes");

const args = argParser.argv;



(async () => {
    const launchOptions: puppeteer.LaunchOptions = {
        headless: false,
        defaultViewport: null
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    await page.goto("http://localhost:9876")

    await page.evaluate(() => {
        let b = document.createElement('button')
        b.innerHTML = 'SCRAP';
        b.id = 'scraper-puppeteer-plugin-scrap-button'

        b.style.position = 'fixed';
        b.style.bottom = '5px';
        b.style.left = '5px';
        b.style.backgroundColor = '#3b4045';
        b.style.color = 'white';
        b.style.zIndex = '999999';

        document.body.appendChild(b);

        b.addEventListener('click', function(event) {
            this.classList.add('scrap-now');
        });
    })

    await page.waitForSelector('#scraper-puppeteer-plugin-scrap-button.scrap-now', {timeout: 0});

    await page.evaluate(() => {
        document.getElementById('scraper-puppeteer-plugin-scrap-button')?.remove();
    });

    const content = await page.content();
    await page.close();
    await browser.close();

    const buffer = Buffer.from(content);

    fs.writeFileSync(args.dir + "/index.html", buffer)
})()
.catch(reason => {
    console.error(reason);
    exit(2)
});

