import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:8080/api/keychain";

// --- SVG Icons ---
const LockIcon = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>;
const KeyIcon = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 9.5a.5.5 0 0 1-.354-.146L7.293 9l-1.147 1.146a.5.5 0 0 1-.708 0L5 9.707l-1.146 1.147a.5.5 0 0 1-.708 0L2 9.707 1.146 10.854a.5.5 0 0 1-.708 0L0 10.207V8zM2 5a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/></svg>;
const DomainIcon = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 8a7.97 7.97 0 0 0 .468 1.068c.552 1.035 1.218 1.65 1.887 1.855V1.077zM9 13.855c.727-.247 1.262-.896 1.651-1.897A6.967 6.967 0 0 0 11.26 8a6.967 6.967 0 0 0-.61-2.958C10.263 4.04 9.727 3.39 9 3.145v10.71z"/></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.5 1.5A1.5 1.5 0 0 1 10 0h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6c.37 0 .723.081 1.031.224zM8 7a.5.5 0 0 0-1 0v5.5a.5.5 0 0 0 1 0V7z"/><path d="M8 7a.5.5 0 0 0-1 0v5.5a.5.5 0 0 0 1 0V7z"/><path d="M10.854 4.146a.5.5 0 0 0-.708 0L10 4.293 8.854 3.146a.5.5 0 1 0-.708.708L9.293 5 8.146 6.146a.5.5 0 1 0 .708.708L10 5.707l1.146 1.147a.5.5 0 0 0 .708-.708L10.707 5l1.147-1.146a.5.5 0 0 0 0-.708z"/></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h-1v1a.5.5 0 0 1-.5.5H2.5a.5.5 0 0 1-.5-.5V6.5a.5.5 0 0 1 .5-.5H3v-1H2z"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2.5a.5.5 0 0 1-1 0v-2.5A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2.5a.5.5 0 0 1 1 0v2.5z"/><path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z"/></svg>;


// --- Components ---
const Notification = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`notification alert alert-${type} alert-dismissible fade show`} role="alert">
      {message}
      <button type="button" className="btn-close" onClick={onDismiss}></button>
    </div>
  );
};

const Spinner = () => <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>;


