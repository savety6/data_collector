import puppeteer from "puppeteer";
import { BlogScraper } from "./blogs/blogScraper";

const blogs = [
    {
        url: "https://www.joshwcomeau.com/",
        name: "Josh Comeau's Blog"
    },
    {
        url: "https://overreacted.io/",
        name: "Overreacted"
    },
    {
        url: "https://swizec.com/blog/",
        name: "Swizec's Blog"
    }
];

const main = async (): Promise<void> => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        for (const blog of blogs) {
            const scraper = new BlogScraper(blog.url, blog.name);
            const articles = await scraper.scrape(page);
            console.log(`\n${blog.name} Articles:`, articles);
        }

        await browser.close();
    } catch (error) {
        console.error("Main error:", error);
    }
}

main();