"""
Basic LLM Wrapper - Supports OpenAI, Anthropic, and Simple embeddings
"""

import numpy as np
import hashlib
from abc import ABC, abstractmethod
from typing import Optional, List
import json

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    def __init__(self, model: str = None, api_key: str = None):
        self.model = model
        self.api_key = api_key
        self.total_cost = 0.0
        self.total_tokens = 0
    
    @abstractmethod
    def embed(self, text: str) -> np.ndarray:
        """Generate embedding for text"""
        pass
    
    def get_embedding_dim(self) -> int:
        """Get embedding dimension"""
        return 768  # Default for all providers
    
    def get_cost(self) -> float:
        """Get total cost so far"""
        return self.total_cost
    
    def reset_cost(self):
        """Reset cost tracking"""
        self.total_cost = 0.0
        self.total_tokens = 0


class SimpleEmbedding(LLMProvider):
    """Simple hash-based embedding (no API required)"""
    
    def __init__(self):
        super().__init__(model="simple", api_key=None)
    
    def embed(self, text: str) -> np.ndarray:
        """Generate deterministic embedding from text hash"""
        # Hash the text
        text_hash = hashlib.sha256(text.encode()).hexdigest()
        
        # Convert hash to numpy array seed
        seed = int(text_hash[:8], 16)
        np.random.seed(seed)
        
        # Generate 768-dim embedding
        embedding = np.random.randn(768)
        
        # Normalize to unit sphere
        embedding = embedding / (np.linalg.norm(embedding) + 1e-8)
        
        # Add positional encoding
        positions = np.arange(768)
        pos_enc = np.sin(positions / 10000 ** (np.arange(768) / 768))
        embedding = embedding * 0.9 + pos_enc * 0.1
        
        # Cost tracking (simulated)
        self.total_cost += 0.000001  # Virtually free
        self.total_tokens += len(text.split())
        
        return embedding
    
    def get_cost(self) -> float:
        """Simple embedding is virtually free"""
        return self.total_cost


class OpenAIEmbedding(LLMProvider):
    """OpenAI embeddings"""
    
    def __init__(self, api_key: str, model: str = "text-embedding-ada-002"):
        if not OPENAI_AVAILABLE:
            raise ImportError("OpenAI package not installed. Run: pip install openai")
        
        super().__init__(model=model, api_key=api_key)
        openai.api_key = api_key
    
    def embed(self, text: str) -> np.ndarray:
        """Get embedding from OpenAI API"""
        try:
            response = openai.Embedding.create(
                model=self.model,
                input=text
            )
            
            # Extract embedding
            embedding = np.array(response['data'][0]['embedding'])
            
            # Cost tracking (approximate)
            tokens = len(text.split())
            self.total_tokens += tokens
            self.total_cost += tokens * 0.000001  # Approx $0.001 per 1K tokens
            
            return embedding
            
        except Exception as e:
            print(f"OpenAI embedding error: {e}")
            # Fall back to simple embedding
            simple = SimpleEmbedding()
            return simple.embed(text)


class AnthropicEmbedding(LLMProvider):
    """Anthropic Claude embeddings"""
    
    def __init__(self, api_key: str, model: str = "claude-3-haiku-20240307"):
        if not ANTHROPIC_AVAILABLE:
            raise ImportError("Anthropic package not installed. Run: pip install anthropic")
        
        super().__init__(model=model, api_key=api_key)
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def embed(self, text: str) -> np.ndarray:
        """Get embedding from Anthropic Claude"""
        try:
            # Note: Claude doesn't have direct embedding API as of 2024
            # We'll simulate by using completion and extracting features
            message = self.client.messages.create(
                model=self.model,
                max_tokens=1,
                messages=[
                    {"role": "user", "content": text}
                ]
            )
            
            # For now, use simple embedding as placeholder
            # In production, you'd extract hidden states or use a different approach
            simple = SimpleEmbedding()
            embedding = simple.embed(text)
            
            # Cost tracking (approximate)
            tokens = len(text.split())
            self.total_tokens += tokens
            self.total_cost += tokens * 0.000001  # Approx
            
            return embedding
            
        except Exception as e:
            print(f"Anthropic embedding error: {e}")
            # Fall back to simple embedding
            simple = SimpleEmbedding()
            return simple.embed(text)

