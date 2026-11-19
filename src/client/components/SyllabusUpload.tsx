import { authFetch, queryClient } from "@/util/api";
import { Box, Button, Group, Paper, Select, Text } from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconFile, IconUpload, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import FormSearchBar, { SearchOption } from "./FormSearchBar";
import { Course } from "~/types";
import {
  formatCourseCode,
  capitalizeFirstLetter,
  formatInstructorName,
} from "../util/textFormatting";
import { catalogCodeRegex } from "~/types";

interface SyllabusUploadProps {
  onClose: () => void;
}

function parseCourseTitle(value: string) {
  const match = value.trim().match(/^([A-Za-z]{4}\s?\d{1,4}[A-Za-z]?)\s*:?\s+(.+)$/);

  if (!match || !catalogCodeRegex.test(match[1])) {
    return null;
  }

  return {
    catalogCode: formatCourseCode(match[1]),
    title: match[2].trim(),
  };
}

export async function searchCourses(query: string, signal: AbortSignal): Promise<SearchOption[]> {
  const response = await fetch(`/course/search?query=${encodeURIComponent(query)}`, { signal });

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  const data: { courses: Course[] } = await response.json();

  return data.courses.map((course) => {
    const courseTitle = `${formatCourseCode(course.catalogCode)}: ${course.title}`;

    return {
      value: courseTitle,
      label: courseTitle,
      catalogCode: course.catalogCode,
      courseID: course.id,
      title: course.title,
    };
  });
}

interface InstructorResponse {
  instructors: {
    professor: string;
  }[];
}

