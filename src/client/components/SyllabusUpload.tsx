import { authFetch, queryClient } from "@/util/api";
import { Box, Button, Group, Paper, Select, Text, TextInput } from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconFile, IconUpload, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useDropzone } from "react-dropzone";

interface SyllabusUploadProps {
  onClose: () => void;
}

const SyllabusUpload = ({ onClose }: SyllabusUploadProps) => {
  const currentSemester = dayjs().month() < 5 ? "Spring" : dayjs().month() < 7 ? "Summer" : "Fall";

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      courseID: "",
      instructor: "",
      sem: currentSemester,
      year: dayjs().startOf("year").format("YYYY-MM-DD"),
      file: null as File | null,
    },

    validate: {
      courseID: (value) => (value ? null : "Select a course"),
      instructor: (value) => (value.trim() ? null : "Enter an instructor"),
      sem: (value) => (value ? null : "Select a semester"),
      file: (value) => (value ? null : "Upload a syllabus"),
    },
  });

  interface UploadSyllabusInput {
    file: File;
    instructor: string;
    semester: string;
    courseID: string;
  }

  const submitSyllabusMutation = useMutation({
    mutationFn: async (vals: UploadSyllabusInput) => {
      const data = new FormData();
      data.append("file", vals.file);
      data.append("professor", vals.instructor.trim());
      data.append("semester", vals.semester);
      data.append("courseID", vals.courseID);

      const res = await authFetch("/syllabus/upload", { method: "POST", body: data });
      return res.json();
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["course", variables.courseID],
      });
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.file) {
      return;
    }

    const year = dayjs(values.year).format("YYYY");
    const semester = `${values.sem} ${year}`;

    await submitSyllabusMutation.mutateAsync(
      {
        file: values.file,
        instructor: values.instructor,
        semester,
        courseID: values.courseID,
      },
      {
        onSuccess: () => {
          onClose();
          form.reset();
        },
      },
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10 MB, this can be changed if we think it's too small/big
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
      {
        // TODO: add "loading" prop to course title and instructor lookup during API calls
      }
      <Select
        label="Course Title"
        placeholder="Select a Course"
        data={[
          {
            value: "f0bd28a7-ffb9-4015-a62f-9523b723e1f5",
            label: "CSDS 132: Introduction to Java",
          },
          {
            value: "4c255eb2-f434-47f5-a59c-16e45c098a56",
            label: "CSDS 395: Senior Project in Computer Science",
          },
          {
            value: "fa4db26a-be1b-4738-93f0-79b119ae2f33",
            label: "MATH 121: Calculus for Science and Engineering I",
          },
        ]}
        searchable
        required
        openOnFocus={false}
        key={form.key("courseID")}
        {...form.getInputProps("courseID")}
      />

      {
        // Instructor input should use fuzzy search for already-known instructors but allow manual input
      }
      <TextInput
        label="Instructor Name"
        placeholder="Enter Instructor's Name"
        required
        key={form.key("instructor")}
        {...form.getInputProps("instructor")}
      />

      <Group grow align="flex-start">
        <Select
          label="Semester"
          placeholder="Select a Semester"
          data={["Spring", "Summer", "Fall"]}
          searchable
          required
          key={form.key("sem")}
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
          key={form.key("year")}
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
