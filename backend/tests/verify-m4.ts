/**
 * Milestone 4 Automated Verification Test Suite
 * Tests all 24 Admin routes, middleware authentication with aim_admin session,
 * Server Component rendering, and supporting CRUD API endpoints.
 */

import React from 'react';
(globalThis as any).React = React;

import { NextRequest } from 'next/server';
import prisma from '../src/lib/prisma';
import { middleware } from '../src/middleware';
import { signAdminToken, ADMIN_COOKIE_NAME } from '../src/lib/auth';
import { ADMIN_NAV_SECTIONS } from '../src/components/admin-sidebar';

// Server Components for all 24 Admin screens
import AdminDashboardPage from '../src/app/(admin)/admin/page';
import AdminCoursesPage from '../src/app/(admin)/admin/courses/page';
import NewCoursePage from '../src/app/(admin)/admin/courses/new/page';
import AdminQuizzesPage from '../src/app/(admin)/admin/quizzes/page';
import AdminTestSeriesPage from '../src/app/(admin)/admin/test-series/page';
import AdminAnalyticsPage from '../src/app/(admin)/admin/test-analytics/page';
import AdminResourcesPage from '../src/app/(admin)/admin/resources/page';
import AdminEbooksPage from '../src/app/(admin)/admin/ebooks/page';
import AdminLivePage from '../src/app/(admin)/admin/live/page';
import AdminCommunityPage from '../src/app/(admin)/admin/community/page';
import AdminDoubtsPage from '../src/app/(admin)/admin/doubts/page';
import AdminCommentsPage from '../src/app/(admin)/admin/comments/page';
import AdminStudentsPage from '../src/app/(admin)/admin/students/page';
import AdminDeletionRequestsPage from '../src/app/(admin)/admin/deletion-requests/page';
import AdminEnrollmentsPage from '../src/app/(admin)/admin/enrollments/page';
import AdminOrdersPage from '../src/app/(admin)/admin/orders/page';
import AdminCouponsPage from '../src/app/(admin)/admin/coupons/page';
import AdminAiPage from '../src/app/(admin)/admin/ai/page';
import AdminBannersPage from '../src/app/(admin)/admin/banners/page';
import AdminNotificationsPage from '../src/app/(admin)/admin/notifications/page';
import AdminAnnouncementsPage from '../src/app/(admin)/admin/announcements/page';
import AdminSettingsPage from '../src/app/(admin)/admin/settings/page';
import AdminStaffPage from '../src/app/(admin)/admin/staff/page';
import AdminSetupPage from '../src/app/(admin)/admin/setup/page';
import AdminBillingPage from '../src/app/(admin)/admin/billing/page';

// Supporting API Route Handlers
import { GET as getResources, POST as postResource, DELETE as deleteResource } from '../src/app/api/admin/resources/route';
import { GET as getEbooks, POST as postEbook, DELETE as deleteEbook } from '../src/app/api/admin/ebooks/route';
import { GET as getLive, POST as postLive, PATCH as patchLive, DELETE as deleteLive } from '../src/app/api/admin/live/route';
import { GET as getCommunity, PATCH as patchCommunity, DELETE as deleteCommunity } from '../src/app/api/admin/community/route';
import { GET as getDoubts, POST as postDoubtReply, PATCH as patchDoubtStatus, DELETE as deleteDoubt } from '../src/app/api/admin/doubts/route';
import { GET as getComments, POST as postComment, DELETE as deleteComment } from '../src/app/api/admin/comments/route';
import { GET as getStudents, POST as postStudent, PATCH as patchStudent, DELETE as deleteStudent } from '../src/app/api/admin/students/route';
import { GET as getDeletionRequests, PATCH as patchDeletionRequest } from '../src/app/api/admin/deletion-requests/route';
import { GET as getEnrollments, POST as postEnrollment, PATCH as patchEnrollment, DELETE as deleteEnrollment } from '../src/app/api/admin/enrollments/route';
import { GET as getOrders, PATCH as patchOrder } from '../src/app/api/admin/orders/route';
import { GET as getCoupons, POST as postCoupon, PATCH as patchCoupon, DELETE as deleteCoupon } from '../src/app/api/admin/coupons/route';
import { GET as getAi, PUT as putAi } from '../src/app/api/admin/ai/route';
import { GET as getBanners, POST as postBanner, PATCH as patchBanner, DELETE as deleteBanner } from '../src/app/api/admin/banners/route';
import { GET as getNotifications, POST as postNotification, DELETE as deleteNotification } from '../src/app/api/admin/notifications/route';
import { GET as getAnnouncements, POST as postAnnouncement, PATCH as patchAnnouncement, DELETE as deleteAnnouncement } from '../src/app/api/admin/announcements/route';
import { GET as getSettings, PUT as putSettings } from '../src/app/api/admin/settings/route';
import { GET as getStaff, POST as postStaff, PATCH as patchStaff, DELETE as deleteStaff } from '../src/app/api/admin/staff/route';
import { GET as getSetup, POST as postSetup } from '../src/app/api/admin/setup/route';
import { GET as getBilling } from '../src/app/api/admin/billing/route';

