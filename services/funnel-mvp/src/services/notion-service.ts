import { DisclaimerText } from "../utils/disclaimer.js";
import type { FullAnalysisOutput, LeadSession } from "../types/domain.js";

export interface NotionReportRecord {
  pageId: string;
  pageUrl: string;
}

export interface NotionService {
  createReportPage(input: {
    session: LeadSession;
    analysis: FullAnalysisOutput;
  }): Promise<NotionReportRecord>;
}

export class NotionApiService implements NotionService {
  constructor(
    private readonly options: {
      apiKey: string;
      databaseId: string;
    }
  ) {}

  async createReportPage(input: {
    session: LeadSession;
    analysis: FullAnalysisOutput;
  }): Promise<NotionReportRecord> {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "content-type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: {
          database_id: this.options.databaseId
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: `${input.session.username} — Risk Intelligence Report`
                }
              }
            ]
          },
          Platform: {
            rich_text: [
              {
                text: {
                  content: input.session.platform
                }
              }
            ]
          },
          Decision: {
            rich_text: [
              {
                text: {
                  content: input.analysis.decision
                }
              }
            ]
          }
        },
        children: this.buildBlocks(input.analysis)
      })
    });

    if (!response.ok) {
      throw new Error(`Notion page creation failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      id: string;
      url: string;
    };

    return {
      pageId: payload.id,
      pageUrl: payload.url
    };
  }

  private buildBlocks(analysis: FullAnalysisOutput) {
    const bullets = analysis.topRisks.map((risk) => ({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            type: "text",
            text: {
              content: `${risk.title}: ${risk.summary}`
            }
          }
        ]
      }
    }));

    return [
      this.heading("Overview"),
      this.paragraph(analysis.overview),
      this.heading("Risk Score"),
      this.paragraph(String(analysis.riskScore)),
      this.heading("Top Risks"),
      ...bullets,
      this.heading("Hidden Risk"),
      this.paragraph(analysis.hiddenRisk),
      this.heading("Action Plan"),
      ...analysis.actionPlan.map((item) => this.bullet(item)),
      this.heading("Decision"),
      this.paragraph(analysis.decision),
      this.paragraph(DisclaimerText)
    ];
  }

  private heading(text: string) {
    return {
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            type: "text",
            text: { content: text }
          }
        ]
      }
    };
  }

  private paragraph(text: string) {
    return {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: { content: text }
          }
        ]
      }
    };
  }

  private bullet(text: string) {
    return {
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          {
            type: "text",
            text: { content: text }
          }
        ]
      }
    };
  }
}
