import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: any[];
  customValidator?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  query?: ValidationRule[];
  body?: ValidationRule[];
  params?: ValidationRule[];
}

export function validateRequest(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate query parameters
    if (schema.query) {
      const queryErrors = validateObject(req.query, schema.query, 'query');
      errors.push(...queryErrors);
    }

    // Validate request body
    if (schema.body) {
      const bodyErrors = validateObject(req.body, schema.body, 'body');
      errors.push(...bodyErrors);
    }

    // Validate URL parameters
    if (schema.params) {
      const paramErrors = validateObject(req.params, schema.params, 'params');
      errors.push(...paramErrors);
    }

    if (errors.length > 0) {
      logger.warn('Request validation failed', { 
        url: req.url, 
        method: req.method, 
        errors 
      });
      
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
}

function validateObject(obj: any, rules: ValidationRule[], context: string): string[] {
  const errors: string[] = [];

  for (const rule of rules) {
    const value = obj[rule.field];
    const fieldPath = `${context}.${rule.field}`;

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldPath} is required`);
      continue;
    }

    // Skip validation if field is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    if (rule.type) {
      const typeError = validateType(value, rule.type, fieldPath);
      if (typeError) {
        errors.push(typeError);
        continue;
      }
    }

    // String-specific validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${fieldPath} must be at least ${rule.minLength} characters long`);
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${fieldPath} must be no more than ${rule.maxLength} characters long`);
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${fieldPath} format is invalid`);
      }
    }

    // Allowed values validation
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push(`${fieldPath} must be one of: ${rule.allowedValues.join(', ')}`);
    }

    // Custom validation
    if (rule.customValidator) {
      const customResult = rule.customValidator(value);
      if (customResult !== true) {
        const errorMessage = typeof customResult === 'string' 
          ? customResult 
          : `${fieldPath} failed custom validation`;
        errors.push(errorMessage);
      }
    }
  }

  return errors;
}

function validateType(value: any, expectedType: string, fieldPath: string): string | null {
  switch (expectedType) {
    case 'string':
      if (typeof value !== 'string') {
        return `${fieldPath} must be a string`;
      }
      break;
    
    case 'number':
      if (typeof value !== 'number' && !(!isNaN(Number(value)))) {
        return `${fieldPath} must be a number`;
      }
      break;
    
    case 'boolean':
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return `${fieldPath} must be a boolean`;
      }
      break;
    
    case 'array':
      if (!Array.isArray(value)) {
        return `${fieldPath} must be an array`;
      }
      break;
    
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        return `${fieldPath} must be an object`;
      }
      break;
    
    default:
      return `Unknown type validation: ${expectedType}`;
  }
  
  return null;
}

// Common validation schemas for reuse
export const commonSchemas = {
  pagination: {
    query: [
      { field: 'page', type: 'number' as const, customValidator: (v: any) => Number(v) > 0 || 'Page must be greater than 0' },
      { field: 'limit', type: 'number' as const, customValidator: (v: any) => Number(v) > 0 && Number(v) <= 100 || 'Limit must be between 1 and 100' }
    ]
  },
  
  countryFilter: {
    query: [
      { field: 'country', type: 'string' as const, allowedValues: ['Canada', 'United States', 'Mexico', 'Brazil', 'Argentina'] }
    ]
  },
  
  searchQuery: {
    query: [
      { field: 'q', type: 'string' as const, required: true, minLength: 1, maxLength: 200 }
    ]
  }
};

// Middleware for common validations
export const validatePagination = validateRequest(commonSchemas.pagination);
export const validateCountryFilter = validateRequest(commonSchemas.countryFilter);
export const validateSearchQuery = validateRequest(commonSchemas.searchQuery);
