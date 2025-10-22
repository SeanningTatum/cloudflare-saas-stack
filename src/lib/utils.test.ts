import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sanitizeFilename, generateFileKey } from "./utils";

describe("sanitizeFilename", () => {
  it("should keep alphanumeric characters, dots, and hyphens", () => {
    expect(sanitizeFilename("valid-file.123.txt")).toBe("valid-file.123.txt");
  });

  it("should replace spaces with underscores", () => {
    expect(sanitizeFilename("my file.txt")).toBe("my_file.txt");
  });

  it("should replace special characters with underscores", () => {
    expect(sanitizeFilename("file@#$%name!.txt")).toBe("file____name_.txt");
  });

  it("should replace unicode characters with underscores", () => {
    expect(sanitizeFilename("файл.txt")).toBe("____.txt");
  });

  it("should handle multiple special characters", () => {
    expect(sanitizeFilename("my (file) [test].txt")).toBe(
      "my__file___test_.txt"
    );
  });

  it("should handle empty string", () => {
    expect(sanitizeFilename("")).toBe("");
  });

  it("should preserve file extensions", () => {
    expect(sanitizeFilename("document.pdf")).toBe("document.pdf");
    expect(sanitizeFilename("archive.tar.gz")).toBe("archive.tar.gz");
  });
});

describe("generateFileKey", () => {
  const mockDate = new Date("2024-01-15T12:00:00.000Z");
  const mockTimestamp = mockDate.getTime();
  const mockUUID = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    // Mock Date.now()
    vi.spyOn(Date, "now").mockReturnValue(mockTimestamp);

    // Mock crypto.randomUUID()
    vi.spyOn(crypto, "randomUUID").mockReturnValue(mockUUID);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should generate a file key with default path prefix", () => {
    const result = generateFileKey({
      filename: "test.txt",
      userId: "user123",
    });

    expect(result).toBe(
      `uploads/user123/${mockTimestamp}-${mockUUID}-test.txt`
    );
  });

  it("should generate a file key with custom path prefix", () => {
    const result = generateFileKey({
      filename: "test.txt",
      userId: "user123",
      pathPrefix: "custom-uploads",
    });

    expect(result).toBe(
      `custom-uploads/user123/${mockTimestamp}-${mockUUID}-test.txt`
    );
  });

  it("should sanitize the filename in the generated key", () => {
    const result = generateFileKey({
      filename: "my file (1).txt",
      userId: "user123",
    });

    expect(result).toBe(
      `uploads/user123/${mockTimestamp}-${mockUUID}-my_file__1_.txt`
    );
  });

  it("should handle complex filenames", () => {
    const result = generateFileKey({
      filename: "Report@2024#Final Version!.pdf",
      userId: "user456",
      pathPrefix: "documents",
    });

    expect(result).toBe(
      `documents/user456/${mockTimestamp}-${mockUUID}-Report_2024_Final_Version_.pdf`
    );
  });

  it("should handle filenames with multiple dots", () => {
    const result = generateFileKey({
      filename: "archive.tar.gz",
      userId: "user789",
    });

    expect(result).toBe(
      `uploads/user789/${mockTimestamp}-${mockUUID}-archive.tar.gz`
    );
  });

  it("should generate unique keys for the same filename", () => {
    // First call
    const result1 = generateFileKey({
      filename: "test.txt",
      userId: "user123",
    });

    // Change mock values for second call
    const newTimestamp = mockTimestamp + 1000;
    const newUUID = "660e8400-e29b-41d4-a716-446655440001";

    vi.spyOn(Date, "now").mockReturnValue(newTimestamp);
    vi.spyOn(crypto, "randomUUID").mockReturnValue(newUUID);

    const result2 = generateFileKey({
      filename: "test.txt",
      userId: "user123",
    });

    expect(result1).not.toBe(result2);
    expect(result1).toBe(
      `uploads/user123/${mockTimestamp}-${mockUUID}-test.txt`
    );
    expect(result2).toBe(`uploads/user123/${newTimestamp}-${newUUID}-test.txt`);
  });

  it("should handle different user IDs", () => {
    const result1 = generateFileKey({
      filename: "test.txt",
      userId: "user123",
    });

    const result2 = generateFileKey({
      filename: "test.txt",
      userId: "user456",
    });

    expect(result1).toContain("user123");
    expect(result2).toContain("user456");
    expect(result1).not.toBe(result2);
  });

  it("should handle empty path prefix", () => {
    const result = generateFileKey({
      filename: "test.txt",
      userId: "user123",
      pathPrefix: "",
    });

    expect(result).toBe(`/user123/${mockTimestamp}-${mockUUID}-test.txt`);
  });
});