export async function searchInstructors(
  catalogCode: string,
  query: string,
  signal: AbortSignal,
): Promise<SearchOption[]> {
  const response = await fetch(
    `/course/listInstructors?catalogCode=${encodeURIComponent(catalogCode)}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch instructors");
  }

  const data: InstructorResponse = await response.json();

  return data.instructors
    .map(({ professor }) => ({
      value: professor,
      label: professor,
    }))
    .filter((instructor) => instructor.label.toLowerCase().includes(query.toLowerCase()));
}

const SyllabusUpload = ({ onClose }: SyllabusUploadProps) => {
  const currentSemester = dayjs().month() < 5 ? "Spring" : dayjs().month() < 7 ? "Summer" : "Fall";

  const form = useForm({
    mode: "controlled",
    initialValues: {
      courseID: "",
      instructor: "",
      sem: currentSemester,
      year: dayjs().startOf("year").format("YYYY-MM-DD"),
      file: null as File | null,
    },

    validate: {
      courseID: (value) => {
        if (!value.trim()) {
          return "Enter a course title";
        }

        if (value.length > 150) {
          return "Course title cannot exceed 150 characters";
        }

        if (!parseCourseTitle(value)) {
          return 'Enter a valid course title (ex: "CSDS 395: Senior Project in Computer Science")';
        }

        return null;
      },
      instructor: (value) => {
        if (!value.trim()) {
          return "Enter an instructor";
        }

        if (value.length > 60) {
          return "Instructor name cannot exceed 60 characters";
        }

        return null;
      },
      sem: (value) => (value ? null : "Select a semester"),
      file: (value) => (value ? null : "Upload a syllabus"),
    },
  });

  const [selectedCourse, setSelectedCourse] = useState<{
    id: string;
    catalogCode: string;
    title: string;
  } | null>(null);

  const courseSearch = useCallback(
    (query: string, signal: AbortSignal) => searchCourses(query, signal),
    [],
  );

  const instructorSearch = useCallback(
    (query: string, signal: AbortSignal) => {
      if (!selectedCourse) {
        return Promise.resolve([]);
      }

      return searchInstructors(selectedCourse.catalogCode, query, signal);
    },
    [selectedCourse],
  );

  const submitSyllabusMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await authFetch("/syllabus/upload", { method: "POST", body: data });

      if (!res.ok) {
        throw new Error("Failed to upload syllabus");
      }

      return res.json();
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["course"],
      });
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.file) {
      return;
    }

    let courseID: string;
    let catalogCode: string;
    let title: string;

    if (selectedCourse) {
      // If the course already exists and was selected through the dropdown
      courseID = selectedCourse.id;
      catalogCode = selectedCourse.catalogCode;
      title = selectedCourse.title;
    } else {
      // If the course doesn't exist and needs to be created, everything needs to be formatted appropriately
      const parsedCourse = parseCourseTitle(values.courseID);

      if (!parsedCourse) {
        form.setFieldError("courseID", "Enter a valid course title");
        return;
      }

      try {
        const courseResponse = await authFetch(
          `/course/catalogCode?courseID=${encodeURIComponent(parsedCourse.catalogCode)}`,
          {
            method: "GET",
          },
        );

        if (!courseResponse.ok) {
          throw new Error("Failed to check for duplicate courses");
        }

        const courseData: { courses: Course[] } = await courseResponse.json();

        if (courseData.courses.length > 0) {
          form.setFieldError(
            "courseID",
            "A course with this course ID already exists. Either select it from the search results or correct this value.",
          );
          return;
        }
      } catch (error) {
        console.error(error);

        form.setFieldError("courseID", "Unable to verify course existence. Please try again.");
        return;
      }

      courseID = "NewCourse";
      catalogCode = parsedCourse.catalogCode;
      title = capitalizeFirstLetter(parsedCourse.title);
    }

    const year = dayjs(values.year).format("YYYY");
    const semester = `${values.sem} ${year}`;

    const data = new FormData();

    data.append("file", values.file);
    data.append("professor", formatInstructorName(values.instructor));
    data.append("semester", semester);
    data.append("courseID", courseID);
    data.append("catalogCode", catalogCode);
    data.append("title", title);

    const uploadData = data;

    console.log("Syllabus upload preview:", uploadData);

    await submitSyllabusMutation.mutateAsync(data, {
      onSuccess: () => {
        onClose();
        form.reset();
        setSelectedCourse(null);
      },
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10 MB
    multiple: false,

    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        form.setFieldValue("file", acceptedFiles[0]);
        form.clearFieldError("file");
      }
    },

    onDropRejected: (rejections) => {
      const rejection = rejections[0]?.errors[0];

      if (rejection?.code === "file-too-large") {
        form.setFieldError("file", "The file must be 10 MB or smaller.");
      } else if (rejection?.code === "file-invalid-type") {
        form.setFieldError("file", "Please upload a PDF file.");
      } else {
        form.setFieldError("file", "Please select a valid file.");
      }
    },
  });

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <FormSearchBar
        label="Course Title"
        placeholder="Enter a Course"
        required
        value={form.values.courseID}
        onChange={(value) => {
          if (selectedCourse && value !== form.values.courseID) {
            form.setFieldValue("instructor", "");
          }

          form.setFieldValue("courseID", value);
          setSelectedCourse(null);
        }}
        onSelect={(option) => {
          if (option.courseID && option.catalogCode && option.title) {
            setSelectedCourse({
              id: option.courseID,
              catalogCode: option.catalogCode,
              title: option.title,
            });
          }
        }}
        search={courseSearch}
        error={form.errors.courseID}
        maxLength={150}
      />

      <FormSearchBar
        label="Instructor Name"
        placeholder="Enter an Instructor's Name"
        required
        value={form.values.instructor}
        onChange={(value) => {
          form.setFieldValue("instructor", value);
        }}
        search={instructorSearch}
        searchEnabled={selectedCourse !== null}
        error={form.errors.instructor}
        maxLength={60}
      />

      <Group grow align="flex-start">
        <Select
          label="Semester"
          placeholder="Select a Semester"
          data={["Spring", "Summer", "Fall"]}
          searchable
          required
          {...form.getInputProps("sem")}
        />

        <YearPickerInput
          label="Year"
          placeholder="Select a Year"
          required
          presets={[
            {
              value: dayjs().subtract(1, "year").startOf("year").format("YYYY-MM-DD"),
              label: "Last year",
            },
            {
              value: dayjs().startOf("year").format("YYYY-MM-DD"),
              label: "This year",
            },
            {
              value: dayjs().add(1, "year").startOf("year").format("YYYY-MM-DD"),
              label: "Next year",
            },
          ]}
          minDate={new Date(1826, 1)}
          maxDate={dayjs().add(1, "year").startOf("year").format("YYYY-MM-DD")}
          {...form.getInputProps("year")}
          styles={{
            input: {
              fontWeight: 400,
            },
          }}
        />
      </Group>

      <Box mt="md">
        <Text size="sm" fw={500} mb={6}>
          Syllabus File{" "}
          <Text span c="red">
            *
          </Text>
        </Text>

        {form.values.file ? (
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <IconFile size={24} />

                <Box>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {form.values.file.name}
                  </Text>

                  <Text size="xs" c="dimmed">
                    {(form.values.file.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </Box>
              </Group>

              <Button
                variant="subtle"
                color="red"
                size="xs"
                aria-label="Remove selected file"
                onClick={() => {
                  form.setFieldValue("file", null);
                  form.clearFieldError("file");
                }}
              >
                <IconX size={16} />
              </Button>
            </Group>
          </Paper>
        ) : (
          <Paper
            {...getRootProps()}
            withBorder
            p="xl"
            radius="md"
            ta="center"
            className="syllabus-dropzone"
            bg={isDragActive ? "var(--mantine-color-blue-light)" : undefined}
          >
            <input {...getInputProps()} />

            <IconUpload size={50} stroke={2} style={{ marginBottom: 8 }} />

            <Text size="sm" fw={500}>
              {isDragActive
                ? "Drop your syllabus here"
                : "Drag and drop your syllabus here, or click to browse"}
            </Text>

            <Text size="xs" c="dimmed" mt={6}>
              PDF files only, up to 10 MB
            </Text>
          </Paper>
        )}

        {form.errors.file && (
          <Text c="red" size="xs" mt={5}>
            {form.errors.file}
          </Text>
        )}
      </Box>

      <Group justify="flex-end" mt="md" fz={14}>
        <Button type="submit" loading={submitSyllabusMutation.isPending}>
          Submit
        </Button>
      </Group>
    </Box>
  );
};

export default SyllabusUpload;
