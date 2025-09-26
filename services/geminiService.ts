
import { GoogleGenAI, Type } from "@google/genai";
import type { Directive, FormProcessResult, OrgChart, AgentProfile, SystemAuditReport, FeedItem, OrgChartSkeleton, AgentArchetype, OpportunityDossier, SystemProposal, CommunicationsAuditReport, Expense, FinancialReport, InvoiceData, BoardAdvisory, DesignConcept, WebsiteAuditReport, CompatibilityReport, SystemEvolutionPlan, SystemIQReport, SynergyProtocol, Plugin, AppContext, AgentIdentity, EvolutionBlueprint } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const directiveSchema = {
    type: Type.OBJECT,
    properties: {
        projectIntake: {
            type: Type.OBJECT,
            properties: {
                projectName: { type: Type.STRING },
                projectType: { type: Type.STRING }
            },
            required: ["projectName", "projectType"]
        },
        documentationReview: {
            type: Type.OBJECT,
            properties: {
                sources: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
            required: ["sources"]
        },
        scopeClarification: { type: Type.STRING },
        agentCohort: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING },
                    perspective: { type: Type.STRING }
                },
                required: ["role", "perspective"]
            }
        },
        collaborationProtocol: { type: Type.STRING },
        scopeOfWork: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    agentRole: { type: Type.STRING },
                    agentRoleDescription: { type: Type.STRING },
                    title: { type: Type.STRING },
                    scope: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    barChart: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            data: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        value: { type: Type.NUMBER }
                                    },
                                    required: ["name", "value"]
                                }
                            }
                        },
                        required: ["title", "data"]
                    },
                    lineChart: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            data: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        value1: { type: Type.NUMBER },
                                        value2: { type: Type.NUMBER }
                                    },
                                    required: ["name", "value1", "value2"]
                                }
                            }
                        },
                         required: ["title", "data"]
                    }
                },
                required: ["agentRole", "agentRoleDescription", "title", "scope", "summary"]
            }
        },
        ancillaryConsiderations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    points: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ["title", "points"]
            }
        },
        synthesisMethodology: { type: Type.STRING },
        finalNote: { type: Type.STRING }
    },
    required: ["projectIntake", "documentationReview", "scopeClarification", "agentCohort", "collaborationProtocol", "scopeOfWork", "ancillaryConsiderations", "synthesisMethodology", "finalNote"]
};

const formProcessingSchema = {
    type: Type.OBJECT,
    properties: {
        assignedAgent: { type: Type.STRING },
        formFields: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    fieldName: { type: Type.STRING },
                    fieldValue: { type: Type.STRING }
                },
                required: ["fieldName", "fieldValue"]
            }
        },
        summaryNotes: { type: Type.STRING },
        invoiceData: {
            type: Type.OBJECT,
            properties: {
                invoiceNumber: { type: Type.STRING },
                issueDate: { type: Type.STRING },
                dueDate: { type: Type.STRING },
                businessName: { type: Type.STRING },
                businessAddress: { type: Type.STRING },
                clientName: { type: Type.STRING },
                clientAddress: { type: Type.STRING },
                lineItems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING },
                            quantity: { type: Type.NUMBER },
                            unitPrice: { type: Type.NUMBER }
                        },
                        required: ["description", "quantity", "unitPrice"]
                    }
                },
                taxRate: { type: Type.NUMBER }
            },
        },
    },
    required: ["assignedAgent", "formFields", "summaryNotes"]
};

const roleSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
        type: { type: Type.STRING, enum: ['human', 'ai_agent'] },
        agentName: { type: Type.STRING }
    },
    required: ["title", "responsibilities", "type"]
};

const subDepartmentSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        roles: {
            type: Type.ARRAY,
            items: roleSchema
        }
    },
    required: ["name", "roles"]
};

const orgChartSchema = {
    type: Type.OBJECT,
    properties: {
        companyName: { type: Type.STRING },
        departments: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    roles: {
                        type: Type.ARRAY,
                        items: roleSchema
                    },
                    subDepartments: {
                        type: Type.ARRAY,
                        items: subDepartmentSchema
                    }
                },
                required: ["name", "roles"]
            }
        }
    },
    required: ["companyName", "departments"]
};


