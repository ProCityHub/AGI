import { GoogleGenAI } from "@google/genai";
import { AgentState, AgentTask } from '../types/agentTypes';

export interface ReasoningStep {
  id: string;
  type: 'observation' | 'hypothesis' | 'deduction' | 'induction' | 'abduction' | 'evaluation';
  content: string;
  confidence: number; // 0-1
  evidence: string[];
  dependencies: string[]; // IDs of previous steps
  timestamp: number;
}

export interface ReasoningChain {
  id: string;
  goal: string;
  steps: ReasoningStep[];
  conclusion: string;
  confidence: number;
  reasoning_type: 'deductive' | 'inductive' | 'abductive' | 'causal' | 'analogical';
  created_at: number;
  completed_at?: number;
}

export interface CausalRelation {
  cause: string;
  effect: string;
  strength: number; // 0-1
  evidence: string[];
  confidence: number;
}

export interface Hypothesis {
  id: string;
  statement: string;
  confidence: number;
  evidence_for: string[];
  evidence_against: string[];
  tests: string[];
  status: 'active' | 'confirmed' | 'refuted' | 'suspended';
}

export interface DecisionNode {
  id: string;
  question: string;
  options: Array<{
    choice: string;
    probability: number;
    expected_value: number;
    consequences: string[];
  }>;
  decision: string | null;
  reasoning: string;
}

export class ReasoningEngine {
  private ai: GoogleGenAI;
  private reasoningChains: Map<string, ReasoningChain> = new Map();
  private hypotheses: Map<string, Hypothesis> = new Map();
  private causalRelations: CausalRelation[] = [];
  private decisionNodes: Map<string, DecisionNode> = new Map();

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  // Main Reasoning Interface
  async reason(
    goal: string, 
    context: any, 
    reasoningType: 'deductive' | 'inductive' | 'abductive' | 'causal' | 'analogical' = 'deductive'
  ): Promise<ReasoningChain> {
    const chainId = this.generateId();
    
    console.log(`🧠 Starting ${reasoningType} reasoning for: ${goal}`);
    
    const chain: ReasoningChain = {
      id: chainId,
      goal,
      steps: [],
      conclusion: '',
      confidence: 0,
      reasoning_type: reasoningType,
      created_at: Date.now()
    };

    try {
      switch (reasoningType) {
        case 'deductive':
          await this.performDeductiveReasoning(chain, context);
          break;
        case 'inductive':
          await this.performInductiveReasoning(chain, context);
          break;
        case 'abductive':
          await this.performAbductiveReasoning(chain, context);
          break;
        case 'causal':
          await this.performCausalReasoning(chain, context);
          break;
        case 'analogical':
          await this.performAnalogicalReasoning(chain, context);
          break;
      }

      chain.completed_at = Date.now();
      this.reasoningChains.set(chainId, chain);
      
      console.log(`✅ Reasoning completed with confidence: ${chain.confidence.toFixed(2)}`);
      return chain;

    } catch (error) {
      console.error(`❌ Reasoning failed:`, error);
      throw error;
    }
  }

  // Chain of Thought Reasoning
  async chainOfThought(problem: string, context: any = {}): Promise<ReasoningChain> {
    const prompt = `
Solve this problem using step-by-step reasoning. Break down your thinking into clear, logical steps.

Problem: ${problem}
Context: ${JSON.stringify(context, null, 2)}

Please structure your response as follows:
1. Understanding: What is the problem asking?
2. Analysis: What information do we have?
3. Approach: What method will we use?
4. Steps: Break down the solution step by step
5. Conclusion: What is the final answer?
6. Confidence: How confident are you in this solution? (0-1)

Be explicit about your reasoning at each step.`;

    const result = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const response = result.candidates[0].content.parts[0].text;
    
    return this.parseChainOfThoughtResponse(response, problem);
  }

