import React from "react";
import swal from "sweetalert";
import { saveHistory } from "../utils/contactUtils";

const Contacts = ({ yourContacts, setYourContacts, setContactHistory }) => {
  const deleteContact = (event) => {
    const contactName = event.currentTarget.value;
    swal({
      title: "Are you sure?",
      text: "Are you sure that you want to delete this contact?",
      icon: "warning",
      dangerMode: true,
      buttons: ["No", "Yes"],
    }).then((willDelete) => {
      if (willDelete) {
        const allContacts = JSON.parse(
          localStorage.getItem("savedContacts") || "[]"
        );

        const remainingContacts = allContacts.filter((contact) => {
          return contact.name !== contactName;
        });

        localStorage.setItem("savedContacts", JSON.stringify(remainingContacts));

        setYourContacts(JSON.parse(localStorage.getItem("savedContacts") || "[]"));

        swal({
          title: "Deleted Successfully!",
          icon: "success",
        });
      } else {
        swal({
          title: "Contact Not deleted.",
        });
      }
    });
  };

  const deleteAllContacts = () => {
    swal({
      title: "Are you sure?",
      text: "Are you sure that you want to delete all the contacts?",
      icon: "warning",
      dangerMode: true,
      buttons: ["No", "Yes"],
    }).then((willDelete) => {
      if (willDelete) {
        localStorage.setItem("savedContacts", "[]");
        setYourContacts([]);
        swal("Deleted!", "Deleted all Contacts.", "success");
      } else {
        swal({
          title: "Contacts are safe!",
        });
      }
    });
  };

  function now() {
    const now = new Date();
    const formattedString = `Contacted on: ${now.toUTCString()}`;
    return formattedString;
  }

  function handleCopyToClipboard(value) {
    navigator.clipboard
      .writeText(value)
      .then(() => swal("Copied!", value, "success"))
      .catch(() => swal("Oops!", "something went wrong", "error"));
  }

  return (
    <div className="col-md-6 py-1">
      <div className="d-flex justify-content-between align-items-center">
        <span className="fs-4 fw-bolder-3">Contacts</span>
        <button onClick={deleteAllContacts} className="btn btn-outline-dark">
          <i className="bi bi-trash3" />
        </button>
      </div>

      <div>
        {[...yourContacts]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((element) => {
            const phone = element.number || "";
            const cc = phone.length > 10 ? phone.slice(0, phone.length - 10) : "";
            const rest = phone.slice(-10);
            const displayNumber = cc ? `+${cc}-${rest}` : rest;

            return (
              <div key={element.number || element.name} className="card text-bg-white my-2 w-100 p-2">
                <div className="card-header d-flex justify-content-between fw-bold">
                  <p>{element.name}</p>
                  <button
                    onClick={deleteContact}
                    value={element.name}
                    className="btn btn-sm btn-outline-danger m-1"
                    aria-label={`Delete ${element.name}`}
                  >
                    <i className="bi bi-trash3" aria-hidden="true" />
                  </button>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title">{displayNumber}</h5>
                    <button
                      onClick={() => handleCopyToClipboard(element.number)}
                      value={element.name}
                      className="btn btn-sm btn-outline-secondary m-1"
                      aria-label={`Copy ${element.name} number`}
                    >
                      <i className="bi bi-clipboard" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <a
                  onClick={() => {
                    saveHistory(element.number, now());
                    setContactHistory(JSON.parse(localStorage.getItem("history") || "[]"));
                  }}
                  value={element}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://wa.me/${element.number}`}
                  className="btn btn-outline-success"
                >
                  Chat
                </a>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Contacts;
