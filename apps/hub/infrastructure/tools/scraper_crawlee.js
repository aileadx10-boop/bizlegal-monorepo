/**
 * scraper_crawlee.js — Regulatory Source Scraper
 * Uses Crawlee (Playwright) to scrape regulatory sources not accessible via RSS.
 * Sources: VARA, FATF, FCA Enforcement, Binance regulatory news.
 *
 * Usage:
 *   node scraper_crawlee.js --source vara --output gaps/raw-YYYY-MM-DD.json
 *   node scraper_crawlee.js --source all --output gaps/raw-YYYY-MM-DD.json
 *   node scraper_crawlee.js --source leads --sector crypto --location UAE
 */

import { PlaywrightCrawler, Dataset, sleep } from 'crawlee';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ── Config ───────────────────────────────────────────────────
const GAP_DIR = '/opt/bizlegal/gaps';
const LOG_DIR = '/opt/bizlegal/logs';
const TODAY = new Date().toISOString().split('T')[0];

const SOURCES = {
  vara: {
    url: 'https://www.vara.ae/en/news/',
    selector: '.news-item, .press-release-item, article',
    titleSel: 'h2, h3, .title',
    dateSel: '.date, time',
    linkSel: 'a',
  },
  fatf: {
    url: 'https://www.fatf-gafi.org/en/publications.html',
    selector: '.publication-item, .search-result',
    titleSel: 'h3, .result-title',
    dateSel: '.publication-date, .date',
    linkSel: 'a',
  },
  fca: {
    url: 'https://www.fca.org.uk/news/news-stories',
    selector: '.fc-news__item, article.news-item',
    titleSel: 'h3, h2',
    dateSel: '.fc-news__date, time',
    linkSel: 'a',
  },
  mas: {
    url: 'https://www.mas.gov.sg/news',
    selector: '.news-item, .row.publication',
    titleSel: 'h3, .title',
    dateSel: '.date',
    linkSel: 'a',
  },
};

// ── Logger ───────────────────────────────────────────────────
function log(level, msg) {
  const ts = new Date().toISOString();
  const line = `${ts} [crawlee] ${level.toUpperCase()} ${msg}`;
  console.error(line);
  try {
    const logFile = join(LOG_DIR, 'scraper.log');
    writeFileSync(logFile, line + '\n', { flag: 'a' });
  } catch {}
}

// ── Scrape a single source ───────────────────────────────────
async function scrapeSource(sourceKey, config) {
  log('info', `Scraping: ${sourceKey} → ${config.url}`);
  const items = [];

  const crawler = new PlaywrightCrawler({
    launchContext: {
      launchOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    },
    requestHandlerTimeoutSecs: 30,
    maxRequestsPerCrawl: 3,

    async requestHandler({ page, request }) {
      await page.waitForLoadState('networkidle').catch(() => {});
      await sleep(1000);

      const cards = await page.$$(config.selector);
      log('info', `  Found ${cards.length} items on ${request.url}`);

      for (const card of cards.slice(0, 15)) {
        try {
          const titleEl = await card.$(config.titleSel);
          const linkEl = await card.$(config.linkSel);
          const dateEl = config.dateSel ? await card.$(config.dateSel) : null;

          const title = titleEl ? (await titleEl.textContent())?.trim() : null;
          const href = linkEl ? await linkEl.getAttribute('href') : null;
          const dateText = dateEl ? (await dateEl.textContent())?.trim() : null;

          if (!title || title.length < 10) continue;

          const absoluteUrl = href
            ? href.startsWith('http') ? href : new URL(href, config.url).href
            : config.url;

          items.push({
            title,
            source_url: absoluteUrl,
            source: sourceKey.toUpperCase(),
            raw_date: dateText,
            published_at: parseDateText(dateText) || TODAY,
            scraped_at: new Date().toISOString(),
          });
        } catch (e) {
          // Skip malformed items silently
        }
      }
    },

    failedRequestHandler({ request, error }) {
      log('error', `Failed: ${request.url} — ${error.message}`);
    },
  });

  await crawler.run([config.url]);
  log('info', `  ✓ ${sourceKey}: ${items.length} items collected`);
  return items;
}

// ── Lead scraper (LeadForge) ─────────────────────────────────
async function scrapeLeads({ sector = 'crypto', location = 'UAE' }) {
  log('info', `Scraping leads: sector=${sector} location=${location}`);
  const leads = [];

  const crawler = new PlaywrightCrawler({
    launchContext: {
      launchOptions: { headless: true, args: ['--no-sandbox'] },
    },
    maxRequestsPerCrawl: 10,

    async requestHandler({ page }) {
      await page.waitForLoadState('networkidle').catch(() => {});
      await sleep(1500);

      // Scrape company listings — adapt selectors per source
      const companies = await page.$$eval('div[data-company], .company-card, .result', els =>
        els.map(el => ({
          name: el.querySelector('.name, h3, h2')?.textContent?.trim(),
          url: el.querySelector('a')?.href,
          description: el.querySelector('.description, p')?.textContent?.trim()?.slice(0, 200),
        })).filter(c => c.name && c.url)
      );

      leads.push(...companies.slice(0, 20));
    },
  });

  // In production: replace with actual lead source URLs
  // await crawler.run([`https://example-directory.com/${sector}/${location}`]);

  log('info', `  ✓ Leads: ${leads.length} companies found`);
  return leads;
}

// ── Date parser ──────────────────────────────────────────────
function parseDateText(text) {
  if (!text) return null;
  try {
    const d = new Date(text);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch {}
  return null;
}

// ── CLI ──────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const get = (flag, def = null) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : def;
  };

  const source = get('--source', 'all');
  const output = get('--output', join(GAP_DIR, `raw-${TODAY}.json`));
  const sector = get('--sector', 'crypto');
  const location = get('--location', 'UAE');

  let allItems = [];

  if (source === 'leads') {
    allItems = await scrapeLeads({ sector, location });
    writeFileSync(output.replace('raw-', 'leads-'), JSON.stringify(allItems, null, 2));
    log('info', `Done: ${allItems.length} leads → ${output.replace('raw-', 'leads-')}`);
    return;
  }

  const targets = source === 'all' ? Object.keys(SOURCES) : [source];

  for (const key of targets) {
    if (!SOURCES[key]) {
      log('warn', `Unknown source: ${key} — skipping`);
      continue;
    }
    const items = await scrapeSource(key, SOURCES[key]);
    allItems.push(...items);
  }

  // Merge with existing raw file if it exists
  let existing = [];
  if (existsSync(output)) {
    try {
      existing = JSON.parse(readFileSync(output, 'utf8'));
    } catch {}
  }

  const merged = [...existing, ...allItems];
  writeFileSync(output, JSON.stringify(merged, null, 2));
  log('info', `Done: ${allItems.length} new items → ${output} (${merged.length} total)`);
  process.exit(0);
}

main().catch(e => {
  log('error', `Fatal: ${e.message}`);
  process.exit(1);
});