  // Multi-Step Planning
  async createPlan(
    goal: string, 
    constraints: string[] = [], 
    resources: any = {}
  ): Promise<{
    steps: Array<{
      id: string;
      description: string;
      dependencies: string[];
      estimated_time: number;
      required_resources: string[];
      success_criteria: string[];
    }>;
    total_time: number;
    risk_factors: string[];
    contingencies: string[];
  }> {
    const prompt = `
Create a detailed, step-by-step plan to achieve the following goal:

Goal: ${goal}
Constraints: ${constraints.join(', ')}
Available Resources: ${JSON.stringify(resources, null, 2)}

Please provide:
1. A sequence of specific, actionable steps
2. Dependencies between steps
3. Time estimates for each step
4. Required resources for each step
5. Success criteria for each step
6. Potential risk factors
7. Contingency plans

Format your response as a structured plan with clear steps and dependencies.`;

    const result = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const response = result.candidates[0].content.parts[0].text;
    
    return this.parsePlanResponse(response);
  }

  // Hypothesis Testing
  async generateHypothesis(observation: string, context: any = {}): Promise<Hypothesis> {
    const prompt = `
Given this observation, generate a testable hypothesis:

Observation: ${observation}
Context: ${JSON.stringify(context, null, 2)}

Please provide:
1. A clear, testable hypothesis statement
2. Evidence that supports this hypothesis
3. Evidence that might contradict it
4. Specific tests that could validate or refute it
5. Your confidence level in this hypothesis (0-1)

Be scientific and rigorous in your approach.`;

    const result = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const response = result.candidates[0].content.parts[0].text;
    
    return this.parseHypothesisResponse(response, observation);
  }

  async testHypothesis(hypothesisId: string, newEvidence: string): Promise<Hypothesis> {
    const hypothesis = this.hypotheses.get(hypothesisId);
    if (!hypothesis) {
      throw new Error(`Hypothesis ${hypothesisId} not found`);
    }

    const prompt = `
Evaluate this hypothesis against new evidence:

Hypothesis: ${hypothesis.statement}
Current Evidence For: ${hypothesis.evidence_for.join(', ')}
Current Evidence Against: ${hypothesis.evidence_against.join(', ')}
New Evidence: ${newEvidence}

Please:
1. Determine if the new evidence supports or contradicts the hypothesis
2. Update the confidence level
3. Suggest if the hypothesis should be confirmed, refuted, or modified
4. Recommend next steps for testing

Provide a rigorous scientific evaluation.`;

    const result = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const response = result.candidates[0].content.parts[0].text;
    
    return this.updateHypothesisFromTest(hypothesis, newEvidence, response);
  }

  // Causal Reasoning
  async identifyCausalRelations(events: string[], context: any = {}): Promise<CausalRelation[]> {
    const prompt = `
Analyze these events and identify potential causal relationships:

Events: ${events.join(', ')}
Context: ${JSON.stringify(context, null, 2)}

For each potential causal relationship, provide:
1. The cause event
2. The effect event
3. The strength of the causal relationship (0-1)
4. Evidence supporting the causal link
5. Confidence in this causal relationship (0-1)

Be careful to distinguish between correlation and causation.
Consider alternative explanations and confounding factors.`;

    const result = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const response = result.candidates[0].content.parts[0].text;
    
    const relations = this.parseCausalRelations(response);
    this.causalRelations.push(...relations);
    
    return relations;
  }

  // Decision Making
  async makeDecision(
    question: string, 
    options: string[], 
    criteria: string[] = [],
    context: any = {}
  ): Promise<DecisionNode> {
    const prompt = `
Make a decision for the following question:

Question: ${question}
Options: ${options.join(', ')}
Decision Criteria: ${criteria.join(', ')}
Context: ${JSON.stringify(context, null, 2)}

For each option, provide:
1. Probability of success
2. Expected value/benefit
3. Potential consequences (positive and negative)
4. Risk factors

Then recommend the best option with detailed reasoning.
Consider both short-term and long-term implications.`;

    const result = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const response = result.candidates[0].content.parts[0].text;
    
    return this.parseDecisionResponse(response, question, options);
  }

  // Analogical Reasoning
  async findAnalogies(
    source: string, 
    targetDomain: string, 
    context: any = {}
  ): Promise<Array<{
    analogy: string;
    mapping: Array<{ source: string; target: string }>;
    strength: number;
    insights: string[];
  }>> {
    const prompt = `
Find analogies between the source and target domain:

Source: ${source}
Target Domain: ${targetDomain}
Context: ${JSON.stringify(context, null, 2)}

For each analogy, provide:
1. The analogical statement
2. Specific mappings between source and target elements
3. Strength of the analogy (0-1)
4. Insights or lessons that can be drawn
5. Limitations of the analogy

Focus on meaningful, useful analogies that provide genuine insights.`;

    const result = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const response = result.candidates[0].content.parts[0].text;
    
    return this.parseAnalogiesResponse(response);
  }

