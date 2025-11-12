// Site Builder Types
export interface SiteElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'button' | 'form' | 'gallery' | 'map' | 'embed' | 'divider' | 'spacer';
  content: any;
  styles: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    padding: { top: number; right: number; bottom: number; left: number };
    margin: { top: number; right: number; bottom: number; left: number };
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    borderRadius?: number;
    border?: string;
    boxShadow?: string;
    opacity?: number;
    zIndex?: number;
  };
  animation?: {
    type: 'fadeIn' | 'slideIn' | 'bounce' | 'pulse' | 'none';
    duration: number;
    delay: number;
  };
  responsive?: {
    mobile: Partial<SiteElement['styles']>;
    tablet: Partial<SiteElement['styles']>;
    desktop: Partial<SiteElement['styles']>;
  };
}

export interface SitePage {
  id: string;
  name: string;
  title: string;
  description: string;
  slug: string;
  elements: SiteElement[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };
  settings: {
    backgroundColor: string;
    backgroundImage?: string;
    customCSS?: string;
    customJS?: string;
  };
  isPublished: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SiteProject {
  id: string;
  name: string;
  description: string;
  domain?: string;
  customDomain?: string;
  pages: SitePage[];
  theme: SiteTheme;
  settings: {
    favicon?: string;
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    analytics?: {
      googleAnalytics?: string;
      facebookPixel?: string;
    };
    seo: {
      siteName: string;
      defaultDescription: string;
      defaultKeywords: string[];
    };
  };
  isPublished: boolean;
  publishedUrl?: string;
  createdAt: number;
  updatedAt: number;
  owner: string;
}

export interface SiteTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  components: {
    button: any;
    card: any;
    header: any;
    footer: any;
  };
  category: 'business' | 'portfolio' | 'blog' | 'ecommerce' | 'landing' | 'creative';
}

export interface SiteTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'business' | 'portfolio' | 'blog' | 'ecommerce' | 'landing' | 'creative' | 'agency' | 'restaurant' | 'education';
  pages: Omit<SitePage, 'id' | 'createdAt' | 'updatedAt'>[];
  theme: SiteTheme;
  isPremium: boolean;
  tags: string[];
}

export interface AIAssistantSuggestion {
  id: string;
  type: 'content' | 'design' | 'seo' | 'performance' | 'accessibility';
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
  elementId?: string;
  pageId?: string;
  implementation?: {
    code?: string;
    styles?: any;
    content?: any;
  };
}

export interface SiteAnalytics {
  projectId: string;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
  }>;
  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  performanceMetrics: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
  };
  period: {
    start: number;
    end: number;
  };
}

export interface PublishingOptions {
  domain: 'procity' | 'custom';
  subdomain?: string;
  customDomain?: string;
  ssl: boolean;
  password?: string;
  searchEngineIndexing: boolean;
  socialSharing: boolean;
}

export interface SiteBuilderState {
  currentProject: SiteProject | null;
  currentPage: SitePage | null;
  selectedElement: SiteElement | null;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  isPreviewMode: boolean;
  isDragging: boolean;
  draggedElement: SiteElement | null;
  clipboard: SiteElement | null;
  history: {
    past: SitePage[];
    present: SitePage | null;
    future: SitePage[];
  };
  aiAssistant: {
    isActive: boolean;
    suggestions: AIAssistantSuggestion[];
    isGenerating: boolean;
  };
}
