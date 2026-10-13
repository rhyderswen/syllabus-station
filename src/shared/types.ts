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
