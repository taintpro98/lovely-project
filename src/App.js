import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import LoginPage from './components/LoginPage/LoginPage';
import HomePage from './components/HomePage/HomePage';

const App = () => {
  const [status, setStatus] = useState("");

  return (
    <Router>
      <div>
        <Route exact path="/">
          {status === "logged" ? <Redirect to="/home" /> : <Redirect to="/login" />}
        </Route>
        <Route
          path="/login"
          render={() => (
            <LoginPage setStatus={setStatus} />
          )}
        />
        <Route path="/home" component={HomePage} />
      </div>
    </Router>
  );
};

export default App;
