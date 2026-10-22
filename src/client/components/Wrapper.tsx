import SyllabusStationLogo from "@/assets/SyllabusStation-full.png"; // placeholder to figure out spacing
import { Autocomplete, Box, Button, Container, Group, Modal, Select, TextInput, List } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { YearPickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Link } from "react-router";
import dayjs from 'dayjs';
import SyllabusDropzone from "./SyllabusDropzone"

export interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  const currentSemester = dayjs().month() < 5 ? 'Spring' : (dayjs().month() < 7 ? 'Summer' : 'Fall');

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      courseID: '',
      instructor: '',
      sem: currentSemester,
      year: dayjs().startOf('year').format('YYYY-MM-DD'),
      file: null as File | null,
    },

    validate: {
      courseID: (value) => value ? null : 'Select a course',
      instructor: (value) => value.trim() ? null : 'Enter an instructor',
      sem: (value) => value ? null : 'Select a semester',
      file: (value) => value ? null : 'Upload a syllabus',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.file) {
      return;
    }
    
    // Debug, verify input matches these logs
    console.log('Form values:', values);
    console.log('File object:', values.file);

    const data = new FormData();

    const year = dayjs(values.year).format('YYYY');
    const semester = `${values.sem} ${year}`;

    data.append('file', values.file);
    data.append('professor', values.instructor.trim());
    data.append('semester', semester);
    data.append('courseID', values.courseID);

    try {
      const response = await fetch('/syllabus/upload', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to upload syllabus');
      }

      const result: { id: string } = await response.json();

      close();
      form.reset();
    } catch (error) {
      console.error('Error uploading syllabus:', error);
    } 
  };

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
            data={[
              { value: 'f0bd28a7-ffb9-4015-a62f-9523b723e1f5', label: "CSDS 132: Introduction to Java" },
              { value: '4c255eb2-f434-47f5-a59c-16e45c098a56', label: "CSDS 395: Senior Project in Computer Science" },
              { value: 'fa4db26a-be1b-4738-93f0-79b119ae2f33', label: "MATH 121: Calculus for Science and Engineering I"}
            ]}
            searchable
            required
            openOnFocus = { false }
            key = { form.key('courseID') }
            { ...form.getInputProps('courseID') }
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
              presets = {[
                { 
                  value: dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'), 
                  label: 'Last year' 
                },
                { 
                  value: dayjs().startOf('year').format('YYYY-MM-DD'), 
                  label: 'This year' 
                },
                { 
                  value: dayjs().add(1, 'year').startOf('year').format('YYYY-MM-DD'), 
                  label: 'Next year' 
                },
              ]} 
              minDate = { new Date(1826, 1) }
              maxDate = { dayjs().add(1, 'year').startOf('year').format('YYYY-MM-DD') }
              key = { form.key('year') }
              { ...form.getInputProps('year') }
              styles={{
                input: {
                  fontWeight: 400,
                },
              }}
            />
          </Group>

          <SyllabusDropzone
            file={form.values.file}
            error={form.errors.file}
            setFile={(file) => form.setFieldValue('file', file)}
            clearError={() => form.clearFieldError('file')}
            setError={(error) => form.setFieldError('file', error)}
          />

          <Group justify="flex-end" mt="md" fz={ 14 } >
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
                <img src={SyllabusStationLogo} alt="Syllabus Station Logo" height={60} />
              </Link>
            </div>
            <Autocomplete
              flex={1}
              miw={0}
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
            <Button fz={14} bg="var(--cwrutrueblue)" flex="0 0 auto" onClick = { open }>
              Upload Syllabus
            </Button>
          </Group>
        </Box>

        {children}

        <Box component="footer" data-breakout bg="var(--cwrugray)" p="md">
          <Group data-container justify="center" display="flex">
            <Box flex={1}>
              <List listStyleType="none">
                <List.Item>
                  <Link to="https://github.com/rhyderswen/syllabus-station" target="_blank">
                    Github
                  </Link>
                </List.Item>
                <List.Item>
                  <Link to="/" target="_blank">
                    Another Related link
                  </Link>
                </List.Item>
                <List.Item>
                  <Link to="/" target="_blank">
                    Log Out
                  </Link>
                </List.Item>
                {
                  // TODO: make it so Log Out only appears when logged in
                }
              </List>
            </Box>
            <Box flex={2}>
              <i>*Disclaimer</i>: Syllabi and class content are subject to change at the discretion of
              the instructor. Do not assume information from a syllabus linked here is 100% accurate
              to a course's content.
            </Box>
          </Group>
        </Box>
      </Container>
    </>
  );
};

export default Wrapper;