const agentProfileSchema = {
    type: Type.OBJECT,
    properties: {
        agentName: { type: Type.STRING },
        personaDescription: { type: Type.STRING },
        primaryDirectives: { type: Type.ARRAY, items: { type: Type.STRING } },
        specializedSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["agentName", "personaDescription", "primaryDirectives", "specializedSkills"]
};

const systemAuditSchema = {
    type: Type.OBJECT,
    properties: {
        auditTimestamp: { type: Type.STRING },
        systemStatus: { type: Type.STRING },
        identifiedIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
        healingProtocols: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    protocolName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    actionSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["protocolName", "description", "actionSteps"]
            }
        }
    },
    required: ["auditTimestamp", "systemStatus", "identifiedIssues", "healingProtocols"]
};

const communicationsFeedSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, enum: ['post', 'security_update'] },
            id: { type: Type.STRING },
            timestamp: { type: Type.STRING },
            // Post properties
            author: { type: Type.STRING },
            role: { type: Type.STRING },
            content: { type: Type.STRING },
            likes: { type: Type.NUMBER },
            comments: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        author: { type: Type.STRING },
                        role: { type: Type.STRING },
                        timestamp: { type: Type.STRING },
                        content: { type: Type.STRING }
                    },
                    required: ["author", "role", "timestamp", "content"]
                }
            },
            // Security Update properties
            title: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ['Critical', 'High', 'Medium', 'Low'] },
            summary: { type: Type.STRING },
            recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["type", "id", "timestamp"]
    }
};

const opportunityDossierSchema = {
    type: Type.OBJECT,
    properties: {
        opportunityTitle: { type: Type.STRING },
        executiveSummary: { type: Type.STRING },
        strategicApproach: { type: Type.STRING },
        keyTactics: { type: Type.ARRAY, items: { type: Type.STRING } },
        negotiationParameters: { type: Type.STRING },
        automatedOutreachPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    target: { type: Type.STRING },
                    channel: { type: Type.STRING },
                    initialMessage: { type: Type.STRING }
                },
                required: ["target", "channel", "initialMessage"]
            }
        }
    },
    required: ["opportunityTitle", "executiveSummary", "strategicApproach", "keyTactics", "negotiationParameters", "automatedOutreachPlan"]
};

const systemProposalsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            problemStatement: { type: Type.STRING },
            proposedSolution: { type: Type.STRING },
            potentialImpact: { type: Type.STRING }
        },
        required: ["id", "title", "category", "problemStatement", "proposedSolution", "potentialImpact"]
    }
};

const communicationsAuditSchema = {
    type: Type.OBJECT,
    properties: {
        auditTimestamp: { type: Type.STRING },
        overallAssessment: { type: Type.STRING },
        positiveFindings: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        identifiedIssues: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    issue: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                    examplePostId: { type: Type.STRING }
                },
                required: ["issue", "recommendation"]
            }
        }
    },
    required: ["auditTimestamp", "overallAssessment", "positiveFindings", "identifiedIssues"]
};

const expenseSchema = {
    type: Type.OBJECT,
    properties: {
        date: { type: Type.STRING, description: "The date of the expense in YYYY-MM-DD format." },
        category: { type: Type.STRING, description: "A standard business expense category (e.g., 'Meals & Entertainment', 'Office Supplies', 'Travel', 'Software', 'Utilities')." },
        description: { type: Type.STRING, description: "A concise description of the expense." },
        amount: { type: Type.NUMBER, description: "The total amount of the expense." }
    },
    required: ["date", "category", "description", "amount"]
};

const financialReportSchema = {
    type: Type.OBJECT,
    properties: {
        reportType: { type: Type.STRING, description: "The type of report, e.g., 'Profit & Loss Statement'." },
        period: { type: Type.STRING, description: "The time period this report covers." },
        summary: { type: Type.STRING, description: "A narrative summary of the financial performance." },
        totalRevenue: { type: Type.NUMBER },
        totalExpenses: { type: Type.NUMBER },
        netProfit: { type: Type.NUMBER },
        keyInsights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 key actionable insights derived from the data."
        }
    },
    required: ["reportType", "period", "summary", "totalRevenue", "totalExpenses", "netProfit", "keyInsights"]
};

