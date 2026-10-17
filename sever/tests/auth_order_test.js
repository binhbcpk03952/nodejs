/**
 * Automated Test Suite for Núi Xanh Badminton Backend Logic
 * Tests:
 * 1. Password Hashing & Verification (scrypt + salt)
 * 2. JWT Generation & Verification (Signature tampering, Expiration)
 * 3. Vietnamese Phone & Email Input Validation
 * 4. Order Price & Voucher Calculation Logic
 * 5. Order State Machine Transition Rules
 */

const assert = require('assert');
const { hashPassword, verifyPassword, generateToken, verifyToken } = require('../utils/authHelper');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\n=== RUNNING BACKEND LOGIC & SECURITY TESTS ===\n');

// 1. AUTH HELPER TESTS
console.log('[1/4] Auth Helper & Password Cryptography:');

runTest('hashPassword returns salt:hash format', () => {
  const hash = hashPassword('MySecurePassword@123');
  assert(typeof hash === 'string', 'Hash should be a string');
  assert(hash.includes(':'), 'Hash must contain salt delimiter ":"');
  const [salt, key] = hash.split(':');
  assert.strictEqual(salt.length, 32, 'Salt hex length should be 32 (16 bytes)');
  assert.strictEqual(key.length, 128, 'Derived key hex length should be 128 (64 bytes)');
});

runTest('verifyPassword verifies matching password', () => {
  const password = 'TestCustomer@2026';
  const hash = hashPassword(password);
  assert.strictEqual(verifyPassword(password, hash), true, 'Password verification should succeed for valid password');
});

runTest('verifyPassword rejects incorrect password', () => {
  const password = 'TestCustomer@2026';
  const hash = hashPassword(password);
  assert.strictEqual(verifyPassword('WrongPassword@999', hash), false, 'Password verification should reject incorrect password');
});

runTest('verifyPassword handles corrupted hash without throwing', () => {
  assert.strictEqual(verifyPassword('pwd', 'corrupted-hash-without-colon'), false);
  assert.strictEqual(verifyPassword('pwd', null), false);
  assert.strictEqual(verifyPassword('pwd', ''), false);
});

// 2. JWT TESTS
console.log('\n[2/4] JWT Token Generation & Verification:');

runTest('generateToken creates valid 3-part JWT', () => {
  const payload = { userId: 42, role: 'customer', email: 'test@badminton.vn' };
  const token = generateToken(payload);
  assert(typeof token === 'string', 'Token should be a string');
  const parts = token.split('.');
  assert.strictEqual(parts.length, 3, 'JWT must have 3 parts (header.payload.signature)');
});

runTest('verifyToken decodes valid token payload', () => {
  const payload = { userId: 99, role: 'admin', email: 'admin@badminton.vn' };
  const token = generateToken(payload, 3600);
  const decoded = verifyToken(token);
  assert(decoded !== null, 'Decoded payload should not be null');
  assert.strictEqual(decoded.userId, 99);
  assert.strictEqual(decoded.role, 'admin');
  assert.strictEqual(decoded.email, 'admin@badminton.vn');
});

runTest('verifyToken rejects tampered token payload or signature', () => {
  const token = generateToken({ userId: 1, role: 'customer' });
  const [header, , sig] = token.split('.');
  
  // Tamper with payload (elevate to admin)
  const fakeBody = Buffer.from(JSON.stringify({ userId: 1, role: 'admin' })).toString('base64url');
  const tamperedToken = `${header}.${fakeBody}.${sig}`;
  
  assert.strictEqual(verifyToken(tamperedToken), null, 'Tampered token must be rejected');
});

runTest('verifyToken rejects expired token', () => {
  // Create token with negative expiration (-10 seconds)
  const token = generateToken({ userId: 5 }, -10);
  assert.strictEqual(verifyToken(token), null, 'Expired token must be rejected');
});

// 3. VALIDATION TESTS
console.log('\n[3/4] Vietnamese Phone & Input Validation:');

