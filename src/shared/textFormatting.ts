export function formatCourseCode(courseCode: string): string {
  const match = courseCode.match(/^([A-Za-z]{4})\s?(\d{1,4}[A-Za-z]?)$/);

  if (!match) {
    return courseCode;
  }

  return `${match[1].toUpperCase()} ${match[2]}`;
}

export function formatName(name: string): string {
  return name
    .trim()
    .toLocaleLowerCase()
    .replace(
      /(^|[\s'-])(\p{L})/gu,
      (_, separator, letter) => separator + letter.toLocaleUpperCase(),
    );
}

export function formatCourseCodeForURL(courseCode: string): string {
  return courseCode.trim().replace(/\s+/g, "_");
}

export function parseCourseCodeFromURL(courseCode: string): string {
  return courseCode.replace(/_/g, " ");
}
