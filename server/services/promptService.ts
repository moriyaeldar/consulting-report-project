import { NewsArticle } from './newsService';

export interface FinancialData {
  companyName: string;
  year: number;
  sales: number;
  profit: number;
}

// Shared by both prompts: the data and the rule for choosing the most recent numbers
const buildDataSection = (
  financials: FinancialData,
  news: NewsArticle | null
): string => {
  const newsText = news
    ? `Heading: ${news.heading}\nContent: ${news.content}`
    : 'No news article is available.';

  return `You are an investment consultant evaluating ${financials.companyName}.

## Database data (year ${financials.year})
- Sales: ${financials.sales}
- Profit: ${financials.profit}

## Latest news article
${newsText}

## Rules
- Always base your analysis on the most recent data available.
- If the news article contains sales or profit figures that are newer than the database year, use the news figures and say so.
- If the news has no figures, use the database figures.
- If data is missing or the signals conflict, explain the uncertainty clearly.
- The recommendation must be exactly one of: Invest, Don't Invest, Defer.
- Respond with raw Markdown only. Do not wrap it in code fences.`;
};

export const buildHighLevelPrompt = (
  financials: FinancialData,
  news: NewsArticle | null
): string =>
  `${buildDataSection(financials, news)}

## Task
Write a high-level report:
- A heading: "# ${financials.companyName} — Investment Report"
- One short sentence that combines the financial and news signals and ends with the final recommendation in bold.`;

export const buildDetailedPrompt = (
  financials: FinancialData,
  news: NewsArticle | null
): string =>
  `${buildDataSection(financials, news)}

## Task
Write a detailed report with these sections:
- "# ${financials.companyName} — Investment Report"
- "## Executive Summary": 2-3 sentences.
- "## Sales & Profit Snapshot": the figures you used and their source (database or news).
- "## News Analysis": what the article means for the company, positive or negative.
- "## Recommendation": the final recommendation in bold, with a short justification.`;
