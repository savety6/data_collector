# Blog Content Collector

A powerful TypeScript-based tool that scrapes and analyzes blog content using Puppeteer. This tool is designed to extract articles, blog posts, and their metadata from various blog platforms with not-so-smart content detection algorithms.

## 🚀 Features

- **Not-So-Smart Content Detection**: Automatically identifies and extracts blog posts using scoring algorithms
- **Duplicate Prevention**: Ensures no duplicate content is collected using URL and title tracking
- **Flexible Extraction**: Works with both client-side rendered and static content
- **Rich Metadata**: Extracts titles, descriptions, and URLs from blog posts
- **Configurable**: Adapts to different blog layouts and structures

## 🛠️ Technical Stack

- TypeScript
- Puppeteer (for browser automation)
- Node.js

## 📦 Installation

1. Clone the repository:
```bash
git clone [repo-url]
```

2. Install dependencies:
```bash
npm install
    #or
yarn install
```

3. Build the project:
```bash
npm run build
```

## 🔧 Usage

```typescript
import { ContentAnalyzer } from './src/utils/contentAnalyzer';
import puppeteer from 'puppeteer';

async function scrapeArticles(url: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    
    const articles = await ContentAnalyzer.findArticles(page);
    console.log(articles);
    
    await browser.close();
}
```

## 📝 Output Format

The scraper returns an array of articles with the following structure:

```typescript
interface Article {
    title: string;      // The title of the article
    url: string;        // The full URL to the article
    description?: string; // Optional description/excerpt if available
}
```

## 🤖 How It Works

1. **Content Loading**: Waits for the page to load completely using network idle detection
2. **Element Detection**: Uses both specific and generic selectors to find potential article elements
3. **Scoring System**: Implements a sophisticated scoring algorithm to identify genuine article content
4. **Data Extraction**: Extracts and validates article metadata using various fallback strategies
5. **Duplicate Prevention**: Maintains sets of seen URLs and titles to prevent duplicate entries

## 📄 License

MIT License - feel free to use this in your own projects! 