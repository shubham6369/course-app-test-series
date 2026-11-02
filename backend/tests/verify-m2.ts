/**
 * Milestone 2 Automated Verification Suite
 * Tests admin JWT auth, login/logout/me API handlers, middleware protection,
 * and 24-section sidebar configuration.
 */

import { NextRequest } from 'next/server';
import {
  signAdminToken,
  verifyAdminToken,
  extractAdminToken,
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_OPTIONS,
} from '../src/lib/auth';
import { POST as loginHandler } from '../src/app/api/admin/auth/login/route';
import { POST as logoutHandler } from '../src/app/api/admin/auth/logout/route';
import { GET as meHandler } from '../src/app/api/admin/auth/me/route';
import { middleware } from '../src/middleware';
import { ADMIN_NAV_SECTIONS } from '../src/components/admin-sidebar';

let passedTests = 0;
let failedTests = 0;

function assert(condition: unknown, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failedTests++;
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Running Milestone 2 Verification Test Suite');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST 1: JWT Signing & Verification
  // ----------------------------------------------------
  console.log('--- Test 1: JWT Signing & Verification ---');
  const samplePayload = {
    id: 1,
    email: 'neerajkumarmahato740@gmail.com',
    name: 'Neeraj Kumar Mahato',
    role: 'owner',
    avatarUrl: null,
  };

  const token = await signAdminToken(samplePayload);
  assert(typeof token === 'string' && token.split('.').length === 3, 'JWT token is a valid 3-segment string');

  const decoded = await verifyAdminToken(token);
  assert(decoded !== null, 'Valid JWT token decodes successfully');
  assert(decoded?.id === samplePayload.id, `Decoded ID matches: ${decoded?.id}`);
  assert(decoded?.email === samplePayload.email, `Decoded Email matches: ${decoded?.email}`);
  assert(decoded?.role === 'owner', `Decoded Role is owner: ${decoded?.role}`);

  const forgedToken = token.slice(0, -6) + 'abcdef';
  const forgedResult = await verifyAdminToken(forgedToken);
  assert(forgedResult === null, 'Forged/tampered JWT token correctly rejected');

  const emptyResult = await verifyAdminToken('invalid.token.here');
  assert(emptyResult === null, 'Malformed JWT token correctly rejected');

  // ----------------------------------------------------
  // TEST 2: Token Extraction from Headers & Cookies
  // ----------------------------------------------------
  console.log('\n--- Test 2: Token Extraction Helpers ---');
  const reqWithBearer = new Request('http://localhost:3000/api/admin/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const extractedBearer = extractAdminToken(reqWithBearer);
  assert(extractedBearer === token, 'Token extracted correctly from Bearer Authorization header');

  const reqWithCookie = new Request('http://localhost:3000/api/admin/auth/me', {
    headers: { Cookie: `${ADMIN_COOKIE_NAME}=${token}; other=value` },
  });
  const extractedCookie = extractAdminToken(reqWithCookie);
  assert(extractedCookie === token, 'Token extracted correctly from Cookie header');

  const reqEmpty = new Request('http://localhost:3000/api/admin/auth/me');
  assert(extractAdminToken(reqEmpty) === null, 'Empty request returns null token');

  // ----------------------------------------------------
  // TEST 3: Admin Login Route Handler (/api/admin/auth/login)
  // ----------------------------------------------------
  console.log('\n--- Test 3: Admin Login API Handler ---');
  
  // 3.1: Successful login with valid owner credentials
  const validLoginReq = new NextRequest('http://localhost:3000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'neerajkumarmahato740@gmail.com',
      password: '123456!!',
    }),
  });

  const loginRes = await loginHandler(validLoginReq);
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, `Login status 200 OK (received: ${loginRes.status})`);
  assert(loginData.status === 'success', `Login response status is 'success'`);
  assert(loginData.user?.email === 'neerajkumarmahato740@gmail.com', `Logged in user email matches`);
  assert(loginData.user?.role === 'owner', `Logged in user role is 'owner'`);

  // Check aim_admin cookie on response
  const setCookieHeader = loginRes.headers.get('set-cookie');
  assert(setCookieHeader !== null && setCookieHeader.includes(ADMIN_COOKIE_NAME), `Response sets ${ADMIN_COOKIE_NAME} cookie`);
  assert(setCookieHeader?.includes('HttpOnly') || setCookieHeader?.includes('httponly'), `${ADMIN_COOKIE_NAME} cookie is HttpOnly`);

  // 3.2: Failed login with invalid password
  const badPassReq = new NextRequest('http://localhost:3000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'neerajkumarmahato740@gmail.com',
      password: 'wrongpassword123',
    }),
  });
  const badPassRes = await loginHandler(badPassReq);
  assert(badPassRes.status === 401, `Invalid password rejected with 401 Unauthorized (received: ${badPassRes.status})`);

  // 3.3: Failed login with missing credentials
  const missingReq = new NextRequest('http://localhost:3000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '' }),
  });
  const missingRes = await loginHandler(missingReq);
  assert(missingRes.status === 400, `Missing fields rejected with 400 Bad Request`);

  // ----------------------------------------------------
  // TEST 4: Admin Profile Route Handler (/api/admin/auth/me)
  // ----------------------------------------------------
  console.log('\n--- Test 4: Admin /me API Handler ---');

  // 4.1: Authorized request using Cookie
  const activeToken = loginData.token || token;
  const meReq = new NextRequest('http://localhost:3000/api/admin/auth/me', {
    headers: { Cookie: `${ADMIN_COOKIE_NAME}=${activeToken}` },
  });
  const meRes = await meHandler(meReq);
  const meData = await meRes.json();
  assert(meRes.status === 200, `Admin /me status 200 OK`);
  assert(meData.status === 'success', `Admin /me returns status 'success'`);
  assert(meData.user?.name === 'Neeraj Kumar Mahato', `Admin /me user name matches: ${meData.user?.name}`);

  // 4.2: Unauthorized request with no credentials
  const meNoAuthReq = new NextRequest('http://localhost:3000/api/admin/auth/me');
  const meNoAuthRes = await meHandler(meNoAuthReq);
  assert(meNoAuthRes.status === 401, `Admin /me without token returns 401`);

  // ----------------------------------------------------
  // TEST 5: Admin Logout Route Handler (/api/admin/auth/logout)
  // ----------------------------------------------------
  console.log('\n--- Test 5: Admin Logout API Handler ---');
  const logoutRes = await logoutHandler();
  const logoutData = await logoutRes.json();
  assert(logoutRes.status === 200, `Logout status 200 OK`);
  assert(logoutData.status === 'success', `Logout response status is 'success'`);
  const logoutCookie = logoutRes.headers.get('set-cookie');
  assert(logoutCookie?.includes(`${ADMIN_COOKIE_NAME}=;`) || logoutCookie?.includes('Max-Age=0'), `Logout clears ${ADMIN_COOKIE_NAME} cookie`);

  // ----------------------------------------------------
  // TEST 6: Route Middleware Protection
  // ----------------------------------------------------
  console.log('\n--- Test 6: Route Middleware Protection ---');

  // 6.1: Protected /admin without cookie -> Redirect to /admin/login
  const mwReqNoAuth = new NextRequest('http://localhost:3000/admin');
  const mwResNoAuth = await middleware(mwReqNoAuth);
  assert(mwResNoAuth.status === 307 || mwResNoAuth.status === 308 || mwResNoAuth.headers.get('location') !== null, `Unauthenticated /admin redirects`);
  assert(mwResNoAuth.headers.get('location')?.includes('/admin/login'), `Redirect target is /admin/login`);

  // 6.2: Protected /admin/courses with subpath redirection
  const mwReqCourses = new NextRequest('http://localhost:3000/admin/courses');
  const mwResCourses = await middleware(mwReqCourses);
  assert(mwResCourses.headers.get('location')?.includes('/admin/login?redirect=%2Fadmin%2Fcourses'), `Redirect includes original target pathname`);

  // 6.3: Authenticated /admin with valid token -> Allowed through
  const mwReqAuth = new NextRequest('http://localhost:3000/admin', {
    headers: { Cookie: `${ADMIN_COOKIE_NAME}=${token}` },
  });
  const mwResAuth = await middleware(mwReqAuth);
  assert(mwResAuth.status === 200 && !mwResAuth.headers.get('location'), `Authenticated request permitted without redirect`);

  // 6.4: Login page visited by authenticated user -> Redirects to /admin
  const mwReqLoginAuth = new NextRequest('http://localhost:3000/admin/login', {
    headers: { Cookie: `${ADMIN_COOKIE_NAME}=${token}` },
  });
  const mwResLoginAuth = await middleware(mwReqLoginAuth);
  assert(mwResLoginAuth.headers.get('location')?.includes('/admin'), `Logged-in admin visiting /admin/login redirected to /admin`);

  // 6.5: Login page visited by unauthenticated user -> Allowed through
  const mwReqLoginGuest = new NextRequest('http://localhost:3000/admin/login');
  const mwResLoginGuest = await middleware(mwReqLoginGuest);
  assert(mwResLoginGuest.status === 200 && !mwResLoginGuest.headers.get('location'), `Guest visiting /admin/login allowed through`);

  // ----------------------------------------------------
  // TEST 7: Exact 24-Section Navigation Tree Check
  // ----------------------------------------------------
  console.log('\n--- Test 7: Sidebar 24-Section Navigation Tree ---');
  let totalNavItems = 0;
  const allRoutes: string[] = [];

  for (const section of ADMIN_NAV_SECTIONS) {
    for (const item of section.items) {
      totalNavItems++;
      allRoutes.push(item.href);
    }
  }

  assert(totalNavItems === 24, `Sidebar contains EXACTLY 24 navigation items (found: ${totalNavItems})`);

  const expectedRoutes = [
    '/admin',
    '/admin/courses',
    '/admin/quizzes',
    '/admin/test-series',
    '/admin/test-analytics',
    '/admin/resources',
    '/admin/ebooks',
    '/admin/live',
    '/admin/community',
    '/admin/doubts',
    '/admin/comments',
    '/admin/students',
    '/admin/deletion-requests',
    '/admin/enrollments',
    '/admin/orders',
    '/admin/coupons',
    '/admin/ai',
    '/admin/banners',
    '/admin/notifications',
    '/admin/announcements',
    '/admin/settings',
    '/admin/staff',
    '/admin/setup',
    '/admin/billing',
  ];

  for (const route of expectedRoutes) {
    assert(allRoutes.includes(route), `Sidebar includes expected route: ${route}`);
  }

  console.log('\n====================================================');
  console.log(`🎉 ALL TESTS PASSED! (${passedTests} passed, ${failedTests} failed)`);
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
