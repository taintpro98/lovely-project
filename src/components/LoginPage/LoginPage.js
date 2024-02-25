import React from 'react';
import LoginForm from './LoginForm';

import './LoginPage.css';

function LoginPage(props) {
  const { setStatus } = props;
  return (
    <div className="LoginPage">
      <LoginForm setStatus={setStatus} />
    </div>
  );
}

export default LoginPage;