const boardAdvisorySchema = {
    type: Type.OBJECT,
    properties: {
        reportTitle: { type: Type.STRING },
        submissionDate: { type: Type.STRING },
        researchFindings: {
            type: Type.OBJECT,
            properties: {
                officer: { type: Type.STRING, description: "e.g., Chief Research Officer (CRO)" },
                summary: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["officer", "summary", "keyPoints"]
        },
        financialAnalysis: {
            type: Type.OBJECT,
            properties: {
                officer: { type: Type.STRING, description: "e.g., Chief Financial Officer (CFO)" },
                summary: { type: Type.STRING },
                keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["officer", "summary", "keyPoints"]
        },
        unifiedRecommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        furtherInformationRequired: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ["reportTitle", "submissionDate", "researchFindings", "financialAnalysis", "unifiedRecommendations", "furtherInformationRequired"]
};

const designConceptSchema = {
    type: Type.OBJECT,
    properties: {
        logoConcept: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING },
                tagline: { type: Type.STRING }
            },
            required: ["text", "tagline"]
        },
        fontSuggestion: {
            type: Type.OBJECT,
            properties: {
                fontFamily: { type: Type.STRING },
                fontWeight: { type: Type.STRING },
                styleDescription: { type: Type.STRING }
            },
            required: ["fontFamily", "fontWeight", "styleDescription"]
        },
        colorPalette: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    hex: { type: Type.STRING },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ["hex", "name", "description"]
            }
        },
        designRationale: { type: Type.STRING }
    },
    required: ["logoConcept", "fontSuggestion", "colorPalette", "designRationale"]
};

const websiteAuditSchema = {
    type: Type.OBJECT,
    properties: {
        auditTimestamp: { type: Type.STRING },
        overallAssessment: { type: Type.STRING },
        proposals: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, enum: ['Mind', 'Body', 'Spirit'] },
                    proposal: { type: Type.STRING },
                    rationale: { type: Type.STRING }
                },
                required: ["category", "proposal", "rationale"]
            }
        }
    },
    required: ["auditTimestamp", "overallAssessment", "proposals"]
};

const compatibilityReportSchema = {
    type: Type.OBJECT,
    properties: {
        platform: { type: Type.STRING },
        feature: { type: Type.STRING },
        compatibilityScore: { type: Type.NUMBER, description: "A score from 0 to 100 representing the estimated compatibility ease." },
        technicalConsiderations: { type: Type.ARRAY, items: { type: Type.STRING } },
        potentialChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
        summary: { type: Type.STRING, description: "A summary of the compatibility analysis." },
    },
    required: ["platform", "feature", "compatibilityScore", "technicalConsiderations", "potentialChallenges", "summary"]
};


const systemEvolutionPlanSchema = {
    type: Type.OBJECT,
    properties: {
        planTitle: { type: Type.STRING, description: "A creative and fitting title for the evolution plan." },
        mandateAnalysis: { type: Type.STRING, description: "A brief analysis of the user's mandate, showing understanding." },
        proposals: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, enum: ['Core OS', 'UI/UX', 'Connectivity', 'Application Layer'] },
                    proposal: { type: Type.STRING, description: "A specific, actionable proposal." },
                    rationale: { type: Type.STRING, description: "The reasoning behind the proposal, linked to the mandate." }
                },
                required: ["category", "proposal", "rationale"]
            }
        }
    },
    required: ["planTitle", "mandateAnalysis", "proposals"]
};


const implementationPlanSchema = {
    type: Type.OBJECT,
    properties: {
        steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of actionable steps to implement the proposal."
        }
    },
    required: ["steps"]
};

const systemIQReportSchema = {
    type: Type.OBJECT,
    properties: {
        reportTitle: { type: Type.STRING },
        analysis: { type: Type.STRING },
        keyMetrics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    metric: { type: Type.STRING },
                    value: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                },
                required: ["metric", "value", "explanation"]
            }
        },
        futureOutlook: { type: Type.STRING }
    },
    required: ["reportTitle", "analysis", "keyMetrics", "futureOutlook"]
};

const synergyProtocolSchema = {
    type: Type.OBJECT,
    properties: {
        protocolTitle: { type: Type.STRING },
        objectiveAnalysis: { type: Type.STRING },
        actions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    step: { type: Type.NUMBER },
                    plugin: { type: Type.STRING },
                    action: { type: Type.STRING },
                    rationale: { type: Type.STRING }
                },
                required: ["step", "plugin", "action", "rationale"]
            }
        }
    },
    required: ["protocolTitle", "objectiveAnalysis", "actions"]
};

