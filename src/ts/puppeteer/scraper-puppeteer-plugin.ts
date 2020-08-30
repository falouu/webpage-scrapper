import puppeteer, { Browser, LaunchOptions } from 'puppeteer';
import debug from 'debug';
import 'website-scraper';
import request from 'request'
import websiteScraper from 'website-scraper';

const log = debug("pupp-plugin")


type RegisterAction = (k: string, cb: (...y: any) => any) => undefined

interface Resource {
    getUrl(): string
}

interface RequestOptions extends websiteScraper.RequestOptions {
    encoding: string | null 
}

interface ScrollToBottom {
    timeout: number
    /** How many full screens to scroll at max */
    viewportN: number
}

export default class MyPuppeteerPlugin {
    readonly launchOptions: LaunchOptions;
    browser?: Browser
    readonly scrollToBottom?: ScrollToBottom
    headers: request.Headers

    constructor(args: {
        launchOptions?: LaunchOptions,
        scrollToBottom?: ScrollToBottom | false
        //blockNavigation = false
    }) {
        this.launchOptions = args.launchOptions || {};
        this.scrollToBottom = args.scrollToBottom || undefined;
        this.headers = {};
        
        log('init plugin', {launchOptions: this.launchOptions, scrollToBottom: this.scrollToBottom});
    }

    apply(registerAction: RegisterAction) {
        registerAction('beforeStart', async () => {
            this.browser = await puppeteer.launch(this.launchOptions);
        });

        registerAction('beforeRequest', async ({resource,requestOptions}:{resource: Resource, requestOptions: RequestOptions}) => {
            if (hasValues(requestOptions.headers)) {
                this.headers = Object.assign({}, requestOptions.headers);
            }
            requestOptions.encoding = null
            return {requestOptions};
        });

        registerAction('afterResponse', async ({response}:{response: request.Response}) => {

            log("Received afterResponse with response:", {'request line': `${response.request.method} ${response.request.href}`, statusCode: response.statusCode})

            const contentType = response.headers['content-type'];
            const isHtml = contentType && contentType.split(';')[0] === 'text/html';
            if (isHtml) {
                log("Detected html - starting scraping...")
                const url = response.request.href;
                const page = await this.browser!.newPage();

                if (hasValues(this.headers)) {
                    log('set headers to puppeteer page', this.headers);
                    await page.setExtraHTTPHeaders(this.headers);
                }

                await page.goto(url);

                if (this.scrollToBottom) {
                    await scrollToBottom(page, this.scrollToBottom.timeout, this.scrollToBottom.viewportN);
                }

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

                await page.waitForSelector('#scraper-puppeteer-plugin-scrap-button.scrap-now');

                await page.evaluate(() => {
                    document.getElementById('scraper-puppeteer-plugin-scrap-button')?.remove();
                });

                //const cookies = await page.cookies();

                // for (const c of cookies) {
                //     await page
                // }

                //page.addScriptTag({})


                await page.evaluate(() => {



                    
                    const sc = document.createElement('script');
                    sc.type = 'text/javascript';

                    let text = '';

                    // for (const c of cookies) {
                    //     text += 'document.cookie += "' + c + '";\n';
                    // }

                    sc.text = text;
                    document.head.prepend(sc);
                });

                const content = await page.content();
                await page.close();

                // convert utf-8 -> binary string because website-scraper needs binary
                return Buffer.from(content).toString('binary');
            } else {
                const contentLength = response.headers['content-length'] || 0
                const bodyLength = response.body.length

                const bodyAsBuffer = response.body
                const bodyAsStringBinary = Buffer.from(bodyAsBuffer).toString('binary')

                log("This is not a html.", {
                    bytes: bodyLength, 
                    contentLength: contentLength, 
                    transferEncoding: response.headers['transfer-encoding'], 
                    contentEncoding: response.headers['content-encoding'],
                    contentType: response.headers['content-type'],
                    httpVersion: response.httpVersion,
                    complete: response.complete})
                if (bodyLength != contentLength) {
                    log(`WARNING: content-length and actual response length differs! ${contentLength} vs ${bodyLength}`)
                }

                return bodyAsStringBinary;
            }
        });

        registerAction('afterFinish', () => this.browser && this.browser.close());
    }
}

function hasValues(obj: {}) {
    return obj && Object.keys(obj).length > 0;
}


async function scrollToBottom(page: puppeteer.Page, timeout: number, viewportN: number) {
    log(`scroll puppeteer page to bottom ${viewportN} times with timeout = ${timeout}`);

    await page.evaluate(async (timeout, viewportN) => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0, distance = 200, duration = 0, maxHeight = window.innerHeight * viewportN;
            const timer = setInterval(() => {
                duration += 200;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight || duration >= timeout || totalHeight >= maxHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    }, timeout, viewportN);
}
