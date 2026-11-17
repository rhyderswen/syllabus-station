export function formatCourseCode(courseCode: string): string {
  const match = courseCode.match(/^([A-Za-z]{4})\s?(\d{1,4}[A-Za-z]?)$/);

  if (!match) {
    return courseCode;
  }

  return `${match[1]} ${match[2]}`;
}
