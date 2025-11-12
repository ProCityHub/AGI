import { SiteProject, SitePage, SiteElement, SiteTemplate, SiteTheme, AIAssistantSuggestion, SiteAnalytics } from '../types/siteBuilderTypes';
import { getMultiModalService } from './multiModalService';
import { getReasoningEngine } from './reasoningEngine';

export class SiteBuilderService {
  private projects: Map<string, SiteProject> = new Map();
  private templates: SiteTemplate[] = [];
  private themes: SiteTheme[] = [];

  constructor() {
    this.initializeTemplates();
    this.initializeThemes();
  }

  // Project Management
  async createProject(name: string, description: string, templateId?: string): Promise<string> {
    const projectId = this.generateId();
    const template = templateId ? this.templates.find(t => t.id === templateId) : null;
    
    const project: SiteProject = {
      id: projectId,
      name,
      description,
      pages: template ? this.createPagesFromTemplate(template) : [this.createDefaultPage()],
      theme: template?.theme || this.themes[0],
      settings: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1f2937',
        fontFamily: 'Inter, sans-serif',
        seo: {
          siteName: name,
          defaultDescription: description,
          defaultKeywords: []
        }
      },
      isPublished: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      owner: 'current-user' // Would be actual user ID
    };

    this.projects.set(projectId, project);
    console.log(`🌐 Created new site project: ${name}`);
    return projectId;
  }

  async duplicateProject(projectId: string, newName: string): Promise<string> {
    const originalProject = this.projects.get(projectId);
    if (!originalProject) throw new Error('Project not found');

    const newProjectId = this.generateId();
    const duplicatedProject: SiteProject = {
      ...JSON.parse(JSON.stringify(originalProject)),
      id: newProjectId,
      name: newName,
      isPublished: false,
      publishedUrl: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.projects.set(newProjectId, duplicatedProject);
    return newProjectId;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    return this.projects.delete(projectId);
  }

  // Page Management
  async createPage(projectId: string, name: string, template?: 'blank' | 'landing' | 'about' | 'contact'): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const pageId = this.generateId();
    const page: SitePage = {
      id: pageId,
      name,
      title: name,
      description: '',
      slug: this.slugify(name),
      elements: this.getTemplateElements(template || 'blank'),
      seo: {
        metaTitle: name,
        metaDescription: '',
        keywords: []
      },
      settings: {
        backgroundColor: '#ffffff'
      },
      isPublished: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    project.pages.push(page);
    project.updatedAt = Date.now();
    
    return pageId;
  }

  async duplicatePage(projectId: string, pageId: string): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const originalPage = project.pages.find(p => p.id === pageId);
    if (!originalPage) throw new Error('Page not found');

    const newPageId = this.generateId();
    const duplicatedPage: SitePage = {
      ...JSON.parse(JSON.stringify(originalPage)),
      id: newPageId,
      name: `${originalPage.name} (Copy)`,
      slug: `${originalPage.slug}-copy`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    project.pages.push(duplicatedPage);
    project.updatedAt = Date.now();
    
    return newPageId;
  }

  async deletePage(projectId: string, pageId: string): Promise<boolean> {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const pageIndex = project.pages.findIndex(p => p.id === pageId);
    if (pageIndex === -1) return false;

    project.pages.splice(pageIndex, 1);
    project.updatedAt = Date.now();
    
    return true;
  }

  // Element Management
  async createElement(
    projectId: string, 
    pageId: string, 
    type: SiteElement['type'], 
    position: { x: number; y: number }
  ): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    const page = project.pages.find(p => p.id === pageId);
    if (!page) throw new Error('Page not found');

    const elementId = this.generateId();
    const element: SiteElement = {
      id: elementId,
      type,
      content: this.getDefaultContent(type),
      styles: {
        position,
        size: this.getDefaultSize(type),
        padding: { top: 16, right: 16, bottom: 16, left: 16 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        backgroundColor: type === 'button' ? '#3b82f6' : undefined,
        color: type === 'button' ? '#ffffff' : '#1f2937',
        fontSize: this.getDefaultFontSize(type),
        fontFamily: 'Inter, sans-serif',
        textAlign: 'left',
        borderRadius: type === 'button' ? 8 : 0,
        zIndex: 1
      }
    };

    page.elements.push(element);
    page.updatedAt = Date.now();
    project.updatedAt = Date.now();

    return elementId;
  }

  async updateElement(
    projectId: string, 
    pageId: string, 
    elementId: string, 
    updates: Partial<SiteElement>
  ): Promise<boolean> {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const page = project.pages.find(p => p.id === pageId);
    if (!page) return false;

    const element = page.elements.find(e => e.id === elementId);
    if (!element) return false;

    Object.assign(element, updates);
    page.updatedAt = Date.now();
    project.updatedAt = Date.now();

    return true;
  }

  async deleteElement(projectId: string, pageId: string, elementId: string): Promise<boolean> {
    const project = this.projects.get(projectId);
    if (!project) return false;

    const page = project.pages.find(p => p.id === pageId);
    if (!page) return false;

    const elementIndex = page.elements.findIndex(e => e.id === elementId);
    if (elementIndex === -1) return false;

    page.elements.splice(elementIndex, 1);
    page.updatedAt = Date.now();
    project.updatedAt = Date.now();

    return true;
  }

  // AI Assistant Features
  async generateAISuggestions(projectId: string, pageId?: string): Promise<AIAssistantSuggestion[]> {
    const project = this.projects.get(projectId);
    if (!project) return [];

    const reasoningEngine = getReasoningEngine();
    const suggestions: AIAssistantSuggestion[] = [];

    try {
      // Analyze the current site structure
      const analysisContext = {
        projectName: project.name,
        pageCount: project.pages.length,
        currentPage: pageId ? project.pages.find(p => p.id === pageId) : null,
        theme: project.theme,
        settings: project.settings
      };

      // Generate content suggestions
      const contentChain = await reasoningEngine.reason(
        'Analyze this website and suggest content improvements',
        analysisContext,
        'abductive'
      );

      suggestions.push({
        id: this.generateId(),
        type: 'content',
        title: 'Improve Content Structure',
        description: 'Add compelling headlines and clear call-to-action buttons',
        action: 'Add engaging content sections',
        priority: 'high'
      });

      // Generate design suggestions
      suggestions.push({
        id: this.generateId(),
        type: 'design',
        title: 'Enhance Visual Appeal',
        description: 'Improve color contrast and typography for better readability',
        action: 'Update design elements',
        priority: 'medium'
      });

      // Generate SEO suggestions
      suggestions.push({
        id: this.generateId(),
        type: 'seo',
        title: 'Optimize for Search Engines',
        description: 'Add meta descriptions and improve page titles',
        action: 'Update SEO settings',
        priority: 'high'
      });

      return suggestions;
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
      return [];
    }
  }

  async generateContentWithAI(prompt: string, elementType: SiteElement['type']): Promise<any> {
    try {
      const multiModal = getMultiModalService();
      
      const enhancedPrompt = `Generate ${elementType} content for a website: ${prompt}. 
        Make it professional, engaging, and suitable for web use.`;

      const result = await multiModal.process({
        type: 'text',
        content: enhancedPrompt
      });

      return this.formatAIContent(result.content, elementType);
    } catch (error) {
      console.error('Failed to generate AI content:', error);
      return this.getDefaultContent(elementType);
    }
  }

  // Publishing
  async publishProject(projectId: string, options: { subdomain?: string; customDomain?: string }): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error('Project not found');

    // Generate published URL
    const publishedUrl = options.customDomain 
      ? `https://${options.customDomain}`
      : `https://${options.subdomain || project.name.toLowerCase().replace(/\s+/g, '-')}.procity.site`;

    project.isPublished = true;
    project.publishedUrl = publishedUrl;
    project.updatedAt = Date.now();

    // In a real implementation, this would deploy to hosting infrastructure
    console.log(`🚀 Published site: ${publishedUrl}`);
    
    return publishedUrl;
  }

  async unpublishProject(projectId: string): Promise<boolean> {
    const project = this.projects.get(projectId);
    if (!project) return false;

    project.isPublished = false;
    project.publishedUrl = undefined;
    project.updatedAt = Date.now();

    return true;
  }

  // Analytics (Mock data for demo)
  async getAnalytics(projectId: string, period: { start: number; end: number }): Promise<SiteAnalytics> {
    return {
      projectId,
      pageViews: Math.floor(Math.random() * 10000) + 1000,
      uniqueVisitors: Math.floor(Math.random() * 5000) + 500,
      bounceRate: Math.random() * 0.4 + 0.3, // 30-70%
      averageSessionDuration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
      topPages: [
        { page: 'Home', views: 1500, uniqueViews: 1200 },
        { page: 'About', views: 800, uniqueViews: 650 },
        { page: 'Contact', views: 400, uniqueViews: 350 }
      ],
      trafficSources: [
        { source: 'Direct', visits: 2000, percentage: 45 },
        { source: 'Google', visits: 1500, percentage: 35 },
        { source: 'Social Media', visits: 800, percentage: 20 }
      ],
      deviceBreakdown: {
        mobile: 60,
        tablet: 15,
        desktop: 25
      },
      performanceMetrics: {
        loadTime: Math.random() * 2 + 1, // 1-3 seconds
        firstContentfulPaint: Math.random() * 1.5 + 0.5,
        largestContentfulPaint: Math.random() * 2 + 1.5,
        cumulativeLayoutShift: Math.random() * 0.1
      },
      period
    };
  }

  // Getters
  getProject(projectId: string): SiteProject | undefined {
    return this.projects.get(projectId);
  }

  getAllProjects(): SiteProject[] {
    return Array.from(this.projects.values());
  }

  getTemplates(): SiteTemplate[] {
    return this.templates;
  }

  getThemes(): SiteTheme[] {
    return this.themes;
  }

  // Private Methods
  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'business-modern',
        name: 'Modern Business',
        description: 'Clean and professional template for businesses',
        preview: '/templates/business-modern.jpg',
        category: 'business',
        isPremium: false,
        tags: ['professional', 'clean', 'corporate'],
        pages: [
          {
            name: 'Home',
            title: 'Welcome to Our Business',
            description: 'Professional business homepage',
            slug: 'home',
            elements: [],
            seo: { metaTitle: 'Home', metaDescription: '', keywords: [] },
            settings: { backgroundColor: '#ffffff' },
            isPublished: false
          }
        ],
        theme: this.themes[0] || this.createDefaultTheme()
      },
      {
        id: 'portfolio-creative',
        name: 'Creative Portfolio',
        description: 'Showcase your work with this creative portfolio template',
        preview: '/templates/portfolio-creative.jpg',
        category: 'portfolio',
        isPremium: false,
        tags: ['creative', 'portfolio', 'showcase'],
        pages: [
          {
            name: 'Portfolio',
            title: 'My Creative Work',
            description: 'Creative portfolio showcase',
            slug: 'portfolio',
            elements: [],
            seo: { metaTitle: 'Portfolio', metaDescription: '', keywords: [] },
            settings: { backgroundColor: '#f8fafc' },
            isPublished: false
          }
        ],
        theme: this.createDefaultTheme()
      },
      {
        id: 'restaurant-elegant',
        name: 'Elegant Restaurant',
        description: 'Beautiful template for restaurants and cafes',
        preview: '/templates/restaurant-elegant.jpg',
        category: 'restaurant',
        isPremium: true,
        tags: ['restaurant', 'elegant', 'food'],
        pages: [
          {
            name: 'Menu',
            title: 'Our Delicious Menu',
            description: 'Restaurant menu page',
            slug: 'menu',
            elements: [],
            seo: { metaTitle: 'Menu', metaDescription: '', keywords: [] },
            settings: { backgroundColor: '#1f2937' },
            isPublished: false
          }
        ],
        theme: this.createDefaultTheme()
      }
    ];
  }

  private initializeThemes(): void {
    this.themes = [
      {
        id: 'modern-blue',
        name: 'Modern Blue',
        description: 'Clean and modern theme with blue accents',
        preview: '/themes/modern-blue.jpg',
        category: 'business',
        colors: {
          primary: '#3b82f6',
          secondary: '#1f2937',
          accent: '#10b981',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1f2937',
          textSecondary: '#6b7280'
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        components: {
          button: { borderRadius: 8, padding: '12px 24px' },
          card: { borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
          header: { height: 80, backgroundColor: '#ffffff' },
          footer: { backgroundColor: '#1f2937', color: '#ffffff' }
        }
      },
      {
        id: 'creative-purple',
        name: 'Creative Purple',
        description: 'Bold and creative theme with purple gradients',
        preview: '/themes/creative-purple.jpg',
        category: 'creative',
        colors: {
          primary: '#8b5cf6',
          secondary: '#ec4899',
          accent: '#f59e0b',
          background: '#fafafa',
          surface: '#ffffff',
          text: '#1f2937',
          textSecondary: '#6b7280'
        },
        fonts: {
          heading: 'Poppins, sans-serif',
          body: 'Inter, sans-serif'
        },
        components: {
          button: { borderRadius: 25, padding: '14px 28px' },
          card: { borderRadius: 16, boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)' },
          header: { height: 90, backgroundColor: 'transparent' },
          footer: { backgroundColor: '#1f2937', color: '#ffffff' }
        }
      }
    ];
  }

  private createDefaultTheme(): SiteTheme {
    return {
      id: 'default',
      name: 'Default',
      description: 'Default theme',
      preview: '',
      category: 'business',
      colors: {
        primary: '#3b82f6',
        secondary: '#1f2937',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1f2937',
        textSecondary: '#6b7280'
      },
      fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif'
      },
      components: {
        button: {},
        card: {},
        header: {},
        footer: {}
      }
    };
  }

  private createDefaultPage(): SitePage {
    return {
      id: this.generateId(),
      name: 'Home',
      title: 'Welcome',
      description: 'Homepage',
      slug: 'home',
      elements: [],
      seo: {
        metaTitle: 'Home',
        metaDescription: '',
        keywords: []
      },
      settings: {
        backgroundColor: '#ffffff'
      },
      isPublished: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  private createPagesFromTemplate(template: SiteTemplate): SitePage[] {
    return template.pages.map(page => ({
      ...page,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
  }

  private getTemplateElements(template: string): SiteElement[] {
    switch (template) {
      case 'landing':
        return [
          {
            id: this.generateId(),
            type: 'text',
            content: { text: 'Welcome to Our Amazing Product', tag: 'h1' },
            styles: {
              position: { x: 50, y: 100 },
              size: { width: 600, height: 80 },
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              margin: { top: 0, right: 0, bottom: 20, left: 0 },
              fontSize: 48,
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#1f2937'
            }
          },
          {
            id: this.generateId(),
            type: 'button',
            content: { text: 'Get Started', link: '#' },
            styles: {
              position: { x: 300, y: 250 },
              size: { width: 200, height: 50 },
              padding: { top: 12, right: 24, bottom: 12, left: 24 },
              margin: { top: 20, right: 0, bottom: 0, left: 0 },
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '600',
              textAlign: 'center',
              borderRadius: 8
            }
          }
        ];
      case 'about':
        return [
          {
            id: this.generateId(),
            type: 'text',
            content: { text: 'About Us', tag: 'h1' },
            styles: {
              position: { x: 50, y: 50 },
              size: { width: 400, height: 60 },
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              margin: { top: 0, right: 0, bottom: 20, left: 0 },
              fontSize: 36,
              fontWeight: 'bold',
              color: '#1f2937'
            }
          }
        ];
      case 'contact':
        return [
          {
            id: this.generateId(),
            type: 'text',
            content: { text: 'Contact Us', tag: 'h1' },
            styles: {
              position: { x: 50, y: 50 },
              size: { width: 400, height: 60 },
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
              margin: { top: 0, right: 0, bottom: 20, left: 0 },
              fontSize: 36,
              fontWeight: 'bold',
              color: '#1f2937'
            }
          },
          {
            id: this.generateId(),
            type: 'form',
            content: {
              fields: [
                { type: 'text', name: 'name', label: 'Name', required: true },
                { type: 'email', name: 'email', label: 'Email', required: true },
                { type: 'textarea', name: 'message', label: 'Message', required: true }
              ],
              submitText: 'Send Message'
            },
            styles: {
              position: { x: 50, y: 150 },
              size: { width: 500, height: 400 },
              padding: { top: 20, right: 20, bottom: 20, left: 20 },
              margin: { top: 0, right: 0, bottom: 0, left: 0 },
              backgroundColor: '#f8fafc',
              borderRadius: 8
            }
          }
        ];
      default:
        return [];
    }
  }

  private getDefaultContent(type: SiteElement['type']): any {
    switch (type) {
      case 'text':
        return { text: 'Your text here', tag: 'p' };
      case 'image':
        return { src: '', alt: 'Image', caption: '' };
      case 'video':
        return { src: '', poster: '', autoplay: false };
      case 'button':
        return { text: 'Click me', link: '#' };
      case 'form':
        return {
          fields: [
            { type: 'text', name: 'name', label: 'Name', required: true }
          ],
          submitText: 'Submit'
        };
      case 'gallery':
        return { images: [], columns: 3 };
      case 'map':
        return { address: '', zoom: 15 };
      case 'embed':
        return { code: '' };
      case 'divider':
        return { style: 'solid', thickness: 1 };
      case 'spacer':
        return { height: 50 };
      default:
        return {};
    }
  }

  private getDefaultSize(type: SiteElement['type']): { width: number; height: number } {
    switch (type) {
      case 'text':
        return { width: 400, height: 50 };
      case 'image':
        return { width: 300, height: 200 };
      case 'video':
        return { width: 500, height: 300 };
      case 'button':
        return { width: 150, height: 40 };
      case 'form':
        return { width: 400, height: 300 };
      case 'gallery':
        return { width: 600, height: 400 };
      case 'map':
        return { width: 400, height: 300 };
      case 'embed':
        return { width: 500, height: 300 };
      case 'divider':
        return { width: 400, height: 2 };
      case 'spacer':
        return { width: 100, height: 50 };
      default:
        return { width: 200, height: 100 };
    }
  }

  private getDefaultFontSize(type: SiteElement['type']): number {
    switch (type) {
      case 'text':
        return 16;
      case 'button':
        return 14;
      default:
        return 16;
    }
  }

  private formatAIContent(content: string, elementType: SiteElement['type']): any {
    switch (elementType) {
      case 'text':
        return { text: content, tag: 'p' };
      case 'button':
        return { text: content.substring(0, 20), link: '#' };
      default:
        return { text: content };
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private generateId(): string {
    return `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let siteBuilderServiceInstance: SiteBuilderService | null = null;

export function getSiteBuilderService(): SiteBuilderService {
  if (!siteBuilderServiceInstance) {
    siteBuilderServiceInstance = new SiteBuilderService();
  }
  return siteBuilderServiceInstance;
}

export function initializeSiteBuilderService(): SiteBuilderService {
  siteBuilderServiceInstance = new SiteBuilderService();
  return siteBuilderServiceInstance;
}
