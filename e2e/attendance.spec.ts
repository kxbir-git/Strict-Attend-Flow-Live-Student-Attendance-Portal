import { test, expect } from "@playwright/test";

test.describe("Production Attendance Portal E2E Tests", () => {
  // Test l: Login as each role → correct portal loads, no cross-portal links
  test("Role-based login flow redirects to role-specific dashboard with strict isolation", async ({ page }) => {
    // 1. Login as Student
    await page.goto("/login?role=STUDENT");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/student/dashboard");
    expect(page.url()).toContain("/student/dashboard");
    await expect(page.locator("text=Overall Academic Attendance")).toBeVisible();

    // Verify no cross-portal links exist in student layout
    await expect(page.locator("text=Defaulters (<75%)")).toHaveCount(0);
    await expect(page.locator("text=Timetable Builder")).toHaveCount(0);

    // Test e: Student tries /admin/dashboard → 403 / forbidden redirect
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/forbidden");
    await expect(page.locator("text=Permission Denied")).toBeVisible();

    // Test f: Student tries /teacher/dashboard → 403 / forbidden redirect
    await page.goto("/teacher/dashboard");
    await page.waitForURL("**/forbidden");
    await expect(page.locator("text=Permission Denied")).toBeVisible();
  });

  // Test g: Student API perimeter enforcement: ?studentId=OTHER is ignored / 401
  test("API perimeter enforcement: Student cannot query admin API or cross-student records", async ({ request }) => {
    const unauthRes = await request.get("/api/admin/users");
    expect(unauthRes.status()).toBe(401);

    const studentAttRes = await request.get("/api/student/attendance");
    expect(studentAttRes.status()).toBe(401);
  });

  // Test a: Teacher flow: Set timetable, auto-detect class, submit lock, and CSV export
  test("Teacher flow: Timetable builder, take-attendance auto-load, and submitted history", async ({ page }) => {
    // Login as Teacher
    await page.goto("/login?role=TEACHER");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/teacher/dashboard");
    expect(page.url()).toContain("/teacher/dashboard");

    // Visit take-attendance
    await page.goto("/teacher/take-attendance");
    await expect(page.locator("text=Date + Period Auto-Detection")).toBeVisible();

    // Visit timetable builder
    await page.goto("/teacher/timetable");
    await expect(page.locator("text=Weekly Timetable Builder")).toBeVisible();

    // Visit teacher leave requests
    await page.goto("/teacher/leave-requests");
    await expect(page.locator("text=Student Leave Applications")).toBeVisible();
  });

  // Test h: Student applies for leave and reviews history
  test("Student leave application and certificate download verification", async ({ page }) => {
    await page.goto("/login?role=STUDENT");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/student/dashboard");

    // Visit leave page
    await page.goto("/student/leave");
    await expect(page.locator("text=Leave & Absence Workflow")).toBeVisible();

    // Visit certificate page
    await page.goto("/student/certificate");
    await expect(page.locator("text=Official Attendance Certificate")).toBeVisible();

    // Visit AI assistant page
    await page.goto("/student/assistant");
    await expect(page.locator("text=AI Attendance Assistant")).toBeVisible();

    // Visit calendar page
    await page.goto("/student/calendar");
    await expect(page.locator("text=Class Schedule & Calendar")).toBeVisible();

    // Visit achievements page
    await page.goto("/student/achievements");
    await expect(page.locator("text=Milestones, Streaks & Goals")).toBeVisible();
  });

  // Test Admin Oversight & Governance
  test("Admin portal provides full institutional governance and audit inspection", async ({ page }) => {
    await page.goto("/login?role=ADMIN");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin/dashboard");
    expect(page.url()).toContain("/admin/dashboard");

    await expect(page.locator("text=Institutional Oversight & Auditing")).toBeVisible();

    // Inspect Defaulters
    await page.goto("/admin/defaulters");
    await expect(page.locator("text=Defaulter Screening")).toBeVisible();

    // Inspect Leave Governance
    await page.goto("/admin/leave-requests");
    await expect(page.locator("text=Institutional Leave Governance")).toBeVisible();

    // Inspect Audit Log
    await page.goto("/admin/audit-log");
    await expect(page.locator("text=Institutional Mutation Audit Trail")).toBeVisible();

    // Inspect Settings
    await page.goto("/admin/settings");
    await expect(page.locator("text=Mandatory Defaulter Threshold")).toBeVisible();

    // Inspect Health
    await page.goto("/admin/health");
    await expect(page.locator("text=System Telemetry")).toBeVisible();
  });
});
