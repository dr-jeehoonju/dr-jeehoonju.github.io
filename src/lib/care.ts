import records from "./care-content.json";
import facts from "./clinic-facts.json";
export const care = records;
export const sourceFacts = facts as Record<
  string,
  {
    title: string;
    prices: { title: string; price: string; detail: string; from: boolean }[];
    facts: { label: string; value?: string }[];
    evidenceNote?: {
      url: string;
      pmid: string;
      scope: string;
      reader: string;
      limitation: string;
    };
  }
>;
export const careUrl = (record: (typeof care)[number]) =>
  `/care/${record.kind === "concern" ? "concerns" : "treatments"}/${record.slug}/`;
export const bySource = (path: string) =>
  care.find((x) => x.sourcePath === path);
