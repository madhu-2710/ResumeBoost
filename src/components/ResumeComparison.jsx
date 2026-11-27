import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function ResumeComparison({
  file,
  annotations = [],
}) {
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(720);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth - 24;
        setPageWidth(Math.min(availableWidth, 760));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (!file) return null;

  const cardStyle = {
    padding: "22px",
    borderRadius: "14px",
    marginBottom: "22px",
    textAlign: "left",
    lineHeight: "1.65",
  };

  return (
    <div ref={containerRef} style={{ marginTop: "45px", width: "100%" }}>
      {/* Original Resume */}
      <h2
        style={{
          textAlign: "center",
          color: "white",
          marginBottom: "24px",
        }}
      >
        Original Resume
      </h2>

      <div style={{ marginBottom: "50px" }}>
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <p style={{ textAlign: "center", color: "#A1A1AA" }}>
              Loading original resume...
            </p>
          }
        >
          {Array.from({ length: numPages }, (_, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "center",
                background: "#FFFFFF",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "20px",
                overflow: "hidden",
              }}
            >
              <Page
                pageNumber={index + 1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          ))}
        </Document>
      </div>

      {/* AI Feedback */}
      <h2
        style={{
          textAlign: "center",
          color: "white",
          marginBottom: "10px",
        }}
      >
        AI-Powered Resume Feedback
      </h2>

      <p
        style={{
          textAlign: "center",
          color: "#A1A1AA",
          marginTop: 0,
          marginBottom: "28px",
        }}
      >
        Your actual resume wording, reviewed by AI.
      </p>

      {/* Strengths */}
      <div
        style={{
          ...cardStyle,
          background: "rgba(34,197,94,0.10)",
          border: "1px solid #16A34A",
        }}
      >
        <h3 style={{ color: "#4ADE80", marginTop: 0, marginBottom: "16px" }}>
          🟢 Strengths
        </h3>

        {annotations
          .filter((item) => item.type === "strength")
          .map((item, index) => (
            <div
              key={index}
              style={{
                background: "rgba(34,197,94,0.16)",
                padding: "14px 16px",
                borderRadius: "8px",
                marginBottom: "14px",
              }}
            >
              <p
                style={{
                  color: "#86EFAC",
                  marginTop: 0,
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                {item.quote}
              </p>

              <p style={{ color: "#D1D5DB", margin: 0 }}>
                {item.reason}
              </p>
            </div>
          ))}

        {!annotations.some((item) => item.type === "strength") && (
          <p style={{ color: "#D1D5DB", margin: 0 }}>
            No specific strengths were identified.
          </p>
        )}
      </div>

      {/* Weaknesses */}
      <div
        style={{
          ...cardStyle,
          background: "rgba(239,68,68,0.10)",
          border: "1px solid #DC2626",
        }}
      >
        <h3 style={{ color: "#F87171", marginTop: 0, marginBottom: "16px" }}>
          🔴 Areas to Improve
        </h3>

        {annotations
          .filter((item) => item.type === "needs_improvement")
          .map((item, index) => (
            <div
              key={index}
              style={{
                background: "rgba(239,68,68,0.15)",
                padding: "14px 16px",
                borderRadius: "8px",
                marginBottom: "14px",
              }}
            >
              <p
                style={{
                  color: "#FCA5A5",
                  marginTop: 0,
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                {item.quote}
              </p>

              <p style={{ color: "#D1D5DB", margin: 0 }}>
                {item.reason}
              </p>
            </div>
          ))}

        {!annotations.some(
          (item) => item.type === "needs_improvement"
        ) && (
          <p style={{ color: "#D1D5DB", margin: 0 }}>
            No specific areas to improve were identified.
          </p>
        )}
      </div>

      {/* Suggestions */}
      <div
        style={{
          ...cardStyle,
          background: "rgba(59,130,246,0.10)",
          border: "1px solid #3B82F6",
        }}
      >
        <h3 style={{ color: "#60A5FA", marginTop: 0, marginBottom: "16px" }}>
          🔵 Suggested Improvements
        </h3>

        {annotations
          .filter(
            (item) =>
              item.type === "needs_improvement" &&
              item.suggestion
          )
          .map((item, index) => (
            <div
              key={index}
              style={{
                background: "rgba(59,130,246,0.15)",
                padding: "14px 16px",
                borderRadius: "8px",
                marginBottom: "14px",
              }}
            >
              <p style={{ color: "#93C5FD", marginTop: 0, marginBottom: "4px" }}>
                <strong>Original wording:</strong>
              </p>

              <p style={{ color: "#DBEAFE", marginTop: 0, marginBottom: "12px" }}>
                {item.quote}
              </p>

              <p style={{ color: "#60A5FA", marginTop: 0, marginBottom: "4px" }}>
                <strong>Suggested wording:</strong>
              </p>

              <p style={{ color: "#DBEAFE", margin: 0 }}>
                {item.suggestion}
              </p>
            </div>
          ))}

        {!annotations.some(
          (item) =>
            item.type === "needs_improvement" && item.suggestion
        ) && (
          <p style={{ color: "#D1D5DB", margin: 0 }}>
            No suggested rewrites available.
          </p>
        )}
      </div>
    </div>
  );
}