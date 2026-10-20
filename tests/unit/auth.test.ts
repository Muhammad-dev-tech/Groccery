import { describe, it, expect } from 'vitest';
import {
  registerCustomerSchema,
  registerVendorSchema,
  assignAdminRoleSchema,
  loginSchema,
} from '@/lib/validations/auth';

describe('Authentication Validation Schemas', () => {
  it('validates a valid customer registration payload', () => {
    const payload = {
      fullName: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123',
    };
    const result = registerCustomerSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const payload = {
      fullName: 'Bob Smith',
      email: 'bob@example.com',
      password: 'short',
      confirmPassword: 'short',
    };
    const result = registerCustomerSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 8 characters');
    }
  });

  it('rejects mismatched passwords during registration', () => {
    const payload = {
      fullName: 'Bob Smith',
      email: 'bob@example.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword456!',
    };
    const result = registerCustomerSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Passwords don't match");
    }
  });

  it('validates a comprehensive vendor onboarding payload', () => {
    const payload = {
      fullName: 'Marcus Green',
      email: 'marcus@greenmarket.com',
      password: 'StorePassword999',
      confirmPassword: 'StorePassword999',
      storeName: 'Green Mountain Grocers',
      contactPhone: '+1 555-0199',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62704',
    };
    const result = registerVendorSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email formats', () => {
    const payload = {
      email: 'not-an-email',
      password: 'password123',
    };
    const result = loginSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('valid email');
    }
  });

  it('enforces UUID format and audit reasoning on admin role assignment', () => {
    const invalidPayload = {
      targetUserId: 'not-a-uuid',
      reason: 'Promoted',
    };
    const result = assignAdminRoleSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);

    const validPayload = {
      targetUserId: '123e4567-e89b-12d3-a456-426614174000',
      reason: 'Promoted to admin following senior security review.',
    };
    const validResult = assignAdminRoleSchema.safeParse(validPayload);
    expect(validResult.success).toBe(true);
  });
});
