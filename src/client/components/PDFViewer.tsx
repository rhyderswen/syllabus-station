import { useAuth } from "@/contexts/AuthContext";
import { authFetch, queryClient } from "@/util/api";
import { addToasts } from "@/util/feedback";
import { Box, Group, Loader, Modal, Text, Toolbar } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import {
  ArrowSquareOutIcon,
  GavelIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { SyllabusData } from "~/types";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface PageSize {
  width: number;
  height: number;
}

interface PageSlotProps {
  pageNumber: number;
  scale: number;
  size: PageSize;
  root: HTMLDivElement | null;
  onFirstPageLoad: (size: PageSize) => void;
}

// only load the page when it's close to view
function PageSlot({ pageNumber, scale, size, root, onFirstPageLoad }: PageSlotProps) {
  const { ref, entry } = useIntersection({ root, rootMargin: "250% 0px" });

  return (
    <Box
      ref={ref}
      data-page={pageNumber}
      mb="sm"
      mx="auto"
      style={{ width: size.width * scale, minHeight: size.height * scale }}
    >
      {entry?.isIntersecting && (
        <Page
          pageNumber={pageNumber}
          onLoadSuccess={
            pageNumber === 1
              ? (p) => onFirstPageLoad({ width: p.originalWidth, height: p.originalHeight })
              : undefined
          }
        />
      )}
    </Box>
  );
}

const loadingFallback = (
  <Group miw="40vw" h="40vh" justify="center" gap="xs">
    Loading Document... <Loader color="var(--cwrublue)" size="sm" />
  </Group>
);

interface PDFViewerProps {
  opened: boolean;
  close: () => void;
  syllabus?: SyllabusData;
}

const PDFViewer = ({ opened, close, syllabus }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pageSize, setPageSize] = useState<PageSize>({ width: 612, height: 792 }); // US Letter until page 1 reports
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuth();

  function deleteSyllabus() {
    if (!syllabus?.id) return;
    if (window.confirm("Are you sure you want to delete this syllabus?")) {
      addToasts(deleteSyllabusMutation.mutateAsync(syllabus.id));
    }
  }

  const deleteSyllabusMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const res = await authFetch(`/syllabus/delete?fileId=${fileId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete syllabus");
      }

      return res;
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["course"],
      });
      close();
    },
  });

  function banUser() {
    if (!syllabus?.uploader) return;
    if (window.confirm("Are you sure you want to ban this user?")) {
      addToasts(banUserMutation.mutateAsync(syllabus.uploader));
    }
  }

  const banUserMutation = useMutation({
    mutationFn: async (bannedUser: string) => {
      const res = await authFetch(`/user/ban?bannedUser=${bannedUser}`, { method: "PATCH" });

      if (!res.ok) {
        throw new Error("Failed to ban user");
      }

      return res;
    },
  });

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !numPages) return;

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentPage(Number((entry.target as HTMLElement).dataset.page));
          }
        }),
      { root, rootMargin: "-50% 0px -50% 0px" },
    );

    root.querySelectorAll("[data-page]").forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [numPages]);

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={syllabus?.filename ?? "Syllabus"}
      size="auto"
      centered
      overlayProps={{
        color: "#000",
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: { backgroundColor: "var(--cwrugray)" },
        header: { backgroundColor: "var(--cwrugray)" },
      }}
    >
      <Box pos="relative">
        {syllabus && numPages > 0 && (
          <Toolbar
            w="fit-content"
            size="lg"
            pos="absolute"
            bottom={10}
            left="50%"
            style={{
              transform: "translateX(-50%)",
              zIndex: 10,
              whiteSpace: "nowrap",
              flexWrap: "nowrap",
            }}
          >
            <Text size="sm" ml={6}>
              {currentPage} / {numPages}
            </Text>

            <Toolbar.Divider />

            <Toolbar.ToggleGroup type="single" value={null}>
              <Toolbar.ToggleItem
                value="zoomOut"
                onClick={() => setScale((prev) => Math.max(0.5, prev - 0.5))}
                className="toolbar-button"
                disabled={scale <= 0.5}
              >
                <MagnifyingGlassMinusIcon size={18} weight="bold" />
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem
                value="zoomIn"
                onClick={() => setScale((prev) => Math.min(2.5, prev + 0.5))}
                className="toolbar-button"
                disabled={scale >= 2.5}
              >
                <MagnifyingGlassPlusIcon size={18} weight="bold" />
              </Toolbar.ToggleItem>
            </Toolbar.ToggleGroup>

            <Toolbar.Divider />

            <Toolbar.Toggle
              component="a"
              href={syllabus.pdfLink}
              target="_blank"
              className="toolbar-button"
            >
              <ArrowSquareOutIcon size={18} weight="bold" />
            </Toolbar.Toggle>

            {isAdmin && (
              <>
                <Toolbar.Divider />

                <Toolbar.ToggleGroup type="single" value={null}>
                  <Toolbar.ToggleItem
                    value="delete"
                    title="Delete PDF"
                    onClick={deleteSyllabus}
                    className="toolbar-button danger-button"
                    disabled={scale <= 0.5}
                  >
                    <TrashIcon size={18} weight="bold" />
                  </Toolbar.ToggleItem>
                  <Toolbar.ToggleItem
                    value="ban"
                    title="Ban User"
                    onClick={banUser}
                    className="toolbar-button danger-button"
                    disabled={scale >= 2.5}
                  >
                    <GavelIcon size={18} weight="bold" />
                  </Toolbar.ToggleItem>
                </Toolbar.ToggleGroup>

                <Text size="sm" mr={6}>
                  {syllabus.uploader ?? "Uknown"}
                </Text>
              </>
            )}
          </Toolbar>
        )}
        <Box
          ref={scrollRef}
          style={{
            overflow: "auto",
            maxHeight: "80vh",
            borderRadius: "0.5rem",
            scrollbarGutter: "stable",
          }}
        >
          {syllabus ? (
            <ErrorBoundary fallback={<p>Failed to load PDF.</p>}>
              <Document
                file={syllabus.pdfLink}
                suspense={false}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={loadingFallback}
                error={<p>Failed to load PDF.</p>}
                scale={scale}
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <PageSlot
                    key={i + 1}
                    pageNumber={i + 1}
                    scale={scale}
                    size={pageSize}
                    root={scrollRef.current}
                    onFirstPageLoad={setPageSize}
                  />
                ))}
              </Document>
            </ErrorBoundary>
          ) : (
            <Text>No syllabus selected.</Text>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default PDFViewer;