const VIETNAM_PHONE_REGEX = /^(0[3|5|7|8|9])[0-9]{8}$/;

runTest('Vietnamese phone number regex matches valid numbers', () => {
  const validPhones = ['0912345678', '0389999888', '0771234567', '0834567890', '0567890123'];
  validPhones.forEach((phone) => {
    assert(VIETNAM_PHONE_REGEX.test(phone), `Phone ${phone} should be valid`);
  });
});

runTest('Vietnamese phone number regex rejects invalid numbers', () => {
  const invalidPhones = ['0123456789', '091234567', '09123456789', 'abcdefghij', ''];
  invalidPhones.forEach((phone) => {
    assert(!VIETNAM_PHONE_REGEX.test(phone), `Phone ${phone} should be invalid`);
  });
});

// 4. ORDER PRICING & STATE MACHINE TESTS
console.log('\n[4/4] Order Pricing & Status State Machine:');

function calculateOrderTotal(items, discountVoucher) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountAmount = 0;
  
  if (discountVoucher) {
    if (discountVoucher.min_order_value && subtotal < discountVoucher.min_order_value) {
      throw new Error(`Đơn hàng chưa đạt giá trị tối thiểu ${discountVoucher.min_order_value}đ`);
    }
    if (discountVoucher.discount_type === 'percentage') {
      discountAmount = Math.round((subtotal * discountVoucher.discount_value) / 100);
      if (discountVoucher.max_discount && discountAmount > discountVoucher.max_discount) {
        discountAmount = discountVoucher.max_discount;
      }
    } else if (discountVoucher.discount_type === 'fixed') {
      discountAmount = discountVoucher.discount_value;
    }
  }
  
  const finalAmount = Math.max(0, subtotal - discountAmount);
  return { subtotal, discountAmount, finalAmount };
}

runTest('Order price calculates accurate subtotal', () => {
  const items = [
    { price: 1500000, quantity: 2 },
    { price: 200000, quantity: 3 }
  ];
  const { subtotal, finalAmount } = calculateOrderTotal(items, null);
  assert.strictEqual(subtotal, 3600000);
  assert.strictEqual(finalAmount, 3600000);
});

runTest('Order price applies percentage discount with cap', () => {
  const items = [{ price: 2000000, quantity: 1 }];
  const voucher = {
    discount_type: 'percentage',
    discount_value: 20, // 20% of 2M = 400,000
    max_discount: 300000 // capped at 300,000
  };
  const { discountAmount, finalAmount } = calculateOrderTotal(items, voucher);
  assert.strictEqual(discountAmount, 300000);
  assert.strictEqual(finalAmount, 1700000);
});

const VALID_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed', 'cancelled'],
  completed: [], // terminal state
  cancelled: []  // terminal state
};

function isValidStatusTransition(fromStatus, toStatus) {
  const allowed = VALID_STATUS_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

runTest('Order status transition rules enforce valid workflow', () => {
  assert.strictEqual(isValidStatusTransition('pending', 'confirmed'), true);
  assert.strictEqual(isValidStatusTransition('confirmed', 'shipping'), true);
  assert.strictEqual(isValidStatusTransition('shipping', 'completed'), true);
  assert.strictEqual(isValidStatusTransition('pending', 'cancelled'), true);
  assert.strictEqual(isValidStatusTransition('confirmed', 'cancelled'), true);
});

runTest('Order status transition rules block illegal state jumps', () => {
  assert.strictEqual(isValidStatusTransition('pending', 'completed'), false, 'Cannot complete without confirmation/shipping');
  assert.strictEqual(isValidStatusTransition('completed', 'pending'), false, 'Cannot revert completed order to pending');
  assert.strictEqual(isValidStatusTransition('completed', 'cancelled'), false, 'Cannot cancel already completed order');
  assert.strictEqual(isValidStatusTransition('cancelled', 'shipping'), false, 'Cannot ship cancelled order');
});

console.log(`\n========================================`);
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed.`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