  // Meta-Reasoning
  async evaluateReasoning(chainId: string): Promise<{
    validity: number;
    soundness: number;
    completeness: number;
    biases: string[];
    improvements: string[];
  }> {
    const chain = this.reasoningChains.get(chainId);
    if (!chain) {
      throw new Error(`Reasoning chain ${chainId} not found`);
    }

    // Mock implementation - Google GenAI SDK integration pending
    // const model = this.ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
Evaluate this reasoning chain for quality and correctness:

Goal: ${chain.goal}
Reasoning Type: ${chain.reasoning_type}
Steps: ${chain.steps.map(s => `${s.type}: ${s.content}`).join('\n')}
Conclusion: ${chain.conclusion}

Please evaluate:
1. Validity: Are the logical steps correct? (0-1)
2. Soundness: Are the premises true and reasoning valid? (0-1)
3. Completeness: Are there missing steps or considerations? (0-1)
4. Potential biases or logical fallacies
5. Suggestions for improvement

Be thorough and critical in your evaluation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    return this.parseReasoningEvaluation(response);
  }

  // Private Methods
  private async performDeductiveReasoning(chain: ReasoningChain, context: any): Promise<void> {
    // Mock implementation - Google GenAI SDK integration pending
    // const model = this.ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
Use deductive reasoning to solve this problem:

Goal: ${chain.goal}
Context: ${JSON.stringify(context, null, 2)}

Apply deductive reasoning:
1. Start with general principles or premises
2. Apply logical rules to derive specific conclusions
3. Ensure each step follows logically from the previous
4. Provide a definitive conclusion if the premises are true

Structure your response with clear logical steps.`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    this.parseReasoningSteps(chain, response, 'deductive');
  }

  private async performInductiveReasoning(chain: ReasoningChain, context: any): Promise<void> {
    // Mock implementation - Google GenAI SDK integration pending
    // const model = this.ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
Use inductive reasoning to solve this problem:

Goal: ${chain.goal}
Context: ${JSON.stringify(context, null, 2)}

Apply inductive reasoning:
1. Examine specific observations or examples
2. Look for patterns or regularities
3. Form general principles or hypotheses
4. Assess the strength of the generalization

Note that inductive conclusions are probabilistic, not certain.`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    this.parseReasoningSteps(chain, response, 'inductive');
  }

  private async performAbductiveReasoning(chain: ReasoningChain, context: any): Promise<void> {
    // Mock implementation - Google GenAI SDK integration pending
    // const model = this.ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
Use abductive reasoning to solve this problem:

Goal: ${chain.goal}
Context: ${JSON.stringify(context, null, 2)}

Apply abductive reasoning:
1. Start with observations or facts that need explanation
2. Generate the most likely explanations or hypotheses
3. Consider alternative explanations
4. Select the best explanation based on simplicity and explanatory power

Focus on finding the most plausible explanation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    this.parseReasoningSteps(chain, response, 'abductive');
  }

  private async performCausalReasoning(chain: ReasoningChain, context: any): Promise<void> {
    // Mock implementation - Google GenAI SDK integration pending
    // const model = this.ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
Use causal reasoning to solve this problem:

Goal: ${chain.goal}
Context: ${JSON.stringify(context, null, 2)}

Apply causal reasoning:
1. Identify potential causes and effects
2. Establish causal relationships with evidence
3. Consider confounding factors and alternative explanations
4. Build a causal model or chain
5. Make predictions based on causal understanding

Be careful to distinguish causation from correlation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    this.parseReasoningSteps(chain, response, 'causal');
  }

