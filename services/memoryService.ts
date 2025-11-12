import { AgentMemory, AgentLearningEvent } from '../types/agentTypes';

export interface MemoryVector {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    timestamp: number;
    type: 'episodic' | 'semantic' | 'procedural';
    importance: number; // 0-1
    accessCount: number;
    lastAccessed: number;
    tags: string[];
  };
}

export interface MemoryCluster {
  id: string;
  centroid: number[];
  memories: string[]; // memory IDs
  theme: string;
  strength: number; // 0-1
}

export class MemoryService {
  private memories: Map<string, MemoryVector> = new Map();
  private clusters: Map<string, MemoryCluster> = new Map();
  private agentMemories: Map<string, AgentMemory> = new Map();
  private vectorDimension: number = 384; // Default embedding dimension

  constructor(vectorDimension: number = 384) {
    this.vectorDimension = vectorDimension;
  }

  // Memory Storage and Retrieval
  async storeMemory(
    agentId: string,
    content: string,
    type: 'episodic' | 'semantic' | 'procedural',
    importance: number = 0.5,
    tags: string[] = []
  ): Promise<string> {
    const memoryId = this.generateId();
    const embedding = await this.generateEmbedding(content);
    
    const memory: MemoryVector = {
      id: memoryId,
      content,
      embedding,
      metadata: {
        timestamp: Date.now(),
        type,
        importance,
        accessCount: 0,
        lastAccessed: Date.now(),
        tags
      }
    };

    this.memories.set(memoryId, memory);
    
    // Add to agent's memory structure
    const agentMemory = this.getOrCreateAgentMemory(agentId);
    switch (type) {
      case 'episodic':
        agentMemory.episodic.push({
          timestamp: Date.now(),
          event: content,
          context: { memoryId, tags },
          outcome: null
        });
        break;
      case 'semantic':
        agentMemory.semantic.set(memoryId, {
          concept: content,
          relationships: [],
          confidence: importance
        });
        break;
      default:
        agentMemory.longTerm.set(memoryId, memory);
    }

    // Update clusters
    await this.updateClusters(memory);
    
    console.log(`💾 Memory stored for agent ${agentId}: ${content.substring(0, 50)}...`);
    return memoryId;
  }

