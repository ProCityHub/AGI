import React, { useState, useEffect, useRef } from 'react';
import { SiteProject, SitePage, SiteElement, SiteTemplate, SiteBuilderState } from '../types/siteBuilderTypes';
import { getSiteBuilderService } from '../services/siteBuilderService';

interface ProCitySiteBuilderProps {
  onClose: () => void;
  projectId?: string;
}

const ProCitySiteBuilder: React.FC<ProCitySiteBuilderProps> = ({ onClose, projectId }) => {
  const [builderState, setBuilderState] = useState<SiteBuilderState>({
    currentProject: null,
    currentPage: null,
    selectedElement: null,
    viewMode: 'desktop',
    isPreviewMode: false,
    isDragging: false,
    draggedElement: null,
    clipboard: null,
    history: { past: [], present: null, future: [] },
    aiAssistant: { isActive: false, suggestions: [], isGenerating: false }
  });

  const [projects, setProjects] = useState<SiteProject[]>([]);
  const [templates, setTemplates] = useState<SiteTemplate[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({ name: '', description: '', templateId: '' });

  const canvasRef = useRef<HTMLDivElement>(null);
  const siteBuilderService = getSiteBuilderService();

  useEffect(() => {
    loadProjects();
    loadTemplates();
    
    // If projectId is provided, load that project directly
    if (projectId) {
      const project = siteBuilderService.getProject(projectId);
      if (project) {
        setBuilderState(prev => ({
          ...prev,
          currentProject: project,
          currentPage: project.pages[0] || null
        }));
        setShowProjectSelector(false);
      }
    }
  }, [projectId]);

  const loadProjects = () => {
    const allProjects = siteBuilderService.getAllProjects();
    setProjects(allProjects);
  };

  const loadTemplates = () => {
    const allTemplates = siteBuilderService.getTemplates();
    setTemplates(allTemplates);
  };

  const handleCreateProject = async () => {
    try {
      const projectId = await siteBuilderService.createProject(
        newProjectForm.name,
        newProjectForm.description,
        newProjectForm.templateId || undefined
      );
      
      const project = siteBuilderService.getProject(projectId);
      if (project) {
        setBuilderState(prev => ({
          ...prev,
          currentProject: project,
          currentPage: project.pages[0] || null
        }));
        setShowProjectSelector(false);
        setIsCreatingProject(false);
        setNewProjectForm({ name: '', description: '', templateId: '' });
        loadProjects();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleSelectProject = (project: SiteProject) => {
    setBuilderState(prev => ({
      ...prev,
      currentProject: project,
      currentPage: project.pages[0] || null
    }));
    setShowProjectSelector(false);
  };

  const handleSelectPage = (page: SitePage) => {
    setBuilderState(prev => ({
      ...prev,
      currentPage: page,
      selectedElement: null
    }));
  };

  const handleAddElement = async (type: SiteElement['type'], position: { x: number; y: number }) => {
    if (!builderState.currentProject || !builderState.currentPage) return;

    try {
      const elementId = await siteBuilderService.createElement(
        builderState.currentProject.id,
        builderState.currentPage.id,
        type,
        position
      );

      // Refresh the current page
      const updatedProject = siteBuilderService.getProject(builderState.currentProject.id);
      if (updatedProject) {
        const updatedPage = updatedProject.pages.find(p => p.id === builderState.currentPage!.id);
        if (updatedPage) {
          setBuilderState(prev => ({
            ...prev,
            currentProject: updatedProject,
            currentPage: updatedPage
          }));
        }
      }
    } catch (error) {
      console.error('Failed to add element:', error);
    }
  };

  const handleSelectElement = (element: SiteElement) => {
    setBuilderState(prev => ({
      ...prev,
      selectedElement: element
    }));
  };

  const handleUpdateElement = async (elementId: string, updates: Partial<SiteElement>) => {
    if (!builderState.currentProject || !builderState.currentPage) return;

    try {
      await siteBuilderService.updateElement(
        builderState.currentProject.id,
        builderState.currentPage.id,
        elementId,
        updates
      );

      // Refresh the current page
      const updatedProject = siteBuilderService.getProject(builderState.currentProject.id);
      if (updatedProject) {
        const updatedPage = updatedProject.pages.find(p => p.id === builderState.currentPage!.id);
        if (updatedPage) {
          setBuilderState(prev => ({
            ...prev,
            currentProject: updatedProject,
            currentPage: updatedPage,
            selectedElement: updatedPage.elements.find(e => e.id === elementId) || null
          }));
        }
      }
    } catch (error) {
      console.error('Failed to update element:', error);
    }
  };

  const handleDeleteElement = async (elementId: string) => {
    if (!builderState.currentProject || !builderState.currentPage) return;

    try {
      await siteBuilderService.deleteElement(
        builderState.currentProject.id,
        builderState.currentPage.id,
        elementId
      );

      // Refresh the current page
      const updatedProject = siteBuilderService.getProject(builderState.currentProject.id);
      if (updatedProject) {
        const updatedPage = updatedProject.pages.find(p => p.id === builderState.currentPage!.id);
        if (updatedPage) {
          setBuilderState(prev => ({
            ...prev,
            currentProject: updatedProject,
            currentPage: updatedPage,
            selectedElement: null
          }));
        }
      }
    } catch (error) {
      console.error('Failed to delete element:', error);
    }
  };

  const handlePublish = async () => {
    if (!builderState.currentProject) return;

    try {
      const publishedUrl = await siteBuilderService.publishProject(
        builderState.currentProject.id,
        { subdomain: builderState.currentProject.name.toLowerCase().replace(/\s+/g, '-') }
      );
      
      alert(`🚀 Site published successfully!\nURL: ${publishedUrl}`);
      loadProjects();
    } catch (error) {
      console.error('Failed to publish site:', error);
      alert('Failed to publish site. Please try again.');
    }
  };

  const getViewportWidth = () => {
    switch (builderState.viewMode) {
      case 'mobile': return 375;
      case 'tablet': return 768;
      case 'desktop': return 1200;
      default: return 1200;
    }
  };

  const renderElement = (element: SiteElement) => {
    const isSelected = builderState.selectedElement?.id === element.id;
    const elementStyle = {
      position: 'absolute' as const,
      left: element.styles.position.x,
      top: element.styles.position.y,
      width: element.styles.size.width,
      height: element.styles.size.height,
      padding: `${element.styles.padding.top}px ${element.styles.padding.right}px ${element.styles.padding.bottom}px ${element.styles.padding.left}px`,
      margin: `${element.styles.margin.top}px ${element.styles.margin.right}px ${element.styles.margin.bottom}px ${element.styles.margin.left}px`,
      backgroundColor: element.styles.backgroundColor,
      color: element.styles.color,
      fontSize: element.styles.fontSize,
      fontFamily: element.styles.fontFamily,
      fontWeight: element.styles.fontWeight,
      textAlign: element.styles.textAlign,
      borderRadius: element.styles.borderRadius,
      border: isSelected ? '2px solid #3b82f6' : element.styles.border,
      boxShadow: element.styles.boxShadow,
      opacity: element.styles.opacity,
      zIndex: element.styles.zIndex,
      cursor: 'pointer'
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleSelectElement(element);
    };

    switch (element.type) {
      case 'text':
        const TextTag = element.content.tag || 'p';
        return (
          <TextTag
            key={element.id}
            style={elementStyle}
            onClick={handleClick}
            contentEditable={isSelected}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              if (isSelected) {
                handleUpdateElement(element.id, {
                  content: { ...element.content, text: e.currentTarget.textContent || '' }
                });
              }
            }}
          >
            {element.content.text}
          </TextTag>
        );

      case 'button':
        return (
          <button
            key={element.id}
            style={elementStyle}
            onClick={handleClick}
          >
            {element.content.text}
          </button>
        );

      case 'image':
        return (
          <div key={element.id} style={elementStyle} onClick={handleClick}>
            {element.content.src ? (
              <img
                src={element.content.src}
                alt={element.content.alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
                📷 Image
              </div>
            )}
          </div>
        );

      case 'divider':
        return (
          <hr
            key={element.id}
            style={{
              ...elementStyle,
              height: element.content.thickness || 1,
              border: 'none',
              backgroundColor: element.styles.color || '#e5e7eb'
            }}
            onClick={handleClick}
          />
        );

      case 'spacer':
        return (
          <div
            key={element.id}
            style={{
              ...elementStyle,
              backgroundColor: 'transparent',
              border: isSelected ? '2px dashed #3b82f6' : 'none'
            }}
            onClick={handleClick}
          >
            {isSelected && <span className="text-xs text-gray-400">Spacer</span>}
          </div>
        );

      default:
        return (
          <div
            key={element.id}
            style={elementStyle}
            onClick={handleClick}
          >
            {element.type}
          </div>
        );
    }
  };

  if (showProjectSelector) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">🌐 ProCity Site Builder</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Your Projects</h3>
              <button
                onClick={() => setIsCreatingProject(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                + New Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌐</div>
                <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Create your first website to get started</p>
                <button
                  onClick={() => setIsCreatingProject(true)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                >
                  Create Your First Site
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="border rounded-lg p-4 hover:shadow-lg cursor-pointer transition-shadow"
                    onClick={() => handleSelectProject(project)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{project.name}</h4>
                      {project.isPublished && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Published
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{project.pages.length} pages</span>
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isCreatingProject && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Name</label>
                    <input
                      type="text"
                      value={newProjectForm.name}
                      onChange={(e) => setNewProjectForm({...newProjectForm, name: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="My Awesome Website"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={newProjectForm.description}
                      onChange={(e) => setNewProjectForm({...newProjectForm, description: e.target.value})}
                      className="w-full border rounded px-3 py-2 h-20"
                      placeholder="Describe your website..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Template (Optional)</label>
                    <select
                      value={newProjectForm.templateId}
                      onChange={(e) => setNewProjectForm({...newProjectForm, templateId: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Start from scratch</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name} - {template.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setIsCreatingProject(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProject}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={!newProjectForm.name}
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowProjectSelector(true)}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back to Projects
          </button>
          <h1 className="text-xl font-semibold">{builderState.currentProject?.name}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['desktop', 'tablet', 'mobile'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setBuilderState(prev => ({ ...prev, viewMode: mode }))}
                className={`px-3 py-1 rounded text-sm ${
                  builderState.viewMode === mode
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {mode === 'desktop' ? '🖥️' : mode === 'tablet' ? '📱' : '📱'}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setBuilderState(prev => ({ ...prev, isPreviewMode: !prev.isPreviewMode }))}
            className={`px-4 py-2 rounded ${
              builderState.isPreviewMode
                ? 'bg-gray-200 text-gray-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {builderState.isPreviewMode ? 'Edit' : 'Preview'}
          </button>

          <button
            onClick={handlePublish}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Publish
          </button>

          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar - Elements & Pages */}
        {!builderState.isPreviewMode && (
          <div className="w-64 bg-white border-r flex flex-col">
            {/* Pages */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-2">Pages</h3>
              <div className="space-y-1">
                {builderState.currentProject?.pages.map(page => (
                  <div
                    key={page.id}
                    onClick={() => handleSelectPage(page)}
                    className={`p-2 rounded cursor-pointer text-sm ${
                      builderState.currentPage?.id === page.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Elements */}
            <div className="p-4 flex-1">
              <h3 className="font-semibold mb-2">Elements</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'text', icon: '📝', label: 'Text' },
                  { type: 'image', icon: '🖼️', label: 'Image' },
                  { type: 'button', icon: '🔘', label: 'Button' },
                  { type: 'form', icon: '📋', label: 'Form' },
                  { type: 'video', icon: '🎥', label: 'Video' },
                  { type: 'gallery', icon: '🖼️', label: 'Gallery' },
                  { type: 'map', icon: '🗺️', label: 'Map' },
                  { type: 'divider', icon: '➖', label: 'Divider' },
                  { type: 'spacer', icon: '⬜', label: 'Spacer' },
                  { type: 'embed', icon: '🔗', label: 'Embed' }
                ].map(element => (
                  <button
                    key={element.type}
                    onClick={() => handleAddElement(element.type as SiteElement['type'], { x: 100, y: 100 })}
                    className="p-3 border rounded hover:bg-gray-50 text-center text-xs"
                  >
                    <div className="text-lg mb-1">{element.icon}</div>
                    {element.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col items-center bg-gray-100 overflow-auto">
          <div className="py-8">
            <div
              ref={canvasRef}
              className="bg-white shadow-lg relative"
              style={{
                width: getViewportWidth(),
                minHeight: 800,
                transform: builderState.viewMode === 'mobile' ? 'scale(0.8)' : 'scale(1)',
                transformOrigin: 'top center'
              }}
              onClick={(e) => {
                if (e.target === canvasRef.current) {
                  setBuilderState(prev => ({ ...prev, selectedElement: null }));
                }
              }}
            >
              {builderState.currentPage?.elements.map(renderElement)}
              
              {/* Empty state */}
              {(!builderState.currentPage?.elements || builderState.currentPage.elements.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <h3 className="text-xl font-semibold mb-2">Start Building</h3>
                    <p>Click elements from the sidebar to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        {!builderState.isPreviewMode && builderState.selectedElement && (
          <div className="w-64 bg-white border-l p-4">
            <h3 className="font-semibold mb-4">Element Properties</h3>
            
            <div className="space-y-4">
              {/* Position */}
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="X"
                    value={builderState.selectedElement.styles.position.x}
                    onChange={(e) => handleUpdateElement(builderState.selectedElement!.id, {
                      styles: {
                        ...builderState.selectedElement!.styles,
                        position: {
                          ...builderState.selectedElement!.styles.position,
                          x: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Y"
                    value={builderState.selectedElement.styles.position.y}
                    onChange={(e) => handleUpdateElement(builderState.selectedElement!.id, {
                      styles: {
                        ...builderState.selectedElement!.styles,
                        position: {
                          ...builderState.selectedElement!.styles.position,
                          y: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    className="border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Width"
                    value={builderState.selectedElement.styles.size.width}
                    onChange={(e) => handleUpdateElement(builderState.selectedElement!.id, {
                      styles: {
                        ...builderState.selectedElement!.styles,
                        size: {
                          ...builderState.selectedElement!.styles.size,
                          width: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Height"
                    value={builderState.selectedElement.styles.size.height}
                    onChange={(e) => handleUpdateElement(builderState.selectedElement!.id, {
                      styles: {
                        ...builderState.selectedElement!.styles,
                        size: {
                          ...builderState.selectedElement!.styles.size,
                          height: parseInt(e.target.value) || 0
                        }
                      }
                    })}
                    className="border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium mb-1">Background Color</label>
                <input
                  type="color"
                  value={builderState.selectedElement.styles.backgroundColor || '#ffffff'}
                  onChange={(e) => handleUpdateElement(builderState.selectedElement!.id, {
                    styles: {
                      ...builderState.selectedElement!.styles,
                      backgroundColor: e.target.value
                    }
                  })}
                  className="w-full h-8 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Text Color</label>
                <input
                  type="color"
                  value={builderState.selectedElement.styles.color || '#000000'}
                  onChange={(e) => handleUpdateElement(builderState.selectedElement!.id, {
                    styles: {
                      ...builderState.selectedElement!.styles,
                      color: e.target.value
                    }
                  })}
                  className="w-full h-8 border rounded"
                />
              </div>

              {/* Typography */}
              {(builderState.selectedElement.type === 'text' || builderState.selectedElement.type === 'button') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Font Size</label>
                    <input
                      type="number"
                      value={builderState.selectedElement.styles.fontSize || 16}
                      onChange={(e) => handleUpdateElement(builderState.selectedElement!.id, {
                        styles: {
                          ...builderState.selectedElement!.styles,
                          fontSize: parseInt(e.target.value) || 16
                        }
                      })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Font Weight</label>
                    <select
                      value={builderState.selectedElement.styles.fontWeight || 'normal'}
                      onChange={(e) => handleUpdateElement(builderState.selectedElement!.id, {
                        styles: {
                          ...builderState.selectedElement!.styles,
                          fontWeight: e.target.value
                        }
                      })}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="600">Semi Bold</option>
                      <option value="300">Light</option>
                    </select>
                  </div>
                </>
              )}

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteElement(builderState.selectedElement!.id)}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Delete Element
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProCitySiteBuilder;
