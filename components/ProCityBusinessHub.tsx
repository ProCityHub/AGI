import React, { useState, useEffect } from 'react';
import { BusinessService, LeadCapture, ServiceCategory, SERVICE_CATEGORIES, BusinessMetrics } from '../types/businessTypes';
import { getBusinessPlatformService } from '../services/businessPlatformService';

interface ProCityBusinessHubProps {
  onClose: () => void;
}

const ProCityBusinessHub: React.FC<ProCityBusinessHubProps> = ({ onClose }) => {
  const [currentView, setCurrentView] = useState<'home' | 'services' | 'lead_form' | 'consultation' | 'dashboard'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<BusinessService | null>(null);
  const [services, setServices] = useState<BusinessService[]>([]);
  const [leads, setLeads] = useState<LeadCapture[]>([]);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [leadForm, setLeadForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    industry: '',
    companySize: '',
    annualRevenue: '',
    serviceInterest: [] as string[],
    urgency: 'within_month' as const,
    budget: '',
    message: '',
    marketingOptIn: false
  });

  const businessService = getBusinessPlatformService();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allServices = businessService.getAllServices();
    const allLeads = businessService.getAllLeads();
    const businessMetrics = await businessService.getBusinessMetrics();
    
    setServices(allServices);
    setLeads(allLeads);
    setMetrics(businessMetrics);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const leadId = await businessService.captureLeadWithEmail({
        ...leadForm,
        source: 'website',
        status: 'new',
        priority: 'medium'
      });
      
      alert('🎉 Thank you! Your information has been submitted. We\'ll contact you within 24 hours.');
      
      // Reset form
      setLeadForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        industry: '',
        companySize: '',
        annualRevenue: '',
        serviceInterest: [],
        urgency: 'within_month',
        budget: '',
        message: '',
        marketingOptIn: false
      });
      
      setCurrentView('home');
      loadData();
    } catch (error) {
      console.error('Failed to submit lead:', error);
      alert('Sorry, there was an error submitting your information. Please try again.');
    }
  };

  const handleServiceInterestToggle = (serviceId: string) => {
    setLeadForm(prev => ({
      ...prev,
      serviceInterest: prev.serviceInterest.includes(serviceId)
        ? prev.serviceInterest.filter(id => id !== serviceId)
        : [...prev.serviceInterest, serviceId]
    }));
  };

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              ProCity Business Hub
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              The Revolutionary Platform for Professional Services
            </p>
            <p className="text-lg mb-12 text-blue-200 max-w-4xl mx-auto">
              Licensed professionals • Verified compliance • AI-powered matching • Government services • Tax expertise • Legal solutions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCurrentView('services')}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Explore Services
              </button>
              <button
                onClick={() => setCurrentView('lead_form')}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Get Free Consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Thousands of Businesses</h2>
            <p className="text-xl text-gray-600">Licensed, verified, and compliant professional services</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{metrics?.verifiedProviders || 0}+</div>
              <div className="text-gray-600">Verified Providers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{metrics?.complianceScore || 0}%</div>
              <div className="text-gray-600">Compliance Score</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{metrics?.totalLeads || 0}+</div>
              <div className="text-gray-600">Clients Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">{Math.round(metrics?.customerSatisfaction || 0)}%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All services require proper licensing and regulatory compliance. We verify every provider.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.values(SERVICE_CATEGORIES).map(category => (
              <div
                key={category.id}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-l-4"
                style={{ borderLeftColor: category.color }}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentView('services');
                }}
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                {category.isRegulated && (
                  <div className="flex items-center text-sm text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Licensed & Regulated
                  </div>
                )}
                <div className="mt-4 text-sm text-gray-500">
                  {category.services.length} services available
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ProCity?</h2>
            <p className="text-xl text-gray-600">Revolutionary approach to professional services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Verified Compliance</h3>
              <p className="text-gray-600">Every provider is licensed, insured, and background-checked. We verify credentials with regulatory bodies.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Matching</h3>
              <p className="text-gray-600">Our advanced AI matches you with the perfect provider based on your specific needs and requirements.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Legal Protection</h3>
              <p className="text-gray-600">All services come with legal protection, insurance coverage, and compliance guarantees.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of businesses who trust ProCity for their professional service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentView('lead_form')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
            >
              Get Free Consultation
            </button>
            <button
              onClick={() => setCurrentView('services')}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => {
    const categoryServices = selectedCategory 
      ? services.filter(service => service.category.id === selectedCategory)
      : services;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Professional Services</h1>
                <p className="text-gray-600 mt-2">Licensed and verified professional service providers</p>
              </div>
              <button
                onClick={() => setCurrentView('home')}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  !selectedCategory 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Services
              </button>
              {Object.values(SERVICE_CATEGORIES).map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryServices.map(service => (
              <div key={service.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{service.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          service.complianceLevel === 'government' ? 'bg-red-500' :
                          service.complianceLevel === 'professional' ? 'bg-green-500' :
                          'bg-blue-500'
                        }`}></span>
                        {service.complianceLevel === 'government' ? 'Government Level' :
                         service.complianceLevel === 'professional' ? 'Licensed Professional' :
                         'Professional Service'}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{service.shortDescription}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">⏱️</span>
                      {service.estimatedTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-2">💰</span>
                      {service.pricing.type === 'consultation' 
                        ? `$${service.pricing.consultationFee} consultation`
                        : `From $${service.pricing.basePrice}`}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedService(service);
                      setLeadForm(prev => ({
                        ...prev,
                        serviceInterest: [service.id]
                      }));
                      setCurrentView('lead_form');
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLeadForm = () => (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Your Free Consultation</h2>
            <p className="text-gray-600">
              Tell us about your needs and we'll match you with the perfect licensed professional
            </p>
          </div>

          <form onSubmit={handleLeadSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={leadForm.firstName}
                  onChange={(e) => setLeadForm({...leadForm, firstName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={leadForm.lastName}
                  onChange={(e) => setLeadForm({...leadForm, lastName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({...leadForm, company: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={leadForm.jobTitle}
                  onChange={(e) => setLeadForm({...leadForm, jobTitle: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                <select
                  value={leadForm.companySize}
                  onChange={(e) => setLeadForm({...leadForm, companySize: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select size</option>
                  <option value="startup">Startup (1-10 employees)</option>
                  <option value="small">Small (11-50 employees)</option>
                  <option value="medium">Medium (51-200 employees)</option>
                  <option value="large">Large (201-1000 employees)</option>
                  <option value="enterprise">Enterprise (1000+ employees)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Revenue</label>
                <select
                  value={leadForm.annualRevenue}
                  onChange={(e) => setLeadForm({...leadForm, annualRevenue: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select range</option>
                  <option value="under_1m">Under $1M</option>
                  <option value="1m_5m">$1M - $5M</option>
                  <option value="5m_25m">$5M - $25M</option>
                  <option value="25m_100m">$25M - $100M</option>
                  <option value="over_100m">Over $100M</option>
                </select>
              </div>
            </div>

            {/* Service Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Services of Interest *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(SERVICE_CATEGORIES).map(category => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={leadForm.serviceInterest.includes(category.id)}
                      onChange={() => handleServiceInterestToggle(category.id)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {category.icon} {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                <select
                  value={leadForm.urgency}
                  onChange={(e) => setLeadForm({...leadForm, urgency: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="immediate">Immediate (ASAP)</option>
                  <option value="within_month">Within 1 month</option>
                  <option value="within_quarter">Within 3 months</option>
                  <option value="planning_ahead">Planning ahead</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                <select
                  value={leadForm.budget}
                  onChange={(e) => setLeadForm({...leadForm, budget: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select budget</option>
                  <option value="under_10k">Under $10,000</option>
                  <option value="10k_50k">$10,000 - $50,000</option>
                  <option value="50k_100k">$50,000 - $100,000</option>
                  <option value="100k_500k">$100,000 - $500,000</option>
                  <option value="over_500k">Over $500,000</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
              <textarea
                value={leadForm.message}
                onChange={(e) => setLeadForm({...leadForm, message: e.target.value})}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us more about your specific needs..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="marketing-opt-in"
                checked={leadForm.marketingOptIn}
                onChange={(e) => setLeadForm({...leadForm, marketingOptIn: e.target.checked})}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="marketing-opt-in" className="text-sm text-gray-700">
                I'd like to receive updates about relevant services and industry insights
              </label>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">ProCity Business Hub</h1>
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setCurrentView('home')}
                  className={`text-sm font-medium ${currentView === 'home' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentView('services')}
                  className={`text-sm font-medium ${currentView === 'services' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Services
                </button>
                <button
                  onClick={() => setCurrentView('lead_form')}
                  className={`text-sm font-medium ${currentView === 'lead_form' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Get Quote
                </button>
              </nav>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        {currentView === 'home' && renderHome()}
        {currentView === 'services' && renderServices()}
        {currentView === 'lead_form' && renderLeadForm()}
      </div>
    </div>
  );
};

export default ProCityBusinessHub;