function App() {
  // State for auth and data
  const [password, setPassword] = useState("");
  const [keychain, setKeychain] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State for UI
  const [loading, setLoading] = useState({});
  const [notification, setNotification] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // State for GET form
  const [getName, setGetName] = useState("");
  const [retrievedPassword, setRetrievedPassword] = useState({name: "", value: ""});

  // State for SET form
  const [setName, setSetName] = useState("");
  const [setValue, setSetValue] = useState("");

  // State for REMOVE form
  const [removeName, setRemoveName] = useState("");

  const resetDashboardState = () => {
    setGetName("");
    setRetrievedPassword({name: "", value: ""});
    setSetName("");
    setSetValue("");
    setRemoveName("");
  }

  const handleApiError = (error, action = 'general') => {
    const errorMessage = error.response?.data?.error || error.message;
    setNotification({ type: "danger", message: errorMessage });
    setLoading(prev => ({...prev, [action]: false}));
  };
  
  const handleSetNotification = (message, type = "success") => {
      setNotification({ type, message });
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  }

  const handleAction = async (action, actionFn, ...args) => {
    setLoading(prev => ({...prev, [action]: true}));
    setNotification(null);
    try {
        await actionFn(...args);
    } catch (error) {
        handleApiError(error, action);
    } finally {
        setLoading(prev => ({...prev, [action]: false}));
    }
  }

  const handleCreate = async () => {
    resetDashboardState();
    const { Keychain } = await import("./password-manager");
    const newKeychain = await Keychain.init(password);
    const [repr, trustedDataCheck] = await newKeychain.dump();
    await axios.post(API_URL, { repr, trustedDataCheck });
    setKeychain(newKeychain);
    setIsLoggedIn(true);
    handleSetNotification("New keychain created and saved successfully!");
  };

  const handleLogin = async () => {
    resetDashboardState();
    const { data } = await axios.get(API_URL);
    const { Keychain } = await import("./password-manager");
    const loadedKeychain = await Keychain.load(password, data.repr, data.trustedDataCheck);
    setKeychain(loadedKeychain);
    setIsLoggedIn(true);
    handleSetNotification("Keychain unlocked successfully!");
  };

  const handleGet = async (e) => {
    e.preventDefault();
    setRetrievedPassword({name: "", value: ""});
    const value = await keychain.get(getName);
    if (value === null) {
      handleSetNotification(`No password found for "${getName}".`, "warning");
    } else {
      setRetrievedPassword({name: getName, value: value});
      handleSetNotification(`Password for "${getName}" retrieved.`);
    }
    setGetName("");
  };

  const handleSet = async (e) => {
    e.preventDefault();
    await keychain.set(setName, setValue);
    const [repr, trustedDataCheck] = await keychain.dump();
    await axios.post(API_URL, { repr, trustedDataCheck });
    handleSetNotification(`Password for "${setName}" has been set.`);
    setSetName("");
    setSetValue("");
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    await keychain.remove(removeName);
    const [repr, trustedDataCheck] = await keychain.dump();
    await axios.post(API_URL, { repr, trustedDataCheck });
    handleSetNotification(`Password for "${removeName}" has been removed.`, "info");
    setRemoveName("");
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card card">
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-4">
                <LockIcon />
                <h3 className="mt-2">Password Manager</h3>
                <p className="text-muted">Securely manage your digital life.</p>
            </div>
            {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
            <div className="input-group-icon mb-3">
                <KeyIcon className="icon" />
                <input type="password" placeholder="Master Password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-primary" onClick={() => handleAction('login', handleLogin)} disabled={loading.login}>
                {loading.login ? <Spinner /> : "Unlock"}
              </button>
              <button className="btn btn-outline-secondary" onClick={() => handleAction('create', handleCreate)} disabled={loading.create}>
                {loading.create ? <Spinner /> : "Create New"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Password Dashboard</h1>
        <button className="btn btn-sm btn-outline-secondary btn-icon" onClick={() => {
          setIsLoggedIn(false);
          setPassword("");
          resetDashboardState();
        }}><LogoutIcon /> Lock</button>
      </div>
      
      <div className="row g-4">
        <div className="col-12">
          <div className="card dashboard-card mb-4">
            <div className="card-body p-4">
              <h5 className="card-title card-title-icon"><SearchIcon /> Get Password</h5>
              <form onSubmit={(e) => handleAction('get', () => handleGet(e))}>
                <div className="input-group mb-3">
                  <div className="input-group-icon w-100">
                    <DomainIcon className="icon" />
                    <input type="text" className="form-control" placeholder="Enter domain name to retrieve" value={getName} onChange={(e) => setGetName(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-info text-white btn-icon w-100" disabled={loading.get}>
                    {loading.get ? <Spinner /> : <><SearchIcon /> Get Password</>}
                </button>
              </form>
              {retrievedPassword.value && (
                <div className="alert alert-light mt-3 retrieved-password-wrapper">
                  <div>
                    <strong>{retrievedPassword.name}:</strong>
                    <span className="ms-2 font-monospace">{retrievedPassword.value}</span>
                  </div>
                  <button className="btn btn-sm btn-light btn-copy" onClick={() => handleCopy(retrievedPassword.value)}>
                    {isCopied ? <CheckIcon/> : <CopyIcon/>}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
                <div className="card dashboard-card">
                    <div className="card-body p-4">
                    <h5 className="card-title card-title-icon"><PlusIcon /> Set Password</h5>
                    <form onSubmit={(e) => handleAction('set', () => handleSet(e))}>
                        <div className="input-group-icon mb-3">
                            <DomainIcon className="icon" />
                            <input type="text" className="form-control" placeholder="Domain name" value={setName} onChange={(e) => setSetName(e.target.value)} required />
                        </div>
                        <div className="input-group-icon mb-3">
                            <KeyIcon className="icon" />
                            <input type="text" className="form-control" placeholder="Password" value={setValue} onChange={(e) => setSetValue(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 btn-icon" disabled={loading.set}>
                            {loading.set ? <Spinner /> : <><PlusIcon /> Set Password</>}
                        </button>
                    </form>
                    </div>
                </div>
            </div>
            <div className="col-md-6">
                <div className="card dashboard-card">
                    <div className="card-body p-4">
                    <h5 className="card-title card-title-icon text-danger"><TrashIcon /> Remove</h5>
                    <form onSubmit={(e) => handleAction('remove', () => handleRemove(e))}>
                        <div className="input-group-icon mb-3">
                            <DomainIcon className="icon" />
                            <input type="text" className="form-control" placeholder="Domain name" value={removeName} onChange={(e) => setRemoveName(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-danger w-100 btn-icon" disabled={loading.remove}>
                            {loading.remove ? <Spinner /> : <><TrashIcon/> Remove</>}
                        </button>
                    </form>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
