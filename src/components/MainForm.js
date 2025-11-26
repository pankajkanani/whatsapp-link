import React, { useState, useRef } from "react";
import { saveHistory } from "../utils/contactUtils";

const MainForm = ({ setContactHistory, setYourContacts }) => {
  const [countryCode, setCountryCode] = useState("91");
  const [number, setNumber] = useState("");
  const [validNumber, setValidNumber] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const messageRef = useRef(null);

  const handleCountryCode = (event) => {
    setCountryCode(event.target.value);
  };

  function now() {
    const now = new Date();
    const formattedString = `Contacted on: ${now.toUTCString()}`;
    return formattedString;
  }

  const validatePhoneNumber = (number) => {
    // Expect exactly 10 digits for local number (country code handled separately)
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(number);
  };
  const handleOnChange = (event) => {
    const value = event.target.value;
    const phoneNumber = value.replace(/[^0-9]/g, "");
    setNumber(phoneNumber);
    if (validatePhoneNumber(phoneNumber)) {
      setValidNumber(true);
    } else {
      setValidNumber(false);
    }
  };

  const insertAtCursor = (text) => {
    const el = messageRef.current;
    if (!el) {
      setMessage((m) => (m ? m + text : text));
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const newMessage = message.slice(0, start) + text + message.slice(end);
    setMessage(newMessage);

    // set caret after inserted text
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const wrapSelection = (marker) => {
    const el = messageRef.current;
    if (!el) {
      // If no ref, just append markers
      setMessage((m) => m + marker + marker);
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const selected = message.slice(start, end);
    const wrapped = `${marker}${selected}${marker}`;
    const newMessage = message.slice(0, start) + wrapped + message.slice(end);
    setMessage(newMessage);

    // restore selection around wrapped content
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + marker.length, start + marker.length + selected.length);
    });
  };
  const saveContact = () => {
    // [ {name:"name1",number:723487236},...]
    let phoneNumber = countryCode + number;
    let savedContacts = localStorage.getItem("savedContacts");
    let savedContactsArray = savedContacts ? JSON.parse(savedContacts) : [];
    let nameExists = savedContactsArray.some(
      (contact) => contact.name === name
    );
    let numberExists = savedContactsArray.some(
      (contact) => contact.number === phoneNumber
    );

    if (nameExists || numberExists) {
      setError(true);
    } else {
      setError(false);
      savedContactsArray.push({
        name: name,
        number: countryCode + number,
      });
      localStorage.setItem("savedContacts", JSON.stringify(savedContactsArray));
    }
    setYourContacts(savedContactsArray);
  };

  const quickTemplates = [
    { key: "realestate", label: "Real Estate", text: "Hi, I'm interested in the property at..." },
    { key: "ecommerce", label: "E-commerce", text: "I have a question about my order..." },
    { key: "booking", label: "Booking", text: "I would like to schedule an appointment." },
  ];

  return (
    <div className="col-lg-6 py-3">
      <div className="row">
        <div className="col-sm-4">
          <p className="text-dark text-sm text-start">Country</p>
          <input
            onChange={handleCountryCode}
            value={countryCode}
            type="text"
            className="form-control"
            placeholder="Country Code"
          />
        </div>
        <div className="col-sm-8">
          <p className="text-dark text-sm text-start">Phone Number</p>
          <input
            onChange={handleOnChange}
            value={number}
            type="tel"
            className="form-control"
            placeholder="Enter valid number (10 digits )"
          />

          <p className="text-dark text-sm mt-3 text-start">Message</p>
          <div className="d-flex mb-2">
            <div className="btn-group me-2" role="group" aria-label="Formatting">
              <button type="button" onClick={() => wrapSelection("*")} className="btn btn-outline-secondary" aria-label="Bold">B</button>
              <button type="button" onClick={() => wrapSelection("_")} className="btn btn-outline-secondary" aria-label="Italic">I</button>
              <button type="button" onClick={() => wrapSelection("~")} className="btn btn-outline-secondary" aria-label="Strikethrough">S</button>
            </div>
              <div className="btn-group" role="group" aria-label="Quick templates">
                <select className="form-select form-select-sm me-2" aria-label="Templates" value={""} onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  try {
                    const parsed = JSON.parse(val);
                    // Replace the entire message with the template text
                    setMessage(parsed.text || "");
                    // move caret to end and focus
                    requestAnimationFrame(() => {
                      const el = messageRef.current;
                      if (el) {
                        el.focus();
                        const pos = (parsed.text || "").length;
                        el.setSelectionRange(pos, pos);
                      }
                    });
                  } catch (err) {
                    // fallback: treat value as plain text
                    setMessage(val || "");
                    requestAnimationFrame(() => {
                      const el = messageRef.current;
                      if (el) {
                        el.focus();
                        const pos = (val || "").length;
                        el.setSelectionRange(pos, pos);
                      }
                    });
                  }
                  // reset select
                  e.target.value = "";
                }}>
                  <option value="">Select template...</option>
                    {(() => {
                      const stored = localStorage.getItem("quickTemplates");
                      const defaultKey = localStorage.getItem("quickTemplatesDefault");
                      try {
                        const arr = stored ? JSON.parse(stored) : quickTemplates;
                        // if there's a defaultKey, move that template to the top
                        let ordered = arr.slice(0, 15);
                        if (defaultKey) {
                          const idx = ordered.findIndex((x) => x.key === defaultKey);
                          if (idx > 0) {
                            const [d] = ordered.splice(idx, 1);
                            ordered.unshift(d);
                          }
                        }
                        return ordered.map((t) => (
                          <option key={t.key} value={JSON.stringify(t)}>{t.label}</option>
                        ));
                      } catch (e) {
                        return quickTemplates.map((t) => (
                          <option key={t.key} value={JSON.stringify(t)}>{t.label}</option>
                        ));
                      }
                    })()}
                </select>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    // navigate to /templates without reloading
                    window.history.pushState({}, "", "/templates");
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }}
                >
                  Manage
                </button>
              </div>
          </div>

          <textarea
            ref={messageRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-control"
            rows={3}
            placeholder="Type your message (optional)"
          />
          <a
            onClick={() => {
              saveHistory(countryCode + number, now());
              setContactHistory(JSON.parse(localStorage.getItem("history") || "[]"));
            }}
            rel="noopener noreferrer"
            target="_blank"
            href={
              validNumber
                ? `https://wa.me/${countryCode + number}${message ? `?text=${encodeURIComponent(message)}` : ""}`
                : "#"
            }
            className={`btn btn-success my-3 m-auto w-100 ${
              validNumber ? "" : "disabled"
            }`}
          >
            <i className="bi bi-whatsapp" /> Chat on whatsapp
          </a>
          <input
            onChange={(event) => {
              setName(event.target.value);
            }}
            value={name}
            type="text"
            className="form-control"
            placeholder="Enter name to save contact on browser"
          />
          <button
            onClick={saveContact}
            className={`btn btn-success w-100 my-3 ${
              validNumber && name ? "" : "disabled"
            }`}
          >
            Save Contact
          </button>
          {error && (
            <p className="text-danger">
              Error: The name or number already exists
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainForm;
