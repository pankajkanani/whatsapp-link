import React, { useEffect, useState } from "react";

const STORAGE_KEY = "quickTemplates";
const MIN_TEMPLATES = 3;
const MAX_TEMPLATES = 15;

const defaultTemplates = [
  { key: "realestate", label: "Real Estate", text: "Hi, I'm interested in the property at..." },
  { key: "ecommerce", label: "E-commerce", text: "I have a question about my order..." },
  { key: "booking", label: "Booking", text: "I would like to schedule an appointment." },
];

const readTemplates = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTemplates;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length < MIN_TEMPLATES) return defaultTemplates;
    return parsed.slice(0, MAX_TEMPLATES);
  } catch (e) {
    return defaultTemplates;
  }
};

const readDefaultKey = () => {
  try {
    const k = localStorage.getItem("quickTemplatesDefault");
    return k || null;
  } catch (e) {
    return null;
  }
};

const Templates = () => {
  const [templates, setTemplates] = useState(readTemplates);
  const [defaultKey, setDefaultKey] = useState(readDefaultKey);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftText, setDraftText] = useState("");

  // Do not auto-save; user must click Save to persist. This matches the user's request.

  const addTemplate = () => {
    if (templates.length >= MAX_TEMPLATES) return;
    const next = [...templates, { key: `t${Date.now()}`, label: "New", text: "" }];
    setTemplates(next);
  };

  const removeTemplate = (index) => {
    if (templates.length <= MIN_TEMPLATES) return;
    const next = templates.filter((_, i) => i !== index);
    setTemplates(next);
    // if removed default, clear defaultKey
    if (defaultKey && templates[index] && templates[index].key === defaultKey) {
      setDefaultKey(null);
    }
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setDraftLabel(templates[index].label);
    setDraftText(templates[index].text);
  };

  const saveEdit = (index) => {
    const next = [...templates];
    next[index] = { ...next[index], label: draftLabel || next[index].label, text: draftText };
    setTemplates(next);
    setEditingIndex(-1);
  };

  const saveAll = () => {
    // basic validation: keys unique and non-empty, min/max count
    const keys = templates.map((t) => (t.key || "").trim());
    if (templates.length < MIN_TEMPLATES) {
      alert(`You must keep at least ${MIN_TEMPLATES} templates.`);
      return;
    }
    if (templates.length > MAX_TEMPLATES) {
      alert(`You can have at most ${MAX_TEMPLATES} templates.`);
      return;
    }
    if (keys.some((k) => k === "")) {
      alert("Template keys cannot be empty.");
      return;
    }
    const uniq = new Set(keys);
    if (uniq.size !== keys.length) {
      alert("Template keys must be unique.");
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.slice(0, MAX_TEMPLATES)));
      if (defaultKey) {
        localStorage.setItem("quickTemplatesDefault", defaultKey);
      } else {
        localStorage.removeItem("quickTemplatesDefault");
      }
      alert("Templates saved locally.");
    } catch (e) {
      alert("Failed to save templates.");
    }
  };

  return (
    <div>
      <h3 className="text-start">Manage Quick Templates</h3>
      <p className="text-muted text-start">Minimum {MIN_TEMPLATES}, maximum {MAX_TEMPLATES} templates. Click Save to persist changes locally.</p>

      <div>
        {templates.map((t, i) => (
          <div key={t.key} className="card my-2 p-2">
            <div className="row g-2 align-items-start">
              <div className="col-12 col-md-9">
                {editingIndex === i ? (
                  <>
                    <div className="mb-2">
                      <label className="form-label text-start d-block">Key</label>
                      <input value={t.key} onChange={(e) => {
                        const next = [...templates];
                        next[i] = { ...next[i], key: e.target.value };
                        setTemplates(next);
                      }} className="form-control" />
                    </div>
                    <div className="mb-2">
                      <label className="form-label text-start d-block">Label</label>
                      <input value={draftLabel} onChange={(e) => setDraftLabel(e.target.value)} className="form-control" />
                    </div>
                    <div>
                      <label className="form-label text-start d-block">Text</label>
                      <textarea value={draftText} onChange={(e) => setDraftText(e.target.value)} rows={3} className="form-control" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="d-flex align-items-center mb-1">
                      <input type="radio" name="defaultTemplate" checked={defaultKey === t.key} onChange={() => setDefaultKey(t.key)} className="me-2" aria-label={`Set ${t.label} as default`} />
                      <strong className="me-2">{t.label}</strong>
                      <small className="text-muted">({t.key})</small>
                    </div>
                    <div className="small text-muted">{t.text}</div>
                  </>
                )}
              </div>

              <div className="col-12 col-md-3 text-md-end">
                {editingIndex === i ? (
                  <>
                    <button className="btn btn-sm btn-primary me-1 mb-1" onClick={() => saveEdit(i)}>Save</button>
                    <button className="btn btn-sm btn-secondary mb-1" onClick={() => setEditingIndex(-1)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-sm btn-outline-primary me-1 mb-1" onClick={() => startEdit(i)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger mb-1" onClick={() => removeTemplate(i)} disabled={templates.length <= MIN_TEMPLATES}>Remove</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex flex-wrap gap-2 mt-3">
        <button className="btn btn-success" onClick={addTemplate} disabled={templates.length >= MAX_TEMPLATES}>Add Template</button>
        <button className="btn btn-primary" onClick={saveAll}>Save</button>
        <button className="btn btn-outline-secondary" onClick={() => { window.history.pushState({}, "", "/"); window.dispatchEvent(new PopStateEvent("popstate")); }}>Back</button>
      </div>
    </div>
  );
};

export default Templates;
