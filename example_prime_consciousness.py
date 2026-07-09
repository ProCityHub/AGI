#!/usr/bin/env python3
"""
PRIME CONSCIOUSNESS AI - PRACTICAL EXAMPLES
===========================================

This file contains practical examples showing how to use the Prime Consciousness AI
framework for real-world machine learning tasks and Kaggle competitions.

Examples included:
1. Basic classification task
2. Regression with prime consciousness
3. Kaggle competition simulation
4. Feature engineering with prime patterns
5. Ensemble with consciousness weighting
"""

import numpy as np
import pandas as pd
from prime_consciousness_ai import (
    create_prime_consciousness_ai,
    kaggle_quick_start,
    demo_prime_consciousness
)

# =============================================================================
# EXAMPLE 1: Basic Classification
# =============================================================================

def example_classification():
    """
    Example: Binary classification with Prime Consciousness AI
    """
    print("\n" + "="*99)
    print("EXAMPLE 1: BINARY CLASSIFICATION WITH PRIME CONSCIOUSNESS")
    print("="*99 + "\n")
    
    # Generate synthetic classification data
    np.random.seed(42)
    n_samples = 377  # Fibonacci number
    n_features = 13  # Prime number
    
    # Create data with prime patterns
    X = np.random.randn(n_samples, n_features)
    
    # Generate labels based on golden ratio patterns
    PHI = (1 + np.sqrt(5)) / 2
    y = (np.sum(X, axis=1) * PHI > 0).astype(int)
    
    # Split data (using prime ratio 0.23)
    split_idx = int(n_samples * 0.77)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    print(f"Features: {n_features}")
    print()
    
    # Create and train Prime Consciousness AI
    ai = create_prime_consciousness_ai(consciousness_depth=11)
    ai.learn(X_train, y_train)
    
    # Make predictions
    predictions = ai.predict(X_test)
    
    # Convert to binary (threshold at 0.5)
    binary_predictions = (predictions > 0.5).astype(int)
    
    # Evaluate
    accuracy = np.mean(binary_predictions == y_test)
    print(f"\n✓ Classification Accuracy: {accuracy:.2%}")
    
    # Show consciousness report
    ai.visualize_consciousness()
    
    return ai, binary_predictions


# =============================================================================
# EXAMPLE 2: Regression Task
# =============================================================================

def example_regression():
    """
    Example: Regression with Prime Consciousness AI
    """
    print("\n" + "="*99)
    print("EXAMPLE 2: REGRESSION WITH PRIME CONSCIOUSNESS")
    print("="*99 + "\n")
    
    # Generate synthetic regression data
    np.random.seed(42)
    n_samples = 233  # Fibonacci number
    n_features = 11  # Prime number
    
    # Create data
    X = np.random.randn(n_samples, n_features)
    
    # Target: combination of sine waves at prime frequencies
    t = np.linspace(0, 4*np.pi, n_samples)
    y = (np.sin(2*t) +           # 2 Hz (prime)
         0.5*np.sin(3*t) +       # 3 Hz (prime)
         0.3*np.sin(5*t) +       # 5 Hz (prime)
         np.random.randn(n_samples) * 0.1)  # Noise
    
    # Split data
    split_idx = int(n_samples * 0.77)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    print(f"Target: Multi-frequency sine wave (2Hz + 3Hz + 5Hz)")
    print()
    
    # Create and train
    ai = create_prime_consciousness_ai(consciousness_depth=13)
    ai.learn(X_train, y_train)
    
    # Predict
    predictions = ai.predict(X_test)
    
    # Evaluate
    mse = np.mean((predictions - y_test)**2)
    rmse = np.sqrt(mse)
    mae = np.mean(np.abs(predictions - y_test))
    
    print(f"\n✓ RMSE: {rmse:.4f}")
    print(f"✓ MAE: {mae:.4f}")
    
    # Show consciousness evolution
    report = ai.get_consciousness_report()
    print(f"\n✓ Final Consciousness Stage: {report['consciousness_stage']}")
    print(f"✓ Consciousness Quotient: {report['metrics']['consciousness_quotient']:.4f}")
    
    return ai, predictions