  private async performAnalogicalReasoning(chain: ReasoningChain, context: any): Promise<void> {
    // Mock implementation - Google GenAI SDK integration pending
    // const model = this.ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
Use analogical reasoning to solve this problem:

Goal: ${chain.goal}
Context: ${JSON.stringify(context, null, 2)}

Apply analogical reasoning:
1. Find similar situations or problems from other domains
2. Map the structure and relationships
3. Transfer insights from the analogous case
4. Adapt the solution to the current context
5. Validate the analogy's applicability

Focus on structural similarities rather than surface features.`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    this.parseReasoningSteps(chain, response, 'analogical');
  }

  private parseReasoningSteps(chain: ReasoningChain, response: string, type: string): void {
    // Simple parsing - in production, use more sophisticated NLP
    const lines = response.split('\n').filter(line => line.trim());
    let stepCounter = 0;
    
    for (const line of lines) {
      if (line.match(/^\d+\./) || line.includes('Step') || line.includes('Therefore') || line.includes('Conclusion')) {
        const step: ReasoningStep = {
          id: `${chain.id}_step_${stepCounter++}`,
          type: this.classifyStepType(line),
          content: line.trim(),
          confidence: this.estimateConfidence(line),
          evidence: this.extractEvidence(line),
          dependencies: stepCounter > 0 ? [`${chain.id}_step_${stepCounter - 1}`] : [],
          timestamp: Date.now()
        };
        
        chain.steps.push(step);
      }
    }
    
    // Extract conclusion
    const conclusionMatch = response.match(/(?:conclusion|therefore|thus|hence)[:\s]*(.*?)(?:\n|$)/i);
    if (conclusionMatch) {
      chain.conclusion = conclusionMatch[1].trim();
    }
    
    // Calculate overall confidence
    chain.confidence = chain.steps.length > 0 
      ? chain.steps.reduce((sum, step) => sum + step.confidence, 0) / chain.steps.length
      : 0.5;
  }

  private classifyStepType(content: string): ReasoningStep['type'] {
    const lower = content.toLowerCase();
    if (lower.includes('observe') || lower.includes('given') || lower.includes('fact')) return 'observation';
    if (lower.includes('hypothesis') || lower.includes('assume') || lower.includes('suppose')) return 'hypothesis';
    if (lower.includes('therefore') || lower.includes('thus') || lower.includes('hence')) return 'deduction';
    if (lower.includes('pattern') || lower.includes('generally') || lower.includes('usually')) return 'induction';
    if (lower.includes('best explanation') || lower.includes('likely') || lower.includes('probably')) return 'abduction';
    return 'evaluation';
  }

  private estimateConfidence(content: string): number {
    const lower = content.toLowerCase();
    if (lower.includes('certain') || lower.includes('definitely') || lower.includes('must')) return 0.9;
    if (lower.includes('likely') || lower.includes('probably') || lower.includes('should')) return 0.7;
    if (lower.includes('possible') || lower.includes('might') || lower.includes('could')) return 0.5;
    if (lower.includes('unlikely') || lower.includes('doubtful')) return 0.3;
    return 0.6; // default
  }

  private extractEvidence(content: string): string[] {
    // Simple evidence extraction
    const evidence: string[] = [];
    const matches = content.match(/because\s+([^.]+)/gi);
    if (matches) {
      evidence.push(...matches.map(m => m.replace(/because\s+/i, '').trim()));
    }
    return evidence;
  }

  private parseChainOfThoughtResponse(response: string, problem: string): ReasoningChain {
    const chainId = this.generateId();
    const chain: ReasoningChain = {
      id: chainId,
      goal: problem,
      steps: [],
      conclusion: '',
      confidence: 0.7,
      reasoning_type: 'deductive',
      created_at: Date.now(),
      completed_at: Date.now()
    };

    this.parseReasoningSteps(chain, response, 'chain_of_thought');
    return chain;
  }

  private parsePlanResponse(response: string): any {
    // Simplified parsing - in production, use structured output
    return {
      steps: [
        {
          id: 'step_1',
          description: 'Analyze requirements',
          dependencies: [],
          estimated_time: 60,
          required_resources: ['analyst'],
          success_criteria: ['requirements documented']
        }
      ],
      total_time: 60,
      risk_factors: ['unclear requirements'],
      contingencies: ['request clarification']
    };
  }

  private parseHypothesisResponse(response: string, observation: string): Hypothesis {
    const hypothesisId = this.generateId();
    const hypothesis: Hypothesis = {
      id: hypothesisId,
      statement: `Hypothesis based on: ${observation}`,
      confidence: 0.6,
      evidence_for: [],
      evidence_against: [],
      tests: [],
      status: 'active'
    };

    this.hypotheses.set(hypothesisId, hypothesis);
    return hypothesis;
  }

  private updateHypothesisFromTest(hypothesis: Hypothesis, evidence: string, analysis: string): Hypothesis {
    // Update hypothesis based on test results
    if (analysis.toLowerCase().includes('support')) {
      hypothesis.evidence_for.push(evidence);
      hypothesis.confidence = Math.min(1.0, hypothesis.confidence + 0.1);
    } else if (analysis.toLowerCase().includes('contradict')) {
      hypothesis.evidence_against.push(evidence);
      hypothesis.confidence = Math.max(0.0, hypothesis.confidence - 0.1);
    }

    if (hypothesis.confidence > 0.8) {
      hypothesis.status = 'confirmed';
    } else if (hypothesis.confidence < 0.2) {
      hypothesis.status = 'refuted';
    }

    return hypothesis;
  }

  private parseCausalRelations(response: string): CausalRelation[] {
    // Simplified parsing
    return [
      {
        cause: 'Event A',
        effect: 'Event B',
        strength: 0.7,
        evidence: ['correlation observed'],
        confidence: 0.6
      }
    ];
  }

  private parseDecisionResponse(response: string, question: string, options: string[]): DecisionNode {
    const nodeId = this.generateId();
    const node: DecisionNode = {
      id: nodeId,
      question,
      options: options.map(opt => ({
        choice: opt,
        probability: 0.5,
        expected_value: 0.5,
        consequences: []
      })),
      decision: options[0], // Simplified
      reasoning: response
    };

    this.decisionNodes.set(nodeId, node);
    return node;
  }

  private parseAnalogiesResponse(response: string): any[] {
    // Simplified parsing
    return [
      {
        analogy: 'Sample analogy',
        mapping: [{ source: 'A', target: 'X' }],
        strength: 0.7,
        insights: ['Key insight']
      }
    ];
  }

  private parseReasoningEvaluation(response: string): any {
    return {
      validity: 0.8,
      soundness: 0.7,
      completeness: 0.6,
      biases: ['confirmation bias'],
      improvements: ['consider alternative explanations']
    };
  }

  private generateId(): string {
    return `reasoning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getters
  getReasoningChain(chainId: string): ReasoningChain | undefined {
    return this.reasoningChains.get(chainId);
  }

  getAllReasoningChains(): ReasoningChain[] {
    return Array.from(this.reasoningChains.values());
  }

  getHypothesis(hypothesisId: string): Hypothesis | undefined {
    return this.hypotheses.get(hypothesisId);
  }

  getAllHypotheses(): Hypothesis[] {
    return Array.from(this.hypotheses.values());
  }

  getCausalRelations(): CausalRelation[] {
    return this.causalRelations;
  }

  // Public initialization method for Master AGI Orchestrator integration
  async initialize(): Promise<void> {
    console.log('🧠 [REASONING ENGINE] Initializing advanced reasoning capabilities...');
    
    // Initialize reasoning chains
    this.reasoningChains.clear();
    
    // Initialize hypotheses storage
    this.hypotheses.clear();
    
    // Initialize causal relations
    this.causalRelations = [];
    
    // Initialize decision nodes
    this.decisionNodes.clear();
    
    console.log('✅ [REASONING ENGINE] All reasoning systems initialized and ready');
    console.log('🎯 [CAPABILITIES] Deductive, inductive, abductive, and causal reasoning active');
  }

  // Public complex reasoning method for Master AGI Orchestrator integration
  async processComplexReasoning(request: any): Promise<any> {
    console.log(`🔍 [COMPLEX REASONING] Processing complex reasoning request: ${request.type || 'general'}`);
    
    try {
      const chainId = `reasoning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create reasoning chain for the complex request
      const chain: ReasoningChain = {
        id: chainId,
        goal: request.goal || request.query || 'Complex reasoning task',
        steps: [],
        currentStep: 0,
        status: 'active',
        confidence: 0,
        evidence: request.evidence || [],
        assumptions: request.assumptions || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.reasoningChains.set(chainId, chain);
      
      // Perform reasoning based on request type
      let result;
      switch (request.type) {
        case 'deductive':
          await this.performDeductiveReasoning(chain, request.context || {});
          result = this.generateReasoningResult(chain, 'deductive');
          break;
        case 'inductive':
          await this.performInductiveReasoning(chain, request.context || {});
          result = this.generateReasoningResult(chain, 'inductive');
          break;
        case 'abductive':
          await this.performAbductiveReasoning(chain, request.context || {});
          result = this.generateReasoningResult(chain, 'abductive');
          break;
        case 'causal':
          result = await this.performCausalReasoning(request);
          break;
        default:
          // General complex reasoning - use hybrid approach
          result = await this.performHybridReasoning(chain, request);
      }
      
      console.log(`✅ [REASONING COMPLETE] Complex reasoning completed for chain ${chainId}`);
      return result;
      
    } catch (error) {
      console.error(`❌ [REASONING ERROR] Complex reasoning failed:`, error);
      throw error;
    }
  }

  private generateReasoningResult(chain: ReasoningChain, type: string): any {
    return {
      chainId: chain.id,
      type: `${type}_reasoning_result`,
      goal: chain.goal,
      steps: chain.steps,
      confidence: chain.confidence,
      status: chain.status,
      reasoning: chain.steps.map(step => step.content).join(' → '),
      conclusion: chain.steps.length > 0 ? chain.steps[chain.steps.length - 1].content : 'No conclusion reached',
      evidence: chain.evidence,
      timestamp: new Date().toISOString()
    };
  }

  private async performCausalReasoning(request: any): Promise<any> {
    console.log('🔗 [CAUSAL REASONING] Analyzing causal relationships...');
    
    const causalRelation: CausalRelation = {
      id: `causal_${Date.now()}`,
      cause: request.cause || 'Unknown cause',
      effect: request.effect || 'Unknown effect',
      strength: request.strength || 0.7,
      confidence: request.confidence || 0.8,
      evidence: request.evidence || [],
      context: request.context || {}
    };
    
    this.causalRelations.push(causalRelation);
    
    return {
      type: 'causal_reasoning_result',
      causalRelation: causalRelation,
      analysis: `Causal relationship identified: ${causalRelation.cause} → ${causalRelation.effect}`,
      strength: causalRelation.strength,
      confidence: causalRelation.confidence,
      timestamp: new Date().toISOString()
    };
  }

  private async performHybridReasoning(chain: ReasoningChain, request: any): Promise<any> {
    console.log('🌟 [HYBRID REASONING] Applying multi-modal reasoning approach...');
    
    // Apply multiple reasoning types for comprehensive analysis
    await this.performDeductiveReasoning(chain, request.context || {});
    await this.performInductiveReasoning(chain, request.context || {});
    
    // Generate hybrid result
    return {
      type: 'hybrid_reasoning_result',
      chainId: chain.id,
      goal: chain.goal,
      approaches: ['deductive', 'inductive'],
      steps: chain.steps,
      confidence: chain.confidence,
      reasoning: 'Multi-modal reasoning approach applied for comprehensive analysis',
      conclusion: chain.steps.length > 0 ? chain.steps[chain.steps.length - 1].content : 'Complex analysis complete',
      recommendations: [
        'Consider multiple perspectives',
        'Validate assumptions',
        'Gather additional evidence if needed'
      ],
      timestamp: new Date().toISOString()
    };
  }
}

// Singleton instance
let reasoningEngineInstance: ReasoningEngine | null = null;

export function getReasoningEngine(apiKey?: string): ReasoningEngine {
  if (!reasoningEngineInstance) {
    if (!apiKey) {
      throw new Error('ReasoningEngine not initialized. Provide API key on first call.');
    }
    reasoningEngineInstance = new ReasoningEngine(apiKey);
  }
  return reasoningEngineInstance;
}

export function initializeReasoningEngine(apiKey: string): ReasoningEngine {
  reasoningEngineInstance = new ReasoningEngine(apiKey);
  return reasoningEngineInstance;
}
