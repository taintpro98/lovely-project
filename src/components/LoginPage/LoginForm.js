import React, { useState } from 'react';
import { Panel, Form, FormGroup, FormControl, Button } from 'react-bootstrap';

const divStyle = {
  display: 'flex',
  alignItems: 'center',
  marginTop: -100
};

const panelStyle = {
  backgroundColor: 'rgba(255,255,255,0.5)',
  border: 0,
  paddingLeft: 20,
  paddingRight: 20,
  width: 300,
};

const buttonStyle = {
  marginBottom: 0
};

function LoginForm(props) {
  const { setStatus } = props;
  const [passwd, setPass] = useState("");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (passwd === "061023") {
      setStatus("logged");
    } else {
      alert('Wrong password');
      setPass("");
    }
  }

  return (
    <div style={divStyle}>
      <Panel style={panelStyle}>
        <Form horizontal className="LoginForm" id="loginForm">
          <FormGroup controlId="formPassword">
            <FormControl type="password" placeholder="Password" value={passwd} onChange={(e) => {
              setPass(e.target.value);
            }}/>
          </FormGroup>
          <FormGroup style={buttonStyle} controlId="formSubmit">
            <Button bsStyle="primary" type="submit" onClick={handleFormSubmit}>
              Login
            </Button>
          </FormGroup>
        </Form>
      </Panel>
    </div>
  )
}

export default LoginForm;
