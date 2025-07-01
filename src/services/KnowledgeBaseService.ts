import { logger } from '../utils/logger';
import { OpenRouterService } from './OpenRouterService';

export class KnowledgeBaseService {
  private openRouterService: OpenRouterService;
  private cachedSummary: string | null = null;
  private isGenerating: boolean = false;
  private pendingPromise: Promise<string> | null = null;

  // Optionally, define keywords for tailored context
  private tailoredKeywords: string[] = [
    'tokenomics', 'roadmap', 'team', 'security', 'audit', 'partnership', 'staking', 'yield', 'swap', 'fees', 'liquidity', 'launch', 'governance', 'rewards', 'bridge', 'cross-chain', 'defi', 'dapp', 'app', 'mobile', 'wallet', 'exchange', 'listing', 'community', 'support', 'future', 'vision', 'mission', 'technology', 'protocol', 'whitepaper', 'docs', 'documentation', 'how', 'why', 'what', 'when', 'where', 'who'
  ];

  constructor(openRouterService: OpenRouterService) {
    this.openRouterService = openRouterService;
  }

  // Helper to check if question contains tailored keywords
  private needsTailoredContext(question: string): boolean {
    const lower = question.toLowerCase();
    return this.tailoredKeywords.some(keyword => lower.includes(keyword));
  }

  // Generate the main BTB summary using the LLM
  private async generateSummary(): Promise<string> {
    const prompt =
      'Act as BTB Finance. Summarize what BTB is, what it offers (DeFi, swaps, yield farming, etc.) in under 200 words. Output only the summary.';
    logger.info('Generating BTB project summary from LLM...');
    const summary = await this.openRouterService.getResponse(prompt);
    logger.info('BTB project summary generated and cached.');
    return summary.trim();
  }

  // Optionally generate a tailored context for specific questions
  private async generateTailoredContext(question: string): Promise<string> {
    const prompt = `Act as BTB Finance. A user asked: "${question}"\n\nReply with a concise, accurate summary or context about BTB relevant to this question. If the answer is in the general project summary, you may reuse it. Keep it under 200 words. Output only the context.`;
    logger.info('Generating tailored BTB context for question:', { question });
    const context = await this.openRouterService.getResponse(prompt);
    logger.info('Tailored BTB context generated.');
    return context.trim();
  }

  // Main method to get knowledge/context for a question
  async searchKnowledge(question: string): Promise<string> {
    // If a tailored context is needed, generate it (do not cache globally)
    if (this.needsTailoredContext(question)) {
      try {
        return await this.generateTailoredContext(question);
      } catch (err) {
        logger.error('Failed to generate tailored context, falling back to summary:', err);
        // Fallback to cached summary if tailored context fails
      }
    }

    // If summary is already cached, return it
    if (this.cachedSummary) {
      return this.cachedSummary;
    }

    // If another call is already generating the summary, wait for it
    if (this.isGenerating && this.pendingPromise) {
      return this.pendingPromise;
    }

    // Otherwise, generate and cache the summary
    this.isGenerating = true;
    this.pendingPromise = this.generateSummary()
      .then(summary => {
        this.cachedSummary = summary;
        this.isGenerating = false;
        this.pendingPromise = null;
        return summary;
      })
      .catch(err => {
        this.isGenerating = false;
        this.pendingPromise = null;
        logger.error('Failed to generate BTB summary:', err);
        return '';
      });
    return this.pendingPromise;
  }
}
