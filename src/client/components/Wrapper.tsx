import lineupLogo from "@/assets/lineup-full.png"; // placeholder to figure out spacing
import { Autocomplete, Box, Button, Container, Group, Modal, Select, TextInput, Paper, Text } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { YearPickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Link } from "react-router";
import dayjs from 'dayjs';
import { useDropzone } from "react-dropzone";
import { IconUpload, IconFile, IconX } from '@tabler/icons-react';

export interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      course: '',
      instructor: '',
      sem: '',
      year: dayjs().startOf('year').format('YYYY-MM-DD'),
      file: null as File | null,
    },

    validate: {
      course: (value) => value ? null : 'Select a course',
      instructor: (value) => value.trim() ? null : 'Enter an instructor',
      sem: (value) => value ? null : 'Select a semester',
      file: (value) => value ? null : 'Upload a syllabus',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.file) {
      return;
    }
    /*
    const data = new FormData();

    data.append('course', values.course);
    data.append('instructor', values.instructor);
    data.append('semester', values.sem);
    data.append('year', values.year);
    data.append('file', values.file);

    // TODO: rename syllabus file here?
    // TODO: API call here

    if (!response.ok) {
      throw new Error('Failed to upload syllabus');
    }
    */

    // Debug, verify input matches these logs
    console.log('Form values:', values);
    console.log('File object:', values.file);
    
    form.reset();
    close();
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10 MB, this can be changed if we think it's too small/big
    multiple: false,

    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        form.setFieldValue('file', acceptedFiles[0]);
        form.clearFieldError('file');
      }
    },

    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];

      if (error?.code === 'file-too-large') {
        form.setFieldError('file', 'The file must be 10 MB or smaller.');
      } else if (error?.code === 'file-invalid-type') {
        form.setFieldError('file', 'Please upload a PDF file.');
      } else {
        form.setFieldError('file', 'Please select a valid file.');
      }
    },
  });

  return (
    <>
      <Modal 
        opened={ opened } 
        onClose={ close } 
        withCloseButton={ true } 
        title="Upload Syllabus" 
        centered      
        size="60vw"
      >
        <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
          { 
            // TODO: add "loading" prop to course title and instructor lookup during API calls
          }
          <Select
            label = "Course Title"
            placeholder = "Select a Course"
            data = {[
              "CSDS 132: Introduction to Java",
              "CSDS 233: Data Structures",
              "CSDS 393: Software Engineering",
              "CSDS 395: Senior Project in Computer Science",
            ]}
            searchable
            required
            openOnFocus = { false }
            key = { form.key('course') }
            { ...form.getInputProps('course') }
          />

          {
            // Instructor input should use fuzzy search for already-known instructors but allow manual input
          }
          <TextInput 
            label = "Instructor Name"
            placeholder = "Enter Instructor's Name"
            required
            key = { form.key('instructor') }
            { ...form.getInputProps('instructor') }
          />

          <Group grow align="flex-start">
            <Select
              label = "Semester"
              placeholder = "Select a Semester"
              data = {[
                "Spring",
                "Summer",
                "Fall",
              ]}
              searchable
              required
              key = { form.key('sem') }
              { ...form.getInputProps('sem') }
            />
          
            <YearPickerInput 
              label = "Year"
              placeholder = "Select a Year"
              required
              defaultValue = { dayjs().startOf('year').format('YYYY-MM-DD') }
              presets = {[
                { 
                  value: dayjs().startOf('year').format('YYYY-MM-DD'), 
                  label: 'This year' 
                },
                { 
                  value: dayjs().add(1, 'year').startOf('year').format('YYYY-MM-DD'), 
                  label: 'Next year' 
                },
                { 
                  value: dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'), 
                  label: 'Last year' 
                },
              ]} 
              minDate = { new Date(1826, 1) }
              maxDate = { dayjs().add(1, 'year').startOf('year').format('YYYY-MM-DD') }
              key = { form.key('year') }
              { ...form.getInputProps('year') }
            />
          </Group>

          <Box mt="md">
            <Text size="sm" fw={500} mb={6}>
              Syllabus File <Text span c="red">*</Text>
            </Text>

            {form.values.file ? (
              <Paper
                withBorder
                p="md"
                radius="md"
              >
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
                      form.setFieldValue('file', null);
                      form.clearFieldError('file');
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
                style={{
                  borderStyle: 'dashed',
                  cursor: 'pointer',
                  backgroundColor: isDragActive
                    ? 'var(--mantine-color-blue-light)'
                    : undefined,
                }}
              >
                <input {...getInputProps()} />

                <IconUpload
                  size={50}
                  stroke={2}
                  style={{ marginBottom: 8 }}
                />

                <Text size="sm" fw={500}>
                  {isDragActive
                    ? 'Drop your syllabus here'
                    : 'Drag and drop your syllabus here, or click to browse'}
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

          <Group justify="flex-end" mt="md" style={{ fontSize: 14, background: "var(--cwrutrueblue)" }}>
            <Button type="submit">Submit</Button>
          </Group>
        </Box>
      </Modal>

      <Container
        strategy="grid"
        size={850}
        mih="100dvh"
        style={{ gridTemplateRows: "auto minmax(300px, 1fr) auto" }}
      >
        <Box component="header" data-breakout bg="var(--cwrublue)" p="md">
          <Group data-container c="white" justify="center" display="flex">
            <div className="lineUpLogo" style={{ flexShrink: 0 }}>
              <Link to="/">
                <img src={lineupLogo} alt="LineUp Logo" height={50} />
              </Link>
            </div>
            <Autocomplete
              style={{ flex: 1, minWidth: 0 }}
              placeholder="Search for a course..."
              data={[
                "CSDS 132: Introduction to Java",
                "CSDS 233: Data Structures",
                "CSDS 393: Software Engineering",
                "CSDS 395: Senior Project in Computer Science",
              ]}
              //rightSection={loading ? <Loader size={16} /> : null} // This will be used later for a loading circle to appear on the right edge of the search bar while searching
              // TODO: make it so search bar and upload button are only available when logged in
            />
            <Button style={{ flexShrink: 0, fontSize: 14, background: "var(--cwrutrueblue)" }} onClick = { open }>
              Upload Syllabus
            </Button>
          </Group>
        </Box>

        {children}

        <Box component="footer" data-breakout bg="var(--cwrugray)" p="md">
          <Group data-container justify="center" display="flex">
            <div style={{ flex: 1 }}>
              <ul style={{ listStyleType: "none" }}>
                <li>
                  <a href="https://github.com/rhyderswen/syllabus-station" target="_blank">
                    Github
                  </a>
                </li>
                <li>
                  <a href="/" target="_blank">
                    Another Related link
                  </a>
                </li>
                <li>
                  <a href="/" target="_blank">
                    Log Out
                  </a>
                </li>
                {
                  // TODO: make it so Log Out only appears when logged in
                }
              </ul>
            </div>
            <div style={{ flex: 2 }}>
              <i>*Disclaimer</i>: Syllabi and class content are subject to change at the discretion of
              the instructor. Do not assume information from a syllabus linked here is 100% accurate
              to a course's content.
            </div>
          </Group>
        </Box>
      </Container>
    </>
  );
};

export default Wrapper;