  async retrieveMemories(
    agentId: string,
    query: string,
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<MemoryVector[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const agentMemory = this.agentMemories.get(agentId);
    
    if (!agentMemory) return [];

    // Get all memory IDs for this agent
    const agentMemoryIds = new Set<string>();
    
    // Collect from episodic memory
    agentMemory.episodic.forEach(episode => {
      if (episode.context?.memoryId) {
        agentMemoryIds.add(episode.context.memoryId);
      }
    });
    
    // Collect from semantic memory
    agentMemory.semantic.forEach((_, memoryId) => {
      agentMemoryIds.add(memoryId);
    });
    
    // Collect from long-term memory
    agentMemory.longTerm.forEach((_, memoryId) => {
      agentMemoryIds.add(memoryId);
    });

    // Calculate similarities and filter
    const similarities: Array<{ memory: MemoryVector; similarity: number }> = [];
    
    for (const memoryId of agentMemoryIds) {
      const memory = this.memories.get(memoryId);
      if (memory) {
        const similarity = this.cosineSimilarity(queryEmbedding, memory.embedding);
        if (similarity >= threshold) {
          similarities.push({ memory, similarity });
          
          // Update access statistics
          memory.metadata.accessCount++;
          memory.metadata.lastAccessed = Date.now();
        }
      }
    }

    // Sort by similarity and importance
    similarities.sort((a, b) => {
      const scoreA = a.similarity * 0.7 + a.memory.metadata.importance * 0.3;
      const scoreB = b.similarity * 0.7 + b.memory.metadata.importance * 0.3;
      return scoreB - scoreA;
    });

    return similarities.slice(0, limit).map(s => s.memory);
  }

  // Memory Consolidation
  async consolidateMemories(agentId: string): Promise<void> {
    const agentMemory = this.agentMemories.get(agentId);
    if (!agentMemory) return;

    console.log(`🧠 Consolidating memories for agent ${agentId}...`);

    // Move important short-term memories to long-term
    const shortTermEntries = Array.from(agentMemory.shortTerm.entries());
    for (const [key, value] of shortTermEntries) {
      if (this.shouldConsolidate(value)) {
        agentMemory.longTerm.set(key, value);
        agentMemory.shortTerm.delete(key);
      }
    }

    // Merge similar episodic memories
    await this.mergeEpisodicMemories(agentMemory);
    
    // Update semantic relationships
    await this.updateSemanticRelationships(agentMemory);
    
    // Prune old, unimportant memories
    await this.pruneMemories(agentMemory);
  }

  // Memory Forgetting (Importance-based decay)
  async forgetMemories(agentId: string, forgetThreshold: number = 0.1): Promise<number> {
    const agentMemory = this.agentMemories.get(agentId);
    if (!agentMemory) return 0;

    let forgottenCount = 0;
    const currentTime = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    // Forget from episodic memory
    agentMemory.episodic = agentMemory.episodic.filter(episode => {
      const age = currentTime - episode.timestamp;
      const importance = this.calculateEpisodicImportance(episode);
      const shouldForget = importance < forgetThreshold && age > oneWeek;
      
      if (shouldForget) {
        forgottenCount++;
        // Remove from main memory storage
        if (episode.context?.memoryId) {
          this.memories.delete(episode.context.memoryId);
        }
      }
      
      return !shouldForget;
    });

    // Forget from semantic memory
    const semanticToDelete: string[] = [];
    agentMemory.semantic.forEach((concept, memoryId) => {
      if (concept.confidence < forgetThreshold) {
        semanticToDelete.push(memoryId);
        this.memories.delete(memoryId);
        forgottenCount++;
      }
    });
    
    semanticToDelete.forEach(id => agentMemory.semantic.delete(id));

    console.log(`🗑️ Agent ${agentId} forgot ${forgottenCount} memories`);
    return forgottenCount;
  }

  // Learning Integration
  async processLearningEvent(agentId: string, event: AgentLearningEvent): Promise<void> {
    const importance = this.calculateLearningImportance(event);
    const tags = this.extractTags(event);
    
    // Store the learning event as a memory
    await this.storeMemory(
      agentId,
      `Learning: ${event.lesson}`,
      'episodic',
      importance,
      tags
    );

    // Update existing related memories
    const relatedMemories = await this.retrieveMemories(
      agentId,
      event.lesson,
      5,
      0.6
    );

    for (const memory of relatedMemories) {
      // Strengthen related memories
      memory.metadata.importance = Math.min(1.0, memory.metadata.importance * 1.1);
      
      // Add learning context
      if (!memory.metadata.tags.includes('learning')) {
        memory.metadata.tags.push('learning');
      }
    }
  }

  // Memory Analytics
  getMemoryStats(agentId: string): any {
    const agentMemory = this.agentMemories.get(agentId);
    if (!agentMemory) return null;

    const totalMemories = agentMemory.episodic.length + 
                         agentMemory.semantic.size + 
                         agentMemory.longTerm.size;

    return {
      totalMemories,
      episodicCount: agentMemory.episodic.length,
      semanticCount: agentMemory.semantic.size,
      longTermCount: agentMemory.longTerm.size,
      shortTermCount: agentMemory.shortTerm.size,
      clusters: this.clusters.size,
      averageImportance: this.calculateAverageImportance(agentId),
      memoryEfficiency: this.calculateMemoryEfficiency(agentId)
    };
  }

  // Private Methods
  private getOrCreateAgentMemory(agentId: string): AgentMemory {
    if (!this.agentMemories.has(agentId)) {
      this.agentMemories.set(agentId, {
        shortTerm: new Map(),
        longTerm: new Map(),
        episodic: [],
        semantic: new Map()
      });
    }
    return this.agentMemories.get(agentId)!;
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Simplified embedding generation - in production, use a real embedding model
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(this.vectorDimension).fill(0);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < this.vectorDimension; j++) {
        // Simple hash-based embedding
        const hash = this.simpleHash(word + j);
        embedding[j] += Math.sin(hash) * (1 / Math.sqrt(words.length));
      }
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async updateClusters(memory: MemoryVector): Promise<void> {
    // Find the best cluster for this memory
    let bestCluster: MemoryCluster | null = null;
    let bestSimilarity = 0;

    for (const cluster of this.clusters.values()) {
      const similarity = this.cosineSimilarity(memory.embedding, cluster.centroid);
      if (similarity > bestSimilarity && similarity > 0.7) {
        bestSimilarity = similarity;
        bestCluster = cluster;
      }
    }

    if (bestCluster) {
      // Add to existing cluster
      bestCluster.memories.push(memory.id);
      bestCluster.strength = Math.min(1.0, bestCluster.strength + 0.1);
      
      // Update centroid
      await this.updateClusterCentroid(bestCluster);
    } else {
      // Create new cluster
      const clusterId = this.generateId();
      const newCluster: MemoryCluster = {
        id: clusterId,
        centroid: [...memory.embedding],
        memories: [memory.id],
        theme: this.extractTheme(memory.content),
        strength: 0.5
      };
      
      this.clusters.set(clusterId, newCluster);
    }
  }

  private async updateClusterCentroid(cluster: MemoryCluster): Promise<void> {
    const embeddings: number[][] = [];
    
    for (const memoryId of cluster.memories) {
      const memory = this.memories.get(memoryId);
      if (memory) {
        embeddings.push(memory.embedding);
      }
    }

    if (embeddings.length === 0) return;

    // Calculate new centroid
    const newCentroid = new Array(this.vectorDimension).fill(0);
    for (const embedding of embeddings) {
      for (let i = 0; i < this.vectorDimension; i++) {
        newCentroid[i] += embedding[i];
      }
    }

    for (let i = 0; i < this.vectorDimension; i++) {
      newCentroid[i] /= embeddings.length;
    }

    cluster.centroid = newCentroid;
  }

  private shouldConsolidate(value: any): boolean {
    // Simple heuristic for memory consolidation
    if (typeof value === 'object' && value.metadata) {
      return value.metadata.accessCount > 2 || value.metadata.importance > 0.7;
    }
    return false;
  }

  private async mergeEpisodicMemories(memory: AgentMemory): Promise<void> {
    // Group similar episodic memories
    const groups: Array<Array<any>> = [];
    
    for (const episode of memory.episodic) {
      let addedToGroup = false;
      
      for (const group of groups) {
        if (this.areEpisodesSimilar(episode, group[0])) {
          group.push(episode);
          addedToGroup = true;
          break;
        }
      }
      
      if (!addedToGroup) {
        groups.push([episode]);
      }
    }

    // Merge groups with multiple episodes
    const mergedEpisodes: any[] = [];
    for (const group of groups) {
      if (group.length > 1) {
        const merged = this.mergeEpisodeGroup(group);
        mergedEpisodes.push(merged);
      } else {
        mergedEpisodes.push(group[0]);
      }
    }

    memory.episodic = mergedEpisodes;
  }

  private async updateSemanticRelationships(memory: AgentMemory): Promise<void> {
    // Update relationships between semantic concepts
    const concepts = Array.from(memory.semantic.entries());
    
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const [id1, concept1] = concepts[i];
        const [id2, concept2] = concepts[j];
        
        const memory1 = this.memories.get(id1);
        const memory2 = this.memories.get(id2);
        
        if (memory1 && memory2) {
          const similarity = this.cosineSimilarity(memory1.embedding, memory2.embedding);
          
          if (similarity > 0.6) {
            if (!concept1.relationships.includes(id2)) {
              concept1.relationships.push(id2);
            }
            if (!concept2.relationships.includes(id1)) {
              concept2.relationships.push(id1);
            }
          }
        }
      }
    }
  }

  private async pruneMemories(memory: AgentMemory): Promise<void> {
    const maxEpisodic = 1000;
    const maxSemantic = 500;
    const maxLongTerm = 2000;

    // Prune episodic memories (keep most recent and important)
    if (memory.episodic.length > maxEpisodic) {
      memory.episodic.sort((a, b) => {
        const importanceA = this.calculateEpisodicImportance(a);
        const importanceB = this.calculateEpisodicImportance(b);
        return importanceB - importanceA;
      });
      memory.episodic = memory.episodic.slice(0, maxEpisodic);
    }

    // Prune semantic memories (keep highest confidence)
    if (memory.semantic.size > maxSemantic) {
      const semanticArray = Array.from(memory.semantic.entries());
      semanticArray.sort((a, b) => b[1].confidence - a[1].confidence);
      
      memory.semantic.clear();
      for (let i = 0; i < maxSemantic; i++) {
        memory.semantic.set(semanticArray[i][0], semanticArray[i][1]);
      }
    }

    // Prune long-term memories (keep most accessed and important)
    if (memory.longTerm.size > maxLongTerm) {
      const longTermArray = Array.from(memory.longTerm.entries());
      longTermArray.sort((a, b) => {
        const scoreA = (a[1] as any).metadata?.importance || 0;
        const scoreB = (b[1] as any).metadata?.importance || 0;
        return scoreB - scoreA;
      });
      
      memory.longTerm.clear();
      for (let i = 0; i < maxLongTerm; i++) {
        memory.longTerm.set(longTermArray[i][0], longTermArray[i][1]);
      }
    }
  }

  private calculateEpisodicImportance(episode: any): number {
    const age = Date.now() - episode.timestamp;
    const dayInMs = 24 * 60 * 60 * 1000;
    const ageFactor = Math.exp(-age / (30 * dayInMs)); // Decay over 30 days
    
    // Base importance on outcome and context
    let importance = 0.5;
    if (episode.outcome) {
      importance += 0.3;
    }
    if (episode.context && Object.keys(episode.context).length > 0) {
      importance += 0.2;
    }
    
    return importance * ageFactor;
  }

  private calculateLearningImportance(event: AgentLearningEvent): number {
    let importance = event.confidence;
    
    // Boost importance for successful learning
    if (event.type === 'success') {
      importance *= 1.2;
    } else if (event.type === 'failure') {
      importance *= 1.1; // Failures are also important for learning
    }
    
    return Math.min(1.0, importance);
  }

  private extractTags(event: AgentLearningEvent): string[] {
    const tags = ['learning', event.type];
    
    // Extract tags from lesson content
    const words = event.lesson.toLowerCase().split(/\s+/);
    const importantWords = words.filter(word => 
      word.length > 3 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'man', 'way', 'she', 'use', 'her', 'now', 'oil', 'sit', 'set'].includes(word)
    );
    
    tags.push(...importantWords.slice(0, 3));
    return tags;
  }

  private extractTheme(content: string): string {
    // Simple theme extraction - in production, use NLP
    const words = content.toLowerCase().split(/\s+/);
    const commonWords = words.filter(word => word.length > 4);
    return commonWords.slice(0, 3).join(' ') || 'general';
  }

  private areEpisodesSimilar(episode1: any, episode2: any): boolean {
    // Simple similarity check
    const timeDiff = Math.abs(episode1.timestamp - episode2.timestamp);
    const oneHour = 60 * 60 * 1000;
    
    return timeDiff < oneHour && 
           episode1.event.toLowerCase().includes(episode2.event.toLowerCase().split(' ')[0]);
  }

  private mergeEpisodeGroup(group: any[]): any {
    // Merge multiple similar episodes into one
    const merged = { ...group[0] };
    merged.event = `Merged: ${group.map(e => e.event).join('; ')}`;
    merged.context = {
      ...merged.context,
      mergedCount: group.length,
      originalTimestamps: group.map(e => e.timestamp)
    };
    
    return merged;
  }

  private calculateAverageImportance(agentId: string): number {
    const agentMemory = this.agentMemories.get(agentId);
    if (!agentMemory) return 0;

    let totalImportance = 0;
    let count = 0;

    // Calculate from stored memories
    agentMemory.longTerm.forEach(memory => {
      if ((memory as any).metadata?.importance) {
        totalImportance += (memory as any).metadata.importance;
        count++;
      }
    });

    agentMemory.semantic.forEach(concept => {
      totalImportance += concept.confidence;
      count++;
    });

    return count > 0 ? totalImportance / count : 0;
  }

  private calculateMemoryEfficiency(agentId: string): number {
    const agentMemory = this.agentMemories.get(agentId);
    if (!agentMemory) return 0;

    const totalMemories = agentMemory.episodic.length + 
                         agentMemory.semantic.size + 
                         agentMemory.longTerm.size;
    
    const accessedMemories = Array.from(agentMemory.longTerm.values())
      .filter(memory => (memory as any).metadata?.accessCount > 0).length;

    return totalMemories > 0 ? accessedMemories / totalMemories : 0;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let memoryServiceInstance: MemoryService | null = null;

export function getMemoryService(): MemoryService {
  if (!memoryServiceInstance) {
    memoryServiceInstance = new MemoryService();
  }
  return memoryServiceInstance;
}