let passedTests = 0;
let failedTests = 0;

function assert(condition: unknown, message: string) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAILED: ${message}`);
    failedTests++;
    throw new Error(message);
  }
}

async function runMilestone4Verification() {
  console.log('====================================================');
  console.log('🚀 Running Milestone 4 Verification Test Suite');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // Test 1: Verify All 24 Admin Sidebar Routes
    // ----------------------------------------------------
    console.log('--- Test 1: 24 Admin Routes Index Verification ---');
    const allRoutes = ADMIN_NAV_SECTIONS.flatMap((sec) => sec.items.map((i) => i.href));
    assert(allRoutes.length === 24, `Sidebar contains exactly 24 routes (found: ${allRoutes.length})`);
    console.log(`Verified routes: ${allRoutes.join(', ')}`);

    // ----------------------------------------------------
    // Test 2: Middleware Auth & Session Protection on All 24 Routes
    // ----------------------------------------------------
    console.log('\n--- Test 2: Middleware Session & Protection on All 24 Routes ---');
    const validToken = await signAdminToken({
      id: 1,
      email: 'neerajkumarmahato740@gmail.com',
      name: 'Neeraj Kumar Mahato',
      role: 'owner',
      avatarUrl: null,
    });

    for (const route of allRoutes) {
      // Unauthenticated request should redirect to /admin/login
      const unauthReq = new NextRequest(`http://localhost:3000${route}`);
      const unauthRes = await middleware(unauthReq);
      assert(
        unauthRes.status === 307 || unauthRes.status === 302,
        `Unauthenticated request to ${route} redirects to login (status: ${unauthRes.status})`
      );

      // Authenticated request with valid aim_admin session passes through
      const authReq = new NextRequest(`http://localhost:3000${route}`, {
        headers: {
          cookie: `${ADMIN_COOKIE_NAME}=${validToken}`,
        },
      });
      const authRes = await middleware(authReq);
      assert(
        authRes.status === 200,
        `Authenticated request to ${route} with aim_admin session allows access (status: 200)`
      );
    }

    // ----------------------------------------------------
    // Test 3: Server Component Rendering for All 24 Routes
    // ----------------------------------------------------
    console.log('\n--- Test 3: Server Component Execution & SQLite Hydration ---');
    const pageRenderers: Record<string, () => Promise<any> | any> = {
      '/admin': AdminDashboardPage,
      '/admin/courses': AdminCoursesPage,
      '/admin/quizzes': AdminQuizzesPage,
      '/admin/test-series': AdminTestSeriesPage,
      '/admin/test-analytics': AdminAnalyticsPage,
      '/admin/resources': AdminResourcesPage,
      '/admin/ebooks': AdminEbooksPage,
      '/admin/live': AdminLivePage,
      '/admin/community': AdminCommunityPage,
      '/admin/doubts': AdminDoubtsPage,
      '/admin/comments': AdminCommentsPage,
      '/admin/students': AdminStudentsPage,
      '/admin/deletion-requests': AdminDeletionRequestsPage,
      '/admin/enrollments': AdminEnrollmentsPage,
      '/admin/orders': AdminOrdersPage,
      '/admin/coupons': AdminCouponsPage,
      '/admin/ai': AdminAiPage,
      '/admin/banners': AdminBannersPage,
      '/admin/notifications': AdminNotificationsPage,
      '/admin/announcements': AdminAnnouncementsPage,
      '/admin/settings': AdminSettingsPage,
      '/admin/staff': AdminStaffPage,
      '/admin/setup': AdminSetupPage,
      '/admin/billing': AdminBillingPage,
    };

    for (const [route, renderFn] of Object.entries(pageRenderers)) {
      const element = await renderFn();
      assert(element !== null && typeof element === 'object', `Server Component for ${route} rendered successfully`);
    }

    // Also verify sub-route /admin/courses/new
    assert(typeof NewCoursePage === 'function', 'Client Component for /admin/courses/new is exported and valid');

    // ----------------------------------------------------
    // Test 4: Resources API CRUD Verification
    // ----------------------------------------------------
    console.log('\n--- Test 4: Resources API CRUD ---');
    const getResReq = new NextRequest('http://localhost:3000/api/admin/resources');
    const resListRes = await getResources(getResReq);
    assert(resListRes.status === 200, 'GET /api/admin/resources returned 200');
    const resListJson = await resListRes.json();
    assert(Array.isArray(resListJson.data), 'GET /api/admin/resources returns array');

    const postResReq = new NextRequest('http://localhost:3000/api/admin/resources', {
      method: 'POST',
      body: JSON.stringify({
        title: 'M4 Test Formula Guide',
        type: 'pdf',
        fileUrl: 'https://cdn.d3vx.in/m4-test.pdf',
        fileSize: '1.8 MB',
      }),
    });
    const postResRes = await postResource(postResReq);
    assert(postResRes.status === 201, 'POST /api/admin/resources returned 201');
    const postResJson = await postResRes.json();
    const createdResourceId = postResJson.data.id;

    const delResReq = new NextRequest(`http://localhost:3000/api/admin/resources?id=${createdResourceId}`);
    const delResRes = await deleteResource(delResReq);
    assert(delResRes.status === 200, 'DELETE /api/admin/resources returned 200');

    // ----------------------------------------------------
    // Test 5: E-Books API CRUD Verification
    // ----------------------------------------------------
    console.log('\n--- Test 5: E-Books API CRUD ---');
    const getEbooksReq = new NextRequest('http://localhost:3000/api/admin/ebooks');
    const ebooksRes = await getEbooks(getEbooksReq);
    assert(ebooksRes.status === 200, 'GET /api/admin/ebooks returned 200');

    const postEbookReq = new NextRequest('http://localhost:3000/api/admin/ebooks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'M4 Test Biology Companion',
        author: 'Dr. Test Panel',
        pdfUrl: 'https://cdn.d3vx.in/m4-ebook.pdf',
        pageCount: 140,
        isFree: true,
      }),
    });
    const postEbookRes = await postEbook(postEbookReq);
    assert(postEbookRes.status === 201, 'POST /api/admin/ebooks returned 201');
    const createdEbookId = (await postEbookRes.json()).data.id;

    const delEbookReq = new NextRequest(`http://localhost:3000/api/admin/ebooks?id=${createdEbookId}`);
    const delEbookRes = await deleteEbook(delEbookReq);
    assert(delEbookRes.status === 200, 'DELETE /api/admin/ebooks returned 200');

    // ----------------------------------------------------
    // Test 6: Live Classes API CRUD Verification
    // ----------------------------------------------------
    console.log('\n--- Test 6: Live Classes API CRUD ---');
    const getLiveReq = new NextRequest('http://localhost:3000/api/admin/live');
    const liveRes = await getLive(getLiveReq);
    assert(liveRes.status === 200, 'GET /api/admin/live returned 200');

    const postLiveReq = new NextRequest('http://localhost:3000/api/admin/live', {
      method: 'POST',
      body: JSON.stringify({
        title: 'M4 Test Live Webinar',
        subject: 'Physics',
        instructorName: 'Prof. Test Instructor',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 45,
      }),
    });
    const postLiveRes = await postLive(postLiveReq);
    assert(postLiveRes.status === 201, 'POST /api/admin/live returned 201');
    const createdLiveId = (await postLiveRes.json()).data.id;

    const patchLiveReq = new NextRequest('http://localhost:3000/api/admin/live', {
      method: 'PATCH',
      body: JSON.stringify({ id: createdLiveId, status: 'live' }),
    });
    const patchLiveRes = await patchLive(patchLiveReq);
    assert(patchLiveRes.status === 200, 'PATCH /api/admin/live status toggled to live');

    const delLiveReq = new NextRequest(`http://localhost:3000/api/admin/live?id=${createdLiveId}`);
    const delLiveRes = await deleteLive(delLiveReq);
    assert(delLiveRes.status === 200, 'DELETE /api/admin/live returned 200');

    // ----------------------------------------------------
    // Test 7: Community Moderation API Verification
    // ----------------------------------------------------
    console.log('\n--- Test 7: Community Moderation API ---');
    const getCommReq = new NextRequest('http://localhost:3000/api/admin/community');
    const commRes = await getCommunity(getCommReq);
    assert(commRes.status === 200, 'GET /api/admin/community returned 200');
    const commJson = await commRes.json();
    assert(commJson.data.length >= 1, `Found community posts: ${commJson.data.length}`);

    const samplePostId = commJson.data[0].id;
    const patchCommReq = new NextRequest('http://localhost:3000/api/admin/community', {
      method: 'PATCH',
      body: JSON.stringify({ id: samplePostId, isPinned: true }),
    });
    const patchCommRes = await patchCommunity(patchCommReq);
    assert(patchCommRes.status === 200, 'PATCH /api/admin/community post pinned successfully');

    // ----------------------------------------------------
    // Test 8: Doubts Desk & Faculty Reply Thread API
    // ----------------------------------------------------
    console.log('\n--- Test 8: Doubts Desk & Faculty Reply Thread API ---');
    const getDoubtsReq = new NextRequest('http://localhost:3000/api/admin/doubts');
    const doubtsRes = await getDoubts(getDoubtsReq);
    assert(doubtsRes.status === 200, 'GET /api/admin/doubts returned 200');
    const doubtsJson = await doubtsRes.json();
    assert(doubtsJson.data.length >= 1, `Found doubts: ${doubtsJson.data.length}`);

    // Create a temporary doubt to test faculty reply thread and status resolution
    const student = await prisma.student.findFirst();
    assert(student !== null, 'Student exists in SQLite database');

    const testDoubt = await prisma.doubt.create({
      data: {
        studentId: student!.id,
        studentName: student!.name,
        subject: 'Biology',
        question: 'What is the function of telomeres in chromosomal replication?',
        status: 'open',
      },
    });

    // Post faculty answer
    const replyReq = new NextRequest('http://localhost:3000/api/admin/doubts', {
      method: 'POST',
      body: JSON.stringify({
        doubtId: testDoubt.id,
        message: 'Telomeres protect chromosomal ends from degradation during successive rounds of DNA replication.',
        authorName: 'Dr. Sen',
        markSolved: true,
      }),
    });
    const replyRes = await postDoubtReply(replyReq);
    assert(replyRes.status === 201, 'POST /api/admin/doubts posted faculty reply');
    const replyJson = await replyRes.json();
    assert(replyJson.data.doubt.status === 'solved', 'Doubt status automatically updated to SOLVED');

    // Clean up test doubt
    const delDoubtReq = new NextRequest(`http://localhost:3000/api/admin/doubts?id=${testDoubt.id}`);
    const delDoubtRes = await deleteDoubt(delDoubtReq);
    assert(delDoubtRes.status === 200, 'DELETE /api/admin/doubts returned 200');

    // ----------------------------------------------------
    // Test 9: Video Comments Moderation API
    // ----------------------------------------------------
    console.log('\n--- Test 9: Video Comments Moderation API ---');
    const getCommentsReq = new NextRequest('http://localhost:3000/api/admin/comments');
    const commentsRes = await getComments(getCommentsReq);
    assert(commentsRes.status === 200, 'GET /api/admin/comments returned 200');

    const lesson = await prisma.lesson.findFirst();
    assert(lesson !== null, 'Lesson exists in SQLite database');

    const postCommReq = new NextRequest('http://localhost:3000/api/admin/comments', {
      method: 'POST',
      body: JSON.stringify({
        lessonId: lesson!.id,
        comment: 'Faculty notice: remember to practice question bank after this module.',
      }),
    });
    const postCommRes = await postComment(postCommReq);
    assert(postCommRes.status === 201, 'POST /api/admin/comments posted teacher reply');
    const createdCommId = (await postCommRes.json()).data.id;

    const delCommReq = new NextRequest(`http://localhost:3000/api/admin/comments?id=${createdCommId}`);
    const delCommRes = await deleteComment(delCommReq);
    assert(delCommRes.status === 200, 'DELETE /api/admin/comments returned 200');

    // ----------------------------------------------------
    // Test 10: Students Directory & Toggle API
    // ----------------------------------------------------
    console.log('\n--- Test 10: Students Directory & Toggle API ---');
    const getStudentsReq = new NextRequest('http://localhost:3000/api/admin/students');
    const studentsRes = await getStudents(getStudentsReq);
    assert(studentsRes.status === 200, 'GET /api/admin/students returned 200');
    const studentsJson = await studentsRes.json();
    assert(studentsJson.data.length >= 1, `Students count: ${studentsJson.data.length}`);

    // Create a temporary test student
    const testStudentPhone = `999000${Date.now().toString().slice(-4)}`;
    const postStudentReq = new NextRequest('http://localhost:3000/api/admin/students', {
      method: 'POST',
      body: JSON.stringify({
        name: 'M4 Verification Student',
        email: `m4.student.${Date.now()}@example.com`,
        phone: testStudentPhone,
        targetExam: 'NEET 2026',
      }),
    });
    const postStudentRes = await postStudent(postStudentReq);
    assert(postStudentRes.status === 201, 'POST /api/admin/students created student');
    const createdStudentId = (await postStudentRes.json()).data.id;

    // Toggle active status
    const patchStudentReq = new NextRequest('http://localhost:3000/api/admin/students', {
      method: 'PATCH',
      body: JSON.stringify({ id: createdStudentId, isActive: false }),
    });
    const patchStudentRes = await patchStudent(patchStudentReq);
    assert(patchStudentRes.status === 200, 'PATCH /api/admin/students suspended student');
    const patchJson = await patchStudentRes.json();
    assert(patchJson.data.isActive === false, 'Student isActive is false');

    const delStudentReq = new NextRequest(`http://localhost:3000/api/admin/students?id=${createdStudentId}`);
    const delStudentRes = await deleteStudent(delStudentReq);
    assert(delStudentRes.status === 200, 'DELETE /api/admin/students removed test student');

    // ----------------------------------------------------
    // Test 11: Deletion Requests API
    // ----------------------------------------------------
    console.log('\n--- Test 11: Deletion Requests API ---');
    const getDelReq = new NextRequest('http://localhost:3000/api/admin/deletion-requests');
    const delReqRes = await getDeletionRequests(getDelReq);
    assert(delReqRes.status === 200, 'GET /api/admin/deletion-requests returned 200');

    // ----------------------------------------------------
    // Test 12: Enrollments Manager API
    // ----------------------------------------------------
    console.log('\n--- Test 12: Enrollments Manager API ---');
    const getEnrReq = new NextRequest('http://localhost:3000/api/admin/enrollments');
    const enrRes = await getEnrollments(getEnrReq);
    assert(enrRes.status === 200, 'GET /api/admin/enrollments returned 200');

    const course = await prisma.course.findFirst();
    assert(course !== null, 'Course exists in SQLite database');

    const postEnrReq = new NextRequest('http://localhost:3000/api/admin/enrollments', {
      method: 'POST',
      body: JSON.stringify({
        studentId: student!.id,
        itemType: 'course',
        itemId: course!.id,
        validityDays: 180,
      }),
    });
    const postEnrRes = await postEnrollment(postEnrReq);
    assert(postEnrRes.status === 201, 'POST /api/admin/enrollments granted manual access');
    const enrollmentId = (await postEnrRes.json()).data.id;

    const patchEnrReq = new NextRequest('http://localhost:3000/api/admin/enrollments', {
      method: 'PATCH',
      body: JSON.stringify({ id: enrollmentId, isActive: false }),
    });
    const patchEnrRes = await patchEnrollment(patchEnrReq);
    assert(patchEnrRes.status === 200, 'PATCH /api/admin/enrollments paused access');

    // ----------------------------------------------------
    // Test 13: Orders & Razorpay Receipts API
    // ----------------------------------------------------
    console.log('\n--- Test 13: Orders & Receipts API ---');
    const getOrdersReq = new NextRequest('http://localhost:3000/api/admin/orders');
    const ordersRes = await getOrders(getOrdersReq);
    assert(ordersRes.status === 200, 'GET /api/admin/orders returned 200');
    const ordersJson = await ordersRes.json();
    assert(ordersJson.data.length >= 1, `Orders found: ${ordersJson.data.length}`);

    // ----------------------------------------------------
    // Test 14: Coupons & Discounts API
    // ----------------------------------------------------
    console.log('\n--- Test 14: Coupons & Discounts API ---');
    const getCouponsReq = new NextRequest('http://localhost:3000/api/admin/coupons');
    const couponsRes = await getCoupons(getCouponsReq);
    assert(couponsRes.status === 200, 'GET /api/admin/coupons returned 200');

    const testCouponCode = `M4PROMO${Date.now().toString().slice(-4)}`;
    const postCouponReq = new NextRequest('http://localhost:3000/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify({
        code: testCouponCode,
        discountType: 'percentage',
        discountValue: 25,
        minOrderAmount: 299,
        usageLimit: 100,
      }),
    });
    const postCouponRes = await postCoupon(postCouponReq);
    assert(postCouponRes.status === 201, 'POST /api/admin/coupons created promo code');
    const createdCouponId = (await postCouponRes.json()).data.id;

    const patchCouponReq = new NextRequest('http://localhost:3000/api/admin/coupons', {
      method: 'PATCH',
      body: JSON.stringify({ id: createdCouponId, isActive: false }),
    });
    const patchCouponRes = await patchCoupon(patchCouponReq);
    assert(patchCouponRes.status === 200, 'PATCH /api/admin/coupons disabled coupon');

    const delCouponReq = new NextRequest(`http://localhost:3000/api/admin/coupons?id=${createdCouponId}`);
    const delCouponRes = await deleteCoupon(delCouponReq);
    assert(delCouponRes.status === 200, 'DELETE /api/admin/coupons removed coupon');

    // ----------------------------------------------------
    // Test 15: AI Tutor Hyperparameters & Logs API
    // ----------------------------------------------------
    console.log('\n--- Test 15: AI Tutor Hyperparameters & Logs API ---');
    const aiRes = await getAi();
    assert(aiRes.status === 200, 'GET /api/admin/ai returned 200');
    const aiJson = await aiRes.json();
    assert(aiJson.data.config.model === 'gpt-4o-mini', 'Default AI model is gpt-4o-mini');
    assert(Array.isArray(aiJson.data.auditLogs), 'AI audit logs returned array');

    const putAiReq = new NextRequest('http://localhost:3000/api/admin/ai', {
      method: 'PUT',
      body: JSON.stringify({
        systemPrompt: 'Updated M4 verified academic tutor prompt for NEET aspirants.',
        model: 'gpt-4o-mini',
        temperature: 0.65,
        maxTokens: 1200,
      }),
    });
    const putAiRes = await putAi(putAiReq);
    assert(putAiRes.status === 200, 'PUT /api/admin/ai saved updated prompt and hyperparameters');

    // ----------------------------------------------------
    // Test 16: Banners Carousel API
    // ----------------------------------------------------
    console.log('\n--- Test 16: Banners Carousel API ---');
    const bannersRes = await getBanners();
    assert(bannersRes.status === 200, 'GET /api/admin/banners returned 200');

    const postBannerReq = new NextRequest('http://localhost:3000/api/admin/banners', {
      method: 'POST',
      body: JSON.stringify({
        title: 'M4 Special Mock Series',
        subtitle: 'Enroll today and get instant AIR percentile',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
        actionType: 'test_series',
        actionValue: '1',
        order: 5,
      }),
    });
    const postBannerRes = await postBanner(postBannerReq);
    assert(postBannerRes.status === 201, 'POST /api/admin/banners added banner slide');
    const createdBannerId = (await postBannerRes.json()).data.id;

    const patchBannerReq = new NextRequest('http://localhost:3000/api/admin/banners', {
      method: 'PATCH',
      body: JSON.stringify({ id: createdBannerId, isActive: false }),
    });
    const patchBannerRes = await patchBanner(patchBannerReq);
    assert(patchBannerRes.status === 200, 'PATCH /api/admin/banners toggled active state');

    const delBannerReq = new NextRequest(`http://localhost:3000/api/admin/banners?id=${createdBannerId}`);
    const delBannerRes = await deleteBanner(delBannerReq);
    assert(delBannerRes.status === 200, 'DELETE /api/admin/banners removed banner');

    // ----------------------------------------------------
    // Test 17: Notifications Broadcast API
    // ----------------------------------------------------
    console.log('\n--- Test 17: Notifications Broadcast API ---');
    const notifsRes = await getNotifications();
    assert(notifsRes.status === 200, 'GET /api/admin/notifications returned 200');

    const postNotifReq = new NextRequest('http://localhost:3000/api/admin/notifications', {
      method: 'POST',
      body: JSON.stringify({
        title: 'M4 Live Class Alert',
        body: 'Webinar begins in 30 minutes. Tap to join.',
        actionUrl: '/live',
      }),
    });
    const postNotifRes = await postNotification(postNotifReq);
    assert(postNotifRes.status === 201, 'POST /api/admin/notifications created push broadcast');
    const createdNotifId = (await postNotifRes.json()).data.id;

    const delNotifReq = new NextRequest(`http://localhost:3000/api/admin/notifications?id=${createdNotifId}`);
    const delNotifRes = await deleteNotification(delNotifReq);
    assert(delNotifRes.status === 200, 'DELETE /api/admin/notifications removed notification');

    // ----------------------------------------------------
    // Test 18: Announcements Notice Board API
    // ----------------------------------------------------
    console.log('\n--- Test 18: Announcements Notice Board API ---');
    const annRes = await getAnnouncements();
    assert(annRes.status === 200, 'GET /api/admin/announcements returned 200');

    const postAnnReq = new NextRequest('http://localhost:3000/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title: 'M4 Test Notice Bulletin',
        content: 'Official exam dates have been notified by the testing agency.',
        targetAudience: 'all',
        isPublished: true,
      }),
    });
    const postAnnRes = await postAnnouncement(postAnnReq);
    assert(postAnnRes.status === 201, 'POST /api/admin/announcements created notice');
    const createdAnnId = (await postAnnRes.json()).data.id;

    const patchAnnReq = new NextRequest('http://localhost:3000/api/admin/announcements', {
      method: 'PATCH',
      body: JSON.stringify({ id: createdAnnId, isPublished: false }),
    });
    const patchAnnRes = await patchAnnouncement(patchAnnReq);
    assert(patchAnnRes.status === 200, 'PATCH /api/admin/announcements toggled published state');

    const delAnnReq = new NextRequest(`http://localhost:3000/api/admin/announcements?id=${createdAnnId}`);
    const delAnnRes = await deleteAnnouncement(delAnnReq);
    assert(delAnnRes.status === 200, 'DELETE /api/admin/announcements removed notice');

    // ----------------------------------------------------
    // Test 19: Settings & Branding API
    // ----------------------------------------------------
    console.log('\n--- Test 19: Settings & Branding API ---');
    const settingsRes = await getSettings();
    assert(settingsRes.status === 200, 'GET /api/admin/settings returned 200');
    const settingsJson = await settingsRes.json();
    assert(typeof settingsJson.data === 'object', 'Settings returned key-value map');

    const setupRes = await getSetup();
    assert(setupRes.status === 200, 'GET /api/admin/setup returned 200');
    const setupJson = await setupRes.json();
    assert(setupJson.data.brand_color === '#09214b', 'Brand color token matches #09214b');
    assert(setupJson.data.brand_accent === '#e0a028', 'Brand accent token matches #e0a028');

    // ----------------------------------------------------
    // Test 20: Staff RBAC & Billing API
    // ----------------------------------------------------
    console.log('\n--- Test 20: Staff RBAC & Billing API ---');
    const staffRes = await getStaff();
    assert(staffRes.status === 200, 'GET /api/admin/staff returned 200');
    const staffJson = await staffRes.json();
    assert(staffJson.data.some((s: any) => s.role === 'owner'), 'Owner account exists in staff roster');

    const billingRes = await getBilling();
    assert(billingRes.status === 200, 'GET /api/admin/billing returned 200');
    const billingJson = await billingRes.json();
    assert(billingJson.data.plan.name.includes('Enterprise'), 'Billing plan is Enterprise tier');
    assert(typeof billingJson.data.metrics.totalRevenue === 'number', 'Total revenue metric computed');

    console.log('\n====================================================');
    console.log(`🎉 ALL MILESTONE 4 TESTS PASSED! (${passedTests} passed, ${failedTests} failed)`);
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ Milestone 4 Verification Suite Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMilestone4Verification();
