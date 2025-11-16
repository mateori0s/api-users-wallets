import { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../../middleware/validate.middleware';
import { validationResult } from 'express-validator';

// Mock express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

// Type assertion helper for mocked validationResult
const mockedValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;

describe('validateRequest Middleware - Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next() if validation passes', () => {
    mockedValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    } as any);

    validateRequest(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should return 400 with validation errors if validation fails', () => {
    const mockErrors = [
      { type: 'field', path: 'email', msg: 'Valid email is required' },
      { type: 'field', path: 'password', msg: 'Password must be at least 6 characters' },
    ];

    mockedValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => mockErrors,
    } as any);

    validateRequest(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation failed',
      errors: [
        { field: 'email', message: 'Valid email is required' },
        { field: 'password', message: 'Password must be at least 6 characters' },
      ],
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should format errors correctly', () => {
    const mockErrors = [
      { type: 'field', path: 'chain', msg: 'Chain is required' },
      { type: 'other', msg: 'Some other error' }, // Non-field error
    ];

    mockedValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => mockErrors,
    } as any);

    validateRequest(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation failed',
      errors: [
        { field: 'chain', message: 'Chain is required' },
        { field: 'unknown', message: 'Some other error' },
      ],
    });
  });

  it('should handle empty errors array', () => {
    mockedValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [],
    } as any);

    validateRequest(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation failed',
      errors: [],
    });
  });

  it('should handle single validation error', () => {
    const mockErrors = [
      { type: 'field', path: 'email', msg: 'Email is required' },
    ];

    mockedValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => mockErrors,
    } as any);

    validateRequest(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Validation failed',
      errors: [{ field: 'email', message: 'Email is required' }],
    });
  });
});