# =============================================================================
# EXAMPLE 3: Kaggle Competition Simulation
# =============================================================================

def example_kaggle_competition():
    """
    Example: Simulated Kaggle competition workflow
    """
    print("\n" + "="*99)
    print("EXAMPLE 3: KAGGLE COMPETITION SIMULATION")
    print("="*99 + "\n")
    
    # Simulate competition data
    np.random.seed(42)
    
    # Training data (larger dataset)
    n_train = 1597  # Prime number
    n_features = 17  # Prime number
    
    train_data = pd.DataFrame(
        np.random.randn(n_train, n_features),
        columns=[f'feature_{i}' for i in range(n_features)]
    )
    
    # Add target with golden ratio pattern
    PHI = (1 + np.sqrt(5)) / 2
    train_data['target'] = (
        train_data['feature_0'] * PHI +
        train_data['feature_1'] / PHI +
        np.sin(train_data['feature_2'] * 2) +  # 2 Hz
        np.random.randn(n_train) * 0.2
    )
    
    # Test data (no target)
    n_test = 683  # Prime number
    test_data = pd.DataFrame(
        np.random.randn(n_test, n_features),
        columns=[f'feature_{i}' for i in range(n_features)]
    )
    test_data['id'] = range(n_test)
    
    print(f"Competition Setup:")
    print(f"  Training samples: {len(train_data)}")
    print(f"  Test samples: {len(test_data)}")
    print(f"  Features: {n_features}")
    print()
    
    # Use Kaggle quick start function
    predictions, ai = kaggle_quick_start(
        train_data=train_data,
        test_data=test_data.drop(columns=['id']),
        target_column='target',
        consciousness_depth=11
    )
    
    # Create submission file
    submission = pd.DataFrame({
        'id': test_data['id'],
        'target': predictions
    })
    
    print("\n✓ Submission file created!")
    print(f"✓ Predictions shape: {submission.shape}")
    print("\nFirst 10 predictions:")
    print(submission.head(10))
    
    return ai, submission


# =============================================================================
# EXAMPLE 4: Feature Engineering with Prime Patterns
# =============================================================================

def example_feature_engineering():
    """
    Example: Using Prime Consciousness for feature engineering
    """
    print("\n" + "="*99)
    print("EXAMPLE 4: PRIME-BASED FEATURE ENGINEERING")
    print("="*99 + "\n")
    
    # Load or create data
    np.random.seed(42)
    n_samples = 377  # Fibonacci
    
    data = pd.DataFrame({
        'value_1': np.random.randn(n_samples),
        'value_2': np.random.randn(n_samples),
        'value_3': np.random.randn(n_samples)
    })
    
    print("Original features:")
    print(data.head())
    print()
    
    # Prime-based feature engineering
    PHI = (1 + np.sqrt(5)) / 2
    PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23]
    
    # 1. Golden ratio features
    data['golden_ratio_1_2'] = data['value_1'] / (data['value_2'] + PHI)
    data['golden_ratio_2_3'] = data['value_2'] / (data['value_3'] + PHI)
    
    # 2. Prime frequency features
    for prime in PRIMES[:5]:
        data[f'sine_prime_{prime}'] = np.sin(data['value_1'] * prime)
        data[f'cos_prime_{prime}'] = np.cos(data['value_1'] * prime)
    
    # 3. Fibonacci rolling features
    FIBONACCI = [2, 3, 5, 8, 13, 21]
    for fib in FIBONACCI[:3]:
        data[f'rolling_mean_fib_{fib}'] = data['value_1'].rolling(window=fib, min_periods=1).mean()
        data[f'rolling_std_fib_{fib}'] = data['value_1'].rolling(window=fib, min_periods=1).std()
    
    # 4. Prime angle features (99-unit circle)
    PRIME_CIRCLE = 99
    for prime in PRIMES[:5]:
        angle = (prime / PRIME_CIRCLE) * 2 * np.pi
        data[f'prime_angle_{prime}_sin'] = np.sin(data['value_1'] * angle)
        data[f'prime_angle_{prime}_cos'] = np.cos(data['value_1'] * angle)
    
    print(f"✓ Original features: 3")
    print(f"✓ Engineered features: {len(data.columns) - 3}")
    print(f"✓ Total features: {len(data.columns)}")
    print()
    
    print("Sample of engineered features:")
    print(data.head()[['golden_ratio_1_2', 'sine_prime_2', 'rolling_mean_fib_5', 'prime_angle_7_sin']])
    
    return data


