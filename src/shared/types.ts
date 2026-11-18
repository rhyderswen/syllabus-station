export interface CourseData {
  name: string;
  code: string;
  semesters: SemesterData[];
}

export interface SemesterData {
  semester: string;
  syllabi: {
    filename: string;
    pdfLink: string;
    professor: string;
    uploadDate: string;
  }[];
}

// Information returned by search endpoint
export interface Course {
  id: string;
  title: string;
  catalogCode: string;
}

export const catalogCodeRegex = new RegExp("^[A-Za-z]{4}\\s?\\d{1,4}[A-Za-z]?$");
