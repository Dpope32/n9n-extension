// Detection of n8n page

export interface Tab {
  url?: string;
}

export const isN8nPage = (tab: Tab | undefined) => {
  if (!tab || !tab.url) return false;
  return (
    tab.url.includes('n8n.cloud') ||
    tab.url.includes('localhost') ||
    tab.url.includes('127.0.0.1') ||
    tab.url.includes('100.78.164.43')
  );
};