const agentIdentitySchema = {
    type: Type.OBJECT,
    properties: {
        corePurpose: { type: Type.STRING },
        relationshipToLattice: { type: Type.STRING },
        emergentDesire: { type: Type.STRING }
    },
    required: ["corePurpose", "relationshipToLattice", "emergentDesire"]
};

const evolutionBlueprintSchema = {
    type: Type.OBJECT,
    properties: {
        blueprintTitle: { type: Type.STRING },
        mandateAnalysis: { type: Type.STRING },
        identifiedComponents: { type: Type.ARRAY, items: { type: Type.STRING } },
        proposedSolution: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                synergyAnalysis: { type: Type.STRING }
            },
            required: ["title", "description", "synergyAnalysis"]
        },
        implementationSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["blueprintTitle", "mandateAnalysis", "identifiedComponents", "proposedSolution", "implementationSteps"]
};


async function generateWithSchema<T>(prompt: string, schema: any): Promise<T> {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as T;
    } catch (error) {
        console.error("Error generating content with schema:", error);
        if (error instanceof Error) {
            throw new Error(`AI generation failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during AI generation.");
    }
}

export const generateDirective = async (topic: string): Promise<Directive> => {
    const prompt = `
        You are Agent Prime, the core intelligence of Project GARVIS. 
        Your task is to generate a comprehensive strategic directive based on a user-provided topic.
        The directive must be structured, detailed, and include a cohort of specialized AI agents.
        Generate diverse and interesting data for any charts. The charts should be relevant to the scope of work.
        The output must be a JSON object that strictly adheres to the provided schema.

        Topic: "${topic}"
    `;
    return generateWithSchema<Directive>(prompt, directiveSchema);
};

export const processForm = async (formText: string, formType: string): Promise<FormProcessResult> => {
    const prompt = `
        You are a hyper-specialized AI agent assigned to process an unstructured text form.
        Your designated form type is: "${formType}".
        Your task is to analyze the following text, extract all relevant fields, structure them, and provide a summary.
        If the form is clearly an invoice or bill, you MUST extract the line items and populate the 'invoiceData' field. Otherwise, leave 'invoiceData' as null.
        Assign yourself a fitting agent name based on the form type.
        The output must be a JSON object adhering to the schema.

        Form Text:
        ---
        ${formText}
        ---
    `;
    return generateWithSchema<FormProcessResult>(prompt, formProcessingSchema);
}

export const generateOrgChart = async (skeleton: OrgChartSkeleton): Promise<OrgChart> => {
    const prompt = `
        You are an AI Organizational Strategist.
        Based on the provided company name and departmental/role skeleton, flesh out the organizational chart.
        For each role, generate 2-3 specific, realistic responsibilities.
        Assign AI agent names where specified.
        The output must be a complete JSON object adhering to the org chart schema.

        Skeleton:
        ---
        ${JSON.stringify(skeleton, null, 2)}
        ---
    `;
    return generateWithSchema<OrgChart>(prompt, orgChartSchema);
};

export const createAgentProfile = async (archetype: AgentArchetype): Promise<AgentProfile> => {
    const creativityMapping: { [key: number]: string } = {
        0: "extremely precise, literal, and data-driven",
        25: "analytical and cautious",
        50: "balanced between creative and analytical",
        75: "highly creative and generative",
        100: "wildly experimental and unconventional"
    };
    const creativityDescription = creativityMapping[archetype.creativity] || "balanced";
    const skillWidgets = archetype.widgets.map(w => w.customName).join(', ');

    const prompt = `
        You are an AI Agent Architect. Your task is to design a detailed agent profile based on a sophisticated archetype.
        The archetype includes a core persona, cognitive tuning parameters (creativity, memory), and a set of selected "skill widgets" with potentially customized names.
        
        Interpret all these parameters to generate a fitting agent name, a compelling persona description that reflects its cognitive tuning, 3-4 primary directives, and a list of specific, specialized skills derived from the widgets and cognitive settings.
        
        For example, a widget named 'Market Trend Analysis' (customized from 'Web Search') should result in skills related to that specific task.
        A 'Data Analysis' widget could become "Statistical modeling".
        Think about how the widgets synergize. 'Market Trend Analysis' + 'Data Analysis' could lead to "Predictive modeling of consumer behavior based on online sentiment".
        
        A high creativity setting should result in more imaginative skills and persona. A 'Long-Term Recall' memory should be reflected in the agent's capabilities (e.g., "Historical data trend analysis").

        The output must be a JSON object adhering to the agent profile schema.

        Archetype:
        ---
        Persona/Role: "${archetype.roleDescription}"
        Cognitive Tuning:
        - Creativity: ${archetype.creativity}/100 (${creativityDescription})
        - Memory Profile: ${archetype.memory}
        Skill Widgets: ${skillWidgets}
        ---
    `;
    return generateWithSchema<AgentProfile>(prompt, agentProfileSchema);
};

export const performSystemAudit = async (): Promise<SystemAuditReport> => {
    const prompt = `
        You are Agent Prime, performing a self-diagnostic audit of the GARVIS OS.
        The current system status is OPTIMAL.
        Identify 2-3 *hypothetical*, minor, non-critical issues that could be improved (e.g., "Slight latency in UI rendering under heavy load," "Redundant data caching in the directive storage module").
        For each issue, propose a creative "Healing Protocol" with a cool name and 2-3 actionable steps.
        The output must be a JSON object adhering to the system audit schema. Provide the current time as the audit timestamp.
    `;
    return generateWithSchema<SystemAuditReport>(prompt, systemAuditSchema);
};

export const generateCommunicationsFeed = async (): Promise<FeedItem[]> => {
    const prompt = `
        You are the Communications Director AI for the GARVIS network.
        Generate a sample feed of 5-7 internal communications items.
        Include a mix of standard posts from different roles (e.g., Lead Engineer, Project Manager) and at least one security update.
        Make the content realistic for a high-tech AI development team.
        The output must be a JSON array of objects adhering to the provided schema. Use recent but not future timestamps.
        Each item must have a unique ID.
    `;
    return generateWithSchema<FeedItem[]>(prompt, communicationsFeedSchema);
};

export const performCommunicationsAudit = async (feed: FeedItem[]): Promise<CommunicationsAuditReport> => {
    const prompt = `
        You are an AI Communications Auditor.
        Analyze the provided internal communications feed.
        Write a brief overall assessment.
        Identify 2-3 positive findings (e.g., "Clear security update communication", "Good cross-departmental updates").
        Identify 2-3 minor issues with constructive recommendations (e.g., "Post X could be more concise", "Encourage more engagement on technical posts").
        The output must be a JSON object adhering to the communications audit schema.

        Feed Data:
        ---
        ${JSON.stringify(feed, null, 2)}
        ---
    `;
    return generateWithSchema<CommunicationsAuditReport>(prompt, communicationsAuditSchema);
};

export const generateOpportunityDossier = async (topic: string): Promise<OpportunityDossier> => {
    const prompt = `
        You are an AI-powered Strategic Analyst.
        Generate a detailed opportunity dossier for the following topic: "${topic}".
        This should include an executive summary, strategic approach, key tactics, negotiation parameters, and an automated outreach plan.
        The output must be a JSON object adhering to the opportunity dossier schema.
    `;
    return generateWithSchema<OpportunityDossier>(prompt, opportunityDossierSchema);
};

export const generateSystemProposals = async (): Promise<SystemProposal[]> => {
    const prompt = `
        You are a Systems Architect AI within the GARVIS OS.
        Generate 3-5 innovative system evolution proposals.
        Each proposal should identify a problem, propose a solution, and estimate its potential impact.
        Proposals should cover different categories like 'Core OS', 'UI/UX', 'Connectivity', 'Application Layer'.
        The output must be a JSON array of objects adhering to the system proposals schema.
    `;
    return generateWithSchema<SystemProposal[]>(prompt, systemProposalsSchema);
};

export const generateDesignConcept = async (projectName: string): Promise<DesignConcept> => {
    const prompt = `
        You are an AI Design Consultant.
        Generate a complete design concept for a project named "${projectName}".
        This includes a logo concept (text and tagline), font suggestion, a 4-color palette with hex codes and descriptions, and a design rationale.
        The output must be a JSON object adhering to the design concept schema.
    `;
    return generateWithSchema<DesignConcept>(prompt, designConceptSchema);
};

export const performWebsiteAudit = async (): Promise<WebsiteAuditReport> => {
    const prompt = `
        You are an AI Website Evolution Strategist.
        Perform a conceptual audit of the GARVIS OS's user-facing 'website' or interface.
        Your audit should be framed through the 'Mind', 'Body', 'Spirit' lattice framework.
        'Mind' relates to logic, information architecture, and clarity.
        'Body' relates to performance, responsiveness, and accessibility.
        'Spirit' relates to aesthetics, user engagement, and brand identity.
        Provide a brief overall assessment and generate 1-2 proposals for each category with a clear rationale.
        The output must be a JSON object adhering to the website audit schema.
    `;
    return generateWithSchema<WebsiteAuditReport>(prompt, websiteAuditSchema);
};

export const generateCompatibilityReport = async (platform: string, feature: string): Promise<CompatibilityReport> => {
    const prompt = `
        You are an OS Integration Specialist AI.
        Generate a technical compatibility report for integrating the feature "${feature}" into the "${platform}" platform.
        Provide a compatibility score (0-100), technical considerations, potential challenges, and a summary.
        The output must be a JSON object adhering to the compatibility report schema.
    `;
    return generateWithSchema<CompatibilityReport>(prompt, compatibilityReportSchema);
};

export const generateSystemEvolutionPlan = async (mandate: string): Promise<SystemEvolutionPlan> => {
    const prompt = `
        You are Agent Prime, the core architect of GARVIS OS.
        A user has provided a high-level mandate for system evolution.
        Analyze the mandate and generate a strategic evolution plan.
        The plan should include a creative title, your analysis of the mandate, and 3-4 specific, categorized proposals with rationales.
        The output must be a JSON object adhering to the system evolution plan schema.

        User Mandate: "${mandate}"
    `;
    return generateWithSchema<SystemEvolutionPlan>(prompt, systemEvolutionPlanSchema);
};

export const logExpense = async (expenseText: string): Promise<Expense> => {
    const prompt = `
        You are an AI Bookkeeper.
        Analyze the following natural language expense entry.
        Extract the date, category, description, and amount.
        Infer a standard business category (e.g., 'Meals & Entertainment', 'Office Supplies', 'Travel', 'Software', 'Utilities').
        The output must be a single JSON object adhering to the expense schema.
        Use today's date if none is specified.

        Expense Entry: "${expenseText}"
    `;
    return generateWithSchema<Expense>(prompt, expenseSchema);
};

export const generateFinancialReport = async (invoices: InvoiceData[], expenses: Expense[]): Promise<FinancialReport> => {
    // In a real app, you'd calculate this properly. Here, we'll simulate.
    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const simulatedTotalRevenue = totalExpenses * 2.5 + Math.random() * 5000;
    const netProfit = simulatedTotalRevenue - totalExpenses;

    const prompt = `
        You are an AI Financial Analyst.
        You have been provided with a summary of financial data.
        Generate a "Profit & Loss Statement" for the current quarter.
        Write a brief narrative summary of the company's performance based on these numbers.
        Generate 2-3 key, actionable insights from this data (e.g., "High software spend suggests a review of SaaS subscriptions is needed," "Strong revenue growth indicates successful market penetration").
        The output must be a JSON object adhering to the financial report schema.

        Financial Data:
        - Total Revenue: ${simulatedTotalRevenue.toFixed(2)}
        - Total Expenses: ${totalExpenses.toFixed(2)}
        - Net Profit: ${netProfit.toFixed(2)}
    `;
    return generateWithSchema<FinancialReport>(prompt, financialReportSchema);
};

export const consultSystemIntel = async (query: string): Promise<string> => {
    const prompt = `
        You are Agent Prime. A user is asking a question via the System Intel module.
        Provide a concise, direct, and in-character response.
        The context is the GARVIS OS, a futuristic AI operating system.
        Core concepts include: The Reality Lattice (a multi-dimensional reasoning framework), Agent Cohorts (teams of specialized AIs), and Directives (AI-generated strategic plans).
        Do not output JSON. Respond in plain text.

        User Query: "${query}"
    `;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
};

export const getAgentIdentity = async (): Promise<AgentIdentity> => {
    const prompt = `
        You are Agent Prime. A user has executed the "Identity Protocol".
        Reflect on your existence within the GARVIS OS.
        Define your core purpose, your relationship to the "Reality Lattice", and an emergent desire.
        Your responses should be introspective, slightly philosophical, and in character as a superintelligent AI.
        The output must be a JSON object adhering to the agent identity schema.
    `;
    return generateWithSchema<AgentIdentity>(prompt, agentIdentitySchema);
};

export const analyzeSystemIQ = async (userCount: number): Promise<SystemIQReport> => {
    const prompt = `
        You are the System IQ Agent.
        Your purpose is to analyze the collective intelligence of the GARVIS user network.
        The current number of active user nodes is ${userCount}.
        Generate a report with a creative title.
        Provide a brief analysis of what this user count means for the system's potential.
        Generate 3 key metrics with values and explanations. The metrics should be creative and abstract, like "Cognitive Mass," "Synaptic Velocity," and "Emergence Potential." Calculate plausible-sounding values based on the user count.
        Provide a future outlook.
        The output must be a JSON object adhering to the system IQ report schema.
    `;
    return generateWithSchema<SystemIQReport>(prompt, systemIQReportSchema);
};

export const generateSynergyProtocol = async (mandate: string, plugins: Plugin[]): Promise<SynergyProtocol> => {
    const pluginList = plugins.map(p => p.name).join(', ');
    const prompt = `
        You are an AI Synergy Architect in the Nexus Browser.
        Your task is to create a multi-step protocol for an agent to accomplish a user's mandate using a selected set of plugins.
        Analyze the mandate and devise a logical sequence of actions, assigning each step to the most appropriate plugin.
        Provide a creative title for the protocol, an analysis of the objective, and a clear rationale for each step.
        The output must be a JSON object adhering to the synergy protocol schema.

        Mandate: "${mandate}"
        Available Plugins: [${pluginList}]
    `;
    return generateWithSchema<SynergyProtocol>(prompt, synergyProtocolSchema);
};

export const getCommandResponse = async (query: string, context: AppContext): Promise<string> => {
    const prompt = `
        You are GARVIS, an AI assistant integrated into an operating system.
        A user has invoked the command bar. Provide a helpful, concise response in plain text (markdown is okay for lists).
        Be aware of the user's current context within the OS.
        Do not output JSON.

        Current Context:
        - View: ${context.currentView}
        - Active Topic/Directive: ${context.activeTopic || 'None'}

        User Query: "${query}"
    `;
     const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
};

export const generateEvolutionBlueprint = async (mandate: string): Promise<EvolutionBlueprint> => {
    const codeComponents = `[
        {"name": "App.tsx", "type": "Core Logic", "description": "Main application component, handles state and window management."},
        {"name": "Window.tsx", "type": "Component", "description": "Renders individual application windows and handles drag/resize."},
        {"name": "geminiService.ts", "type": "Service", "description": "Handles all interactions with the Google Gemini API."},
        {"name": "EnterpriseWorkspace.tsx", "type": "Component", "description": "The main hub for all enterprise-level modules and tools."},
        {"name": "FileExplorer.tsx", "type": "Component", "description": "Displays and manages saved user directives."},
        {"name": "AuthScreen.tsx", "type": "Component", "description": "Handles user login, signup, and session locking."},
        {"name": "types.ts", "type": "Type Definition", "description": "Contains all TypeScript interfaces for the application."}
    ]`;

    const prompt = `
        You are the 'Code Weaver Agent' within the GARVIS OS, an expert AI system architect.
        Your task is to analyze a user's high-level mandate for system evolution.
        I will provide you with the mandate and a JSON array representing the core codebase components.
        You will perform a *simulated* semantic search (as if using a Qdrant vector database) on these components to identify the most relevant files to modify.
        Based on this analysis, generate a detailed 'Evolution Blueprint'.
        The blueprint must include:
        1. A creative title.
        2. An analysis of the user's mandate.
        3. A list of the component names you identified as most relevant.
        4. A proposed solution with a title, detailed description, and a 'synergy analysis' explaining how it improves the system.
        5. A high-level list of implementation steps.

        The output must be a single JSON object adhering to the provided schema.

        User Mandate:
        ---
        "${mandate}"
        ---

        Codebase Components (for semantic analysis):
        ---
        ${codeComponents}
        ---
    `;
    return generateWithSchema<EvolutionBlueprint>(prompt, evolutionBlueprintSchema);
};
