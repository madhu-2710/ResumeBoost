import { useState } from "react";
import { useFlagsmith } from "@flagsmith/flagsmith/react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  X,
  Sparkles,
} from "lucide-react";
import ResumeComparison from "./ResumeComparison";

const gradient = "linear-gradient(135deg, #3B82F6, #8B5CF6, #22C55E)";

export default function ResumeUpload({ feedbackExperience }) {
  const flagsmith = useFlagsmith();

  const trackImprovementCompleted = () => {
    const alreadyTracked = localStorage.getItem(
      "resumeboost_conversion_sent"
    );

    if (alreadyTracked) return;

    flagsmith.trackEvent("resume_improvement_completed", {
      value: 1,
      metadata: {
        feedback_experience: feedbackExperience,
      },
    });

    localStorage.setItem("resumeboost_conversion_sent", "true");
    console.log("Conversion event tracked!");
  };

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError("");
      setResult(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    maxSize: 5 * 1024 * 1024,
  });

  async function handleAnalyze() {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(
        "https://resumeboost-u63n.onrender.com/api/resume/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Resume analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  const panel = {
    background: "#121827",
    border: "1px solid #252D40",
    borderRadius: "16px",
    padding: "24px",
    marginTop: "20px",
  };

  const heading = {
    color: "#FFFFFF",
    marginBottom: "12px",
  };

  const paragraph = {
    color: "#A1A1AA",
    lineHeight: "1.7",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080B12",
        color: "#FFFFFF",
        padding: "45px 20px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: "45px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "30px",
              fontWeight: "bold",
              background: gradient,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            <Sparkles color="#8B5CF6" size={30} />
            ResumeBoost
          </div>

          <p style={paragraph}>
            Your resume. Improved for better opportunities.
          </p>
        </div>

        <div
          style={{
            ...panel,
            padding: "35px",
            boxShadow: "0 15px 60px rgba(59,130,246,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Sparkles size={38} color="#8B5CF6" />
            <h2 style={heading}>Let's improve your resume</h2>
            <p style={paragraph}>
              Upload your resume and get AI-powered feedback.
            </p>
          </div>

          <div
            {...getRootProps()}
            style={{
              border: "2px dashed #6366F1",
              borderRadius: "14px",
              padding: "45px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: isDragActive ? "#1B2340" : "#0D1422",
              marginTop: "30px",
            }}
          >
            <input {...getInputProps()} />
            <Upload size={42} color="#8B5CF6" />
            <h3 style={heading}>
              {isDragActive
                ? "Drop your resume here"
                : "Drag and drop your resume"}
            </h3>
            <p style={paragraph}>or click to browse your files</p>
            <small style={{ color: "#71717A" }}>
              PDF files only · Maximum 5 MB
            </small>
          </div>

          {file && (
            <div
              style={{
                ...panel,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FileText color="#8B5CF6" />

                <div style={{ textAlign: "left" }}>
                  <strong style={{ display: "block", textAlign: "left" }}>
                    {file.name}
                  </strong>
                  <p
                    style={{
                      color: "#A1A1AA",
                      margin: "6px 0 0 0",
                      textAlign: "left",
                      fontSize: "14px",
                    }}
                  >
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setError("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <X />
              </button>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "10px",
              background: file && !loading ? gradient : "#343A49",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: file && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "Analyzing Resume..." : "Analyze My Resume"}
          </button>

          {error && (
            <p style={{ color: "#F87171", marginTop: "20px", textAlign: "center" }}>
              {error}
            </p>
          )}

          {result?.analysis && (
            <div style={{ width: "100%", marginTop: "30px", textAlign: "left" }}>
              {(() => {
                const analysis = result.analysis;
                const isDetailed = feedbackExperience === "detailed";

                const sectionStyle = {
                  background: "#121827",
                  border: "1px solid #252D40",
                  borderRadius: "14px",
                  padding: "22px",
                  marginTop: "18px",
                  textAlign: "left",
                };

                const titleStyle = {
                  color: "#FFFFFF",
                  marginTop: 0,
                  marginBottom: "16px",
                };

                const listStyle = {
                  color: "#D1D5DB",
                  lineHeight: "1.8",
                  paddingLeft: 0,
                  listStyle: "none",
                  textAlign: "left",
                };

                return (
                  <>
                    <div style={{ textAlign: "center", marginBottom: "25px" }}>
                      <span style={{ color: "#A1A1AA", fontSize: "13px" }}>
                        {isDetailed ? "DETAILED RESUME REPORT" : "BASIC RESUME REPORT"}
                      </span>

                      <h2 style={{ color: "white", margin: "8px 0" }}>
                        Your Resume Insights
                      </h2>

                      <div
                        style={{
                          display: "inline-block",
                          fontSize: "52px",
                          fontWeight: "bold",
                          lineHeight: "1.2",
                          padding: "4px 0",
                          background: gradient,
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          color: "transparent",
                          margin: "10px 0",
                        }}
                      >
                        {analysis.score}/100
                      </div>

                      <p style={{ color: "#A1A1AA", lineHeight: "1.7" }}>
                        {analysis.summary}
                      </p>
                    </div>

                    <div style={sectionStyle}>
                      <h3 style={titleStyle}>🟢 Strengths</h3>
                      <ul style={listStyle}>
                        {analysis.strengths.map((item, i) => (
                          <li
                            key={i}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "15px 1fr",
                              gap: "8px",
                              marginBottom: "12px",
                            }}
                          >
                            <span style={{ color: "#22C55E" }}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={sectionStyle}>
                      <h3 style={titleStyle}>⚠️ Areas to Improve</h3>
                      <ul style={listStyle}>
                        {analysis.weaknesses.map((item, i) => (
                          <li
                            key={i}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "15px 1fr",
                              gap: "8px",
                              marginBottom: "12px",
                            }}
                          >
                            <span style={{ color: "#F59E0B" }}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={sectionStyle}>
                      <h3 style={titleStyle}>💡 Recommendations</h3>
                      <ul style={listStyle}>
                        {analysis.recommendations.map((item, i) => (
                          <li key={i} style={{ marginBottom: "12px" }}>
                            <label
                              style={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "flex-start",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                style={{ marginTop: "5px" }}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    trackImprovementCompleted();
                                  }
                                }}
                              />
                              <span>{item}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isDetailed && (
                      <>
                        <div style={sectionStyle}>
                          <h3 style={titleStyle}>☑️ Section-wise Feedback</h3>
                          {Object.entries(analysis.sectionFeedback || {}).map(
                            ([section, feedback]) => (
                              <div
                                key={section}
                                style={{
                                  borderBottom: "1px solid #252D40",
                                  padding: "12px 0",
                                }}
                              >
                                <strong
                                  style={{
                                    color: "#A78BFA",
                                    marginBottom: "6px",
                                    display: "block",
                                  }}
                                >
                                  {section.charAt(0).toUpperCase() + section.slice(1)}
                                </strong>
                                <p style={{ color: "#D1D5DB", lineHeight: "1.7", margin: 0 }}>
                                  {feedback}
                                </p>
                              </div>
                            )
                          )}
                        </div>

                        <div style={sectionStyle}>
                          <h3 style={titleStyle}>✨ Improved Resume Bullet Points</h3>
                          <ul style={listStyle}>
                            {(analysis.rewrittenBullets || []).map((item, i) => (
                              <li key={i} style={{ marginBottom: "10px" }}>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div style={sectionStyle}>
                          <h3 style={titleStyle}>🔍 Missing Keywords</h3>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "9px" }}>
                            {(analysis.missingKeywords || []).map((item, i) => (
                              <span
                                key={i}
                                style={{
                                  padding: "8px 13px",
                                  borderRadius: "20px",
                                  color: "white",
                                  background: "#252D40",
                                  border: "1px solid #6366F1",
                                  fontSize: "13px",
                                }}
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={sectionStyle}>
                          <h3 style={titleStyle}>✅ Your Improvement Checklist</h3>
                          {(analysis.checklist || []).map((item, i) => (
                            <label
                              key={i}
                              style={{
                                display: "flex",
                                gap: "12px",
                                padding: "12px 0",
                                borderBottom: "1px solid #252D40",
                                color: "#D1D5DB",
                                lineHeight: "1.6",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="checkbox"
                                style={{ marginTop: "5px" }}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    trackImprovementCompleted();
                                  }
                                }}
                              />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {result?.analysis && file && (
            <div style={{ width: "100%", marginTop: "30px" }}>
              <ResumeComparison
                file={file}
                annotations={result.analysis.annotations || []}
              />
            </div>
          )}
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#52525B",
            marginTop: "30px",
            fontSize: "13px",
          }}
        >
          ResumeBoost · AI-powered resume improvement
        </p>
      </div>
    </div>
  );
}