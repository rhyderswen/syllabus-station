export function formatCourseCode(courseCode: string): string {
  const match = courseCode.match(/^([A-Za-z]{4})\s?(\d{1,4}[A-Za-z]?)$/);

  if (!match) {
    return courseCode;
  }

  return `${match[1].toUpperCase()} ${match[2]}`;
}

export function capitalizeFirstLetter(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.charAt(0).toLocaleUpperCase() + trimmed.slice(1);
}

export function formatInstructorName(name: string): string {
  return name
    .trim()
    .toLocaleLowerCase()
    .replace(
      /(^|[\s'-])(\p{L})/gu,
      (_, separator, letter) => separator + letter.toLocaleUpperCase(),
    );
}
