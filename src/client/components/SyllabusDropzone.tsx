import { Box, Button, Group, Paper, Text } from '@mantine/core';
import { IconFile, IconUpload, IconX } from '@tabler/icons-react';
import { useDropzone } from 'react-dropzone';

interface SyllabusDropzoneProps {
  file: File | null;
  error: React.ReactNode;
  setFile: (file: File | null) => void;
  clearError: () => void;
  setError: (error: string) => void;
}

const SyllabusDropzone = ({ file, error, setFile, clearError, setError }: SyllabusDropzoneProps) => {
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
        setFile(acceptedFiles[0]);
        clearError();
      }
    },

    onDropRejected: (rejections) => {
      const rejection = rejections[0]?.errors[0];

      if (rejection?.code === 'file-too-large') {
        setError('The file must be 10 MB or smaller.');
      } else if (rejection?.code === 'file-invalid-type') {
        setError('Please upload a PDF file.');
      } else {
        setError('Please select a valid file.');
      }
    },
  });

  return (
    <Box mt="md">
      <Text size="sm" fw={500} mb={6}>
        Syllabus File <Text span c="red">*</Text>
      </Text>

      {file ? (
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <IconFile size={24} />

              <Box>
                <Text size="sm" fw={500} lineClamp={1}>
                  {file.name}
                </Text>

                <Text size="xs" c="dimmed">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </Box>
            </Group>

            <Button
              variant="subtle"
              color="red"
              size="xs"
              aria-label="Remove selected file"
              onClick={() => {
                setFile(null);
                clearError();
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
          bg={
            isDragActive 
              ? 'var(--mantine-color-blue-light)'
              : undefined
          }
        >
          <input {...getInputProps()} />

          <IconUpload size={50} stroke={2} style={{ marginBottom: 8 }}/>

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

      {error && (
        <Text c="red" size="xs" mt={5}>
          {error}
        </Text>
      )}
    </Box>
  );
};

export default SyllabusDropzone;