import { Page } from "puppeteer";
import { Article } from "../types/Article";
import { ContentAnalyzer } from "../utils/contentAnalyzer";

export class BlogScraper {
    constructor(
        private url: string,
        private name: string
    ) {}

    async scrape(page: Page): Promise<Article[]> {
        try {
            await page.goto(this.url);
            return await ContentAnalyzer.findArticles(page);
        } catch (error) {
            console.error(`Error scraping ${this.name}:`, error);
            return [];
        }
    }
} 