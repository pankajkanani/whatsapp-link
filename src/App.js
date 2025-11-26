import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Contacts from "./components/Contacts";
import History from "./components/History";
import MainForm from "./components/MainForm";
import Templates from "./components/Templates";

function App() {
  const [contactHistory, setContactHistory] = useState([]);
  const [yourContacts, setYourContacts] = useState([]);
  const [path, setPath] = useState(window.location.pathname || "/");

  useEffect(() => {
    if (localStorage.getItem("history")) {
      setContactHistory(JSON.parse(localStorage.getItem("history")));
    }
    if (localStorage.getItem("savedContacts")) {
      setYourContacts(JSON.parse(localStorage.getItem("savedContacts")));
    }

    const onPop = () => {
      setPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <React.Fragment>
      <Navbar />
      <div className="container">
        {path === "/templates" ? (
          <div className="row py-5 my-5 bg-white bg-opacity-50 rounded">
            <div className="col-12 py-3">
              <Templates />
            </div>
          </div>
        ) : (
          <div className="row py-5 my-5 bg-white bg-opacity-50 rounded">
            <MainForm
              setContactHistory={setContactHistory}
              setYourContacts={setYourContacts}
            />
            <div className="col-lg-6 py-3">
              <div className="row">
                <History
                  contactHistory={contactHistory}
                  setContactHistory={setContactHistory}
                />
                <Contacts
                  yourContacts={yourContacts}
                  setYourContacts={setYourContacts}
                  setContactHistory={setContactHistory}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

export default App;