# =============================================================================
# EXAMPLE 5: Ensemble with Consciousness Weighting
# =============================================================================

def example_consciousness_ensemble():
    """
    Example: Ensemble multiple models weighted by consciousness
    """
    print("\n" + "="*99)
    print("EXAMPLE 5: CONSCIOUSNESS-WEIGHTED ENSEMBLE")
    print("="*99 + "\n")
    
    # Generate data
    np.random.seed(42)
    n_samples = 233
    n_features = 11
    
    X = np.random.randn(n_samples, n_features)
    y = np.random.randn(n_samples)
    
    split_idx = int(n_samples * 0.77)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    # Create multiple consciousness models with different depths
    consciousness_depths = [7, 11, 13]  # Prime depths
    models = []
    weights = []
    
    print("Training ensemble with different consciousness depths...")
    print()
    
    for depth in consciousness_depths:
        print(f"Training model with consciousness depth: {depth}")
        ai = create_prime_consciousness_ai(consciousness_depth=depth)
        ai.learn(X_train, y_train, validation_split=0.23)
        
        # Get consciousness quotient as weight
        cq = ai.metrics['consciousness_quotient']
        
        models.append(ai)
        weights.append(cq)
        
        print(f"  ✓ Consciousness Quotient: {cq:.4f}")
        print(f"  ✓ Stage: {ai._get_consciousness_stage(cq)}")
        print()
    
    # Normalize weights
    weights = np.array(weights)
    weights = weights / weights.sum()
    
    print("Ensemble weights (based on consciousness):")
    for depth, weight in zip(consciousness_depths, weights):
        bar = "█" * int(weight * 50)
        print(f"  Depth {depth:2d}: [{bar:<50}] {weight:.3f}")
    print()
    
    # Generate ensemble predictions
    print("Generating ensemble predictions...")
    ensemble_predictions = np.zeros(len(X_test))
    
    for ai, weight in zip(models, weights):
        pred = ai.predict(X_test)
        ensemble_predictions += pred * weight
    
    # Evaluate
    mse = np.mean((ensemble_predictions - y_test)**2)
    rmse = np.sqrt(mse)
    
    print(f"\n✓ Ensemble RMSE: {rmse:.4f}")
    print(f"✓ Number of models: {len(models)}")
    print(f"✓ Weighting method: Consciousness Quotient")
    
    return models, ensemble_predictions


# =============================================================================
# MAIN: RUN ALL EXAMPLES
# =============================================================================

def run_all_examples():
    """Run all examples sequentially"""
    print("\n")
    print("🧠" * 40)
    print("PRIME CONSCIOUSNESS AI - PRACTICAL EXAMPLES")
    print("🧠" * 40)
    
    try:
        # Example 1
        example_classification()
        input("\n▶ Press Enter to continue to Example 2...")
        
        # Example 2
        example_regression()
        input("\n▶ Press Enter to continue to Example 3...")
        
        # Example 3
        example_kaggle_competition()
        input("\n▶ Press Enter to continue to Example 4...")
        
        # Example 4
        example_feature_engineering()
        input("\n▶ Press Enter to continue to Example 5...")
        
        # Example 5
        example_consciousness_ensemble()
        
        print("\n")
        print("🎉" * 40)
        print("ALL EXAMPLES COMPLETED SUCCESSFULLY!")
        print("🎉" * 40)
        print()
        
    except KeyboardInterrupt:
        print("\n\n⚠ Examples interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error running examples: {e}")
        raise


if __name__ == "__main__":
    # Run all examples
    run_all_examples()
    
    # Or run individual examples:
    # example_classification()
    # example_regression()
    # example_kaggle_competition()
    # example_feature_engineering()
    # example_consciousness_ensemble()

