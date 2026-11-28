export interface CourseData {
  id: string;
  name: string;
  code: string;
  semesters: SemesterData[];
}

export interface SemesterData {
  semester: string;
  syllabi: SyllabusData[];
}

export interface SyllabusData {
  id: string;
  filename: string;
  pdfLink: string;
  professor: string;
  uploadDate: string;
  uploader: string;
}

// Information returned by search endpoint
export interface Course {
  id: string;
  title: string;
  catalogCode: string;
}

export const catalogCodeRegex = new RegExp("^[A-Za-z]{4}\\s?\\d{1,4}[A-Za-z]?$");
