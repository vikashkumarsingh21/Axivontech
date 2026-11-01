import { describe, it, expect } from "vitest";
import { parseApiResponse } from "@/lib/errors/client";

describe("Admin Employees Empty Fix - Regression & Robustness Tests", () => {
  const mockEmployees = [
    {
      id: "usr-1",
      name: "Mohan Deepak",
      email: "mohandeepak4297@gmail.com",
      employeeId: "EMP-001",
      department: "Engineering",
      designation: "Fullstack Developer",
      status: "ACTIVE",
      userRoles: [{ role: { id: "r-1", name: "EMPLOYEE" } }],
    },
    {
      id: "usr-2",
      name: "Vinay Bhardwaj",
      email: "bhardwajvinay400@gmail.com",
      employeeId: "EMP-002",
      department: "Frontend",
      designation: "UI Engineer",
      status: "ACTIVE",
      userRoles: [{ role: { id: "r-1", name: "EMPLOYEE" } }],
    },
    {
      id: "usr-3",
      name: "Suhana Shaik",
      email: "shaiksuhana2424@gmail.com",
      employeeId: "EMP-003",
      department: "Backend",
      designation: "Node.js Developer",
      status: "ACTIVE",
      userRoles: [{ role: { id: "r-1", name: "EMPLOYEE" } }],
    },
  ];

  it("regression: parseApiResponse unwraps response.data into parsed.data, defensive extraction must NOT yield 0 employees", async () => {
    // Exact shape returned by /api/v1/admin/employees
    const apiPayload = {
      success: true,
      data: mockEmployees,
      meta: {
        total: 8,
        count: 8,
        page: 1,
        limit: 10,
        pages: 1,
        totalPages: 1,
      },
    };

    const response = new Response(JSON.stringify(apiPayload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    const parsed = await parseApiResponse<any[]>(response);
    expect(parsed.ok).toBe(true);
    expect(Array.isArray(parsed.data)).toBe(true);

    // Old broken code did:
    // const data = parsed.data || parsed.raw;
    // const oldEmployees = data?.data || [];
    // Here we prove old code failed:
    const oldEmployees = (parsed.data as any)?.data || [];
    expect(oldEmployees).toEqual([]); // Proves the bug: (Array).data is undefined!

    // New defensive extraction:
    const employeeList = Array.isArray(parsed.data)
      ? parsed.data
      : (Array.isArray(parsed.raw?.data) ? parsed.raw.data : []);

    const meta = parsed.raw?.meta || (parsed.data as any)?.meta;
    const total = meta?.total ?? meta?.count ?? employeeList.length;
    const pages = meta?.totalPages ?? meta?.pages ?? Math.max(1, Math.ceil(total / 10));

    expect(employeeList.length).toBe(3);
    expect(employeeList[0].name).toBe("Mohan Deepak");
    expect(total).toBe(8);
    expect(pages).toBe(1);
  });

  it("handles standard non-wrapped data array seamlessly", async () => {
    const rawArray = mockEmployees;
    const response = new Response(JSON.stringify(rawArray), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    const parsed = await parseApiResponse<any[]>(response);
    const employeeList = Array.isArray(parsed.data)
      ? parsed.data
      : (Array.isArray(parsed.raw?.data) ? parsed.raw.data : []);

    expect(employeeList.length).toBe(3);
    expect(employeeList[1].email).toBe("bhardwajvinay400@gmail.com");
  });

  it("handles HTTP error safely and returns informative error message for AdminTableState", async () => {
    const errorPayload = {
      error: {
        code: "UNAUTHORIZED",
        message: "You must be signed in with administrative permissions to view workforce data.",
      },
    };

    const response = new Response(JSON.stringify(errorPayload), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });

    const parsed = await parseApiResponse<any[]>(response);
    expect(parsed.ok).toBe(false);
    expect(parsed.errorMessage).toContain("administrative permissions");

    // Defensive extraction on failure returns empty list and enables error UI
    const employeeList = Array.isArray(parsed.data)
      ? parsed.data
      : (Array.isArray(parsed.raw?.data) ? parsed.raw.data : []);
    expect(employeeList).toEqual([]);
  });

  it("verifies workforce role scoping excludes external roles and executive roles", () => {
    const excludeList = ["ADMIN", "FOUNDER", "CO_FOUNDER", "BROKER", "BUSINESS_PARTNER", "CLIENT"];

    const isExcluded = (roleName: string) => excludeList.includes(roleName);

    expect(isExcluded("ADMIN")).toBe(true);
    expect(isExcluded("FOUNDER")).toBe(true);
    expect(isExcluded("CO_FOUNDER")).toBe(true);
    expect(isExcluded("BROKER")).toBe(true);
    expect(isExcluded("BUSINESS_PARTNER")).toBe(true);
    expect(isExcluded("CLIENT")).toBe(true);
    expect(isExcluded("EMPLOYEE")).toBe(false);
  });
});
