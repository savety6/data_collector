import { Page } from "puppeteer";
import { Article } from "../types/Article";

export class ContentAnalyzer {
    static async findArticles(page: Page): Promise<Article[]> {
        // Wait for content to load
        await page.waitForNetworkIdle({
            timeout: 3000,
            idleTime: 500
        });

        return await page.evaluate(() => {
            // Helper functions
            function findDescription(element: Element): string | undefined {
                const descriptionElement = 
                    element.querySelector('p') || 
                    element.querySelector('[class*="excerpt"]') ||
                    element.querySelector('[class*="description"]') ||
                    element.querySelector('[class*="summary"]');
                
                if (descriptionElement) {
                    const text = descriptionElement.textContent?.trim();
                    if (text && text.length > 50) {
                        return text;
                    }
                }
                
                return undefined;
            }

            function isValidArticle(element: Element): boolean {
                // Check if element or its parent is hidden
                const style = window.getComputedStyle(element);
                if (style.display === 'none' || style.visibility === 'hidden') {
                    return false;
                }
                return true;
            }

            const articles: any[] = [];
            const seenUrls = new Set<string>();
            const seenTitles = new Set<string>();
            
            // Specific selectors
            const SpecificSelectors = [
                'a[href*="/"]', // Links that contain forward slash
                '[class*="article"]',
                '[class*="post"]',
                '[class*="blog"]',
                'main a', // Links within main content
                'article a' // Links within article tags
            ];

            let articleElements: Element[] = [];

            // Try specific approach first
            SpecificSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (isValidArticle(element)) {
                        articleElements.push(element);
                    }
                });
            });

            // If no elements found, try generic approach
            if (articleElements.length === 0) {
                const genericSelectors = [
                    'article',
                    '[class*="article"]',
                    '[class*="post"]',
                    '[class*="entry"]',
                    '.blog-post',
                    '.blog-entry'
                ];

                genericSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        articleElements = [...articleElements, ...Array.from(elements)];
                    }
                });
            }

            // Score and process elements
            const scoredElements = articleElements.map(element => {
                let score = 0;
                const html = element.innerHTML.toLowerCase();
                
                // Specific scoring
                if (element.matches('a[href*="/20"]')) score += 5; // Links with year in URL
                if (element.matches('a[href*="/blog/"]')) score += 5; // Blog post links
                if (element.querySelector('h1, h2, h3, span')) score += 3;
                if (element.textContent && element.textContent.length > 50) score += 2;
                
                // Generic scoring
                if (element.matches('article')) score += 3;
                if (html.includes('date') || html.includes('published')) score += 2;
                if (element.querySelector('img')) score += 1;
                
                return { element, score };
            });

            const topArticles = scoredElements
                .filter(item => item.score > 2) // Lower threshold
                .sort((a, b) => b.score - a.score);

            // Process articles
            for (const { element } of topArticles) {
                let title, url;

                // Specific extraction
                if (element.matches('a')) {
                    title = element.querySelector('span')?.textContent?.trim() || 
                           element.textContent?.trim();
                    url = (element as HTMLAnchorElement).href;
                } else {
                    // Generic extraction
                    const titleElement = 
                        element.querySelector('h1, h2, h3, span') || 
                        element.querySelector('[class*="title"]');
                    const linkElement = element.querySelector('a') || element.closest('a');
                    
                    title = titleElement?.textContent?.trim();
                    url = linkElement?.href;
                }

                if (title && url && !seenUrls.has(url) && !seenTitles.has(title)) {
                    // Filter out navigation and non-article links
                    if (url.includes('/tags/') || url.includes('/category/') || 
                        url.includes('/about') || url.includes('/contact')) {
                        continue;
                    }

                    seenUrls.add(url);
                    seenTitles.add(title);
                    
                    articles.push({
                        title,
                        url,
                        description: findDescription(element)
                    });

                    if (articles.length >= 3) {
                        break;
                    }
                }
            }

            return articles;
        });
    }
}