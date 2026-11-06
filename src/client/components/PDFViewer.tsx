import { Box, Group, Loader, Text, Toolbar } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import {
  ArrowSquareOutIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@phosphor-icons/react";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

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
  url: string;
}

const PDFViewer = ({ url }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pageSize, setPageSize] = useState<PageSize>({ width: 612, height: 792 }); // US Letter until page 1 reports
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <Box pos="relative">
      {numPages > 0 && (
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

          <Toolbar.Toggle component="a" href={url} target="_blank" className="toolbar-button">
            <ArrowSquareOutIcon size={18} weight="bold" />
          </Toolbar.Toggle>
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
        <ErrorBoundary fallback={<p>Failed to load PDF.</p>}>
          <Document
            file={url}
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
      </Box>
    </Box>
  );
};

export default PDFViewer;
