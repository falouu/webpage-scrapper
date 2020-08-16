
declare module 'website-scraper-puppeteer' {

    interface ScrollToBottomOptions {

    }

    interface Options {
        launchOptions: LaunchOptions,
        scrollToBottom: ScrollToBottomOptions,
        blockNavigation: boolean
    }

    interface LaunchOptions {
        
    }

    export default class PuppeteerPlugin {
        constructor(options: Options)
    }
}