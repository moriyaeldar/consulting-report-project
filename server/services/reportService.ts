// Make sure you've reviewd the README.md file to understand the task and how to access the relevant resources
import SalesforceData from '../models/SalesforceData';
import { generateText } from './llmService';
import { fetchCompanyNews } from './newsService';
import {
  buildDetailedPrompt,
  buildHighLevelPrompt,
  FinancialData,
} from './promptService';

// Same company + report type + article → same report, so skip the LLM call.
// In-memory only: the cache is cleared when the server restarts.
const reportCache = new Map<string, string>();

const getCacheKey = (
  companyId: string,
  reportType: string,
  articleHeading: string
): string => `${companyId}|${reportType}|${articleHeading}`;

// Models sometimes wrap the answer in ```markdown fences; the UI needs plain Markdown
const stripCodeFences = (text: string): string =>
  text
    .trim()
    .replace(/^```(?:markdown|md)?\s*\n/i, '')
    .replace(/\n```$/, '')
    .trim();

export const generateReportMarkdown = async (
  companyName: string,
  companyId: string,
  reportType: string
): Promise<string> => {
  const [latestYearData, news] = await Promise.all([
    SalesforceData.findOne({
      where: { companyId },
      order: [['year', 'DESC']],
    }),
    fetchCompanyNews(companyId),
  ]);

  if (!latestYearData) {
    return `# ${companyName}\n\nNo database data found for \`${companyId}\`.`;
  }

  // The DB returns DECIMAL columns as strings
  const financials: FinancialData = {
    companyName: latestYearData.companyName,
    year: latestYearData.year,
    sales: Number(latestYearData.sales),
    profit: Number(latestYearData.profit),
  };

  const prompt =
    reportType === 'detailed'
      ? buildDetailedPrompt(financials, news)
      : buildHighLevelPrompt(financials, news);

  // No article means the news API failed; don't cache that, the next call may succeed
  const cacheKey = news
    ? getCacheKey(companyId, reportType, news.heading)
    : null;

  if (cacheKey && reportCache.has(cacheKey)) {
    console.log(`Report cache hit: ${cacheKey}`);
    return reportCache.get(cacheKey)!;
  }

  const report = stripCodeFences(await generateText(prompt));

  if (cacheKey) reportCache.set(cacheKey, report);
  return report;
};
