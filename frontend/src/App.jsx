import { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001";

const initialForm = {
  jobDescription: "",
  name: "",
  skills: "",
  experienceLevel: "Intermediate",
  tone: "Professional",
  wordRange: "150-250",
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [proposal, setProposal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy Proposal");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setProposal("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate proposal.");
      }

      setProposal(data.proposal);
    } catch (submitError) {
      setError(submitError.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!proposal) {
      return;
    }

    try {
      await navigator.clipboard.writeText(proposal);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy Proposal"), 1800);
    } catch {
      setError("Unable to copy proposal. Please copy it manually.");
    }
  };

  return (
    <div className="app-shell">
      <main className="layout">
        <section className="hero">
          <p className="eyebrow">Freelance Proposal Writer</p>
          <p className="hero-copy">
            Paste a client brief, add your profile details, and generate a
            proposal tuned for marketplaces like Upwork and Fiverr.
          </p>
        </section>

        <section className="panel">
          <form className="proposal-form" onSubmit={handleSubmit}>
            <label>
              Job Description
              <textarea
                name="jobDescription"
                value={form.jobDescription}
                onChange={handleChange}
                rows="7"
                placeholder="Paste the job post here..."
                required
              />
            </label>

            <div className="grid two-col">
              <label>
                Freelancer Name
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Sagar Jajoriya"
                  required
                />
              </label>

              <label>
                Experience Level
                <select
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={handleChange}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </label>
            </div>

            <label>
              Skills
              <input
                type="text"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="React, Node, Python, Golang"
                required
              />
            </label>

            <div className="grid two-col">
              <label>
                Tone
                <select name="tone" value={form.tone} onChange={handleChange}>
                  <option>Friendly</option>
                  <option>Professional</option>
                  <option>Confident</option>
                </select>
              </label>

              <label>
                Word Count Target
                <select
                  name="wordRange"
                  value={form.wordRange}
                  onChange={handleChange}
                >
                  <option value="150-250">150-250 words</option>
                  <option value="250-400">250-400 words</option>
                </select>
              </label>
            </div>

            <button type="submit" className="primary-btn" disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Proposal"}
            </button>
          </form>
        </section>

        <section className="panel output-panel">
          <div className="output-header">
            <div>
              <p className="section-label">Generated Proposal</p>
              <h2>Ready to send</h2>
            </div>
            <button
              type="button"
              className="secondary-btn"
              onClick={handleCopy}
              disabled={!proposal}
            >
              {copyLabel}
            </button>
          </div>

          {isLoading && (
            <div className="loader-card" aria-live="polite">
              <div className="spinner" />
              <p>
                Drafting a proposal based on the job post and your profile...
              </p>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}

          {!isLoading && (
            <textarea
              className="proposal-output"
              value={proposal}
              readOnly
              placeholder="Your generated proposal will appear here."
              rows="14"
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
