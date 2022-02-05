
import './App.css';

import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import { useIdleTimer } from 'react-idle-timer';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Navbar from 'react-bootstrap/Navbar';

function App() {

  // Utility ref to the form
  const form = React.createRef();

  // Abort controller for requests
  const abortController = new AbortController;

  /** Properties */

  const [validated, setValidated] = React.useState(false);

  const [formValid, setFormValid] = React.useState(false);
  
  // on a non trivial scenario this would help to show the loading process
  const [loading, setLoading] = React.useState(false);

  const [token, setToken] = React.useState("");

  const [users, setUsers] = React.useState([]);

  const [values, setValues] = React.useState({
    firstName: '',
    lastName: '',
    address: '',
    ssn: ''
  });

  /** Utility functions */

  const handleChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value });
    if (prop === "ssn")
      setValidated(true);
    setFormValid(form.current.checkValidity());
  };

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      return
    }
    setValidated(true);
    event.preventDefault();
    event.stopPropagation();
    submitData();
  };

  const resetForm = () => {
    setValues({
      firstName: '',
      lastName: '',
      address: '',
      ssn: ''
    })
  };

  const submitData = () => {

    if (token == null || token === "")
      return

    // Clean the inputs
    let person = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      address: values.address.trim(),
      ssn: values.ssn

    };
    fetch("http://localhost:8081/api/members", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(person),
      signal: abortController.signal
    })
      .then(response => {


        response.json().then(data => {

          if (response.status !== 200) {
            // something went wrong
            alert("There was an error when processing your request: " + data.message)
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }
          let newArr = users;
          newArr.push(person);
          setUsers(newArr);
          setValidated(false);
          setFormValid(false);
          resetForm();

        });

      })
      .catch(function (err) {
        console.log('Fetch Error:', err);
        alert("There was an error when processing your request.");
      });

    return () => {
      abortController.abort();
    }
  }

  const getData = () => {

    if (token == null || token === "")
      return

    fetch("http://localhost:8081/api/members", {
      method: "GET",
      cache: 'no-cache',
      headers: {
        "Authorization": "Bearer " + token
      },
      signal: abortController.signal
    })
      .then(response => {

        if (response.status !== 200) {
          // something went wrong
          alert("There was a problem when processing your request");
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        response.json().then(data => {
          console.log(data)
          setUsers(data)

        });

      })
      .catch(function (err) {
        console.log('Fetch Error :-S', err);
      });

    return () => {
      abortController.abort()
    }
  }

  React.useEffect(() => {
    let us = { username: "sarah", password: "connor" }

    fetch("http://localhost:8081/auth ", {
      method: "POST",
      cache: 'no-cache',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(us)
    })
      .then(response => {
        setLoading(false)
        if (response.status !== 200) {
          // something went wrong
          alert("There was a problem when processing your request");
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        response.json().then(data => {
          console.log(data)
          setToken(data.token)
          getData()

        });

      })
      .catch(function (err) {
        console.log('Fetch Error:', err);
        alert("There was an error when processing your request.")
      });

  }, []);

  // utility effect to start the first request
  React.useEffect(() => {
    if (token !== "" && token != null)
      getData()

  }, [token]);

  // React idle to auto call refresh table after 2 mins

  const handleOnIdle = event => {
    getData()
  };

  const handleOnActive = event => {
    //do nothing
  };

  const handleOnAction = event => {
    // do nothing
  };

  const { getRemainingTime, getLastActiveTime } = useIdleTimer({
    timeout: 1000 * 60 * 2,
    onIdle: handleOnIdle,
    onActive: handleOnActive,
    onAction: handleOnAction,
    debounce: 500
  });

  return (
    <>

      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            HOME
          </Navbar.Brand>

          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              OTHER PAGE
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>

        <Row className="mt-3">

          <Col >
            <Form noValidate validated={validated} onSubmit={handleSubmit} ref={form}>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="validationFN">
                  <Form.Label>First name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    onChange={handleChange('firstName')}
                    value={values.firstName}
                    placeholder="First name"
                    pattern="[a-zA-Z ]{2,}"
                    defaultValue=""
                  />
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                  <Form.Control.Feedback type="invalid">
                    This field can't be empty
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="validationLN">
                  <Form.Label>Last name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    onChange={handleChange('lastName')}
                    value={values.lastName}
                    placeholder="Last name"
                    pattern="[a-zA-Z ]{2,}"
                    defaultValue=""
                  />
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                  <Form.Control.Feedback type="invalid">
                    This field can't be empty
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="validationLN">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    onChange={handleChange('address')}
                    value={values.address}
                    placeholder="Address"
                    pattern=".{2,}"
                    defaultValue=""
                  />
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                  <Form.Control.Feedback type="invalid">
                    This field can't be empty
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} controlId="validationLN">
                  <Form.Label>SSN</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    onChange={handleChange('ssn')}
                    value={values.ssn}
                    placeholder="Social Security Number"
                    pattern='[0-9]{3}-[0-9]{2}-[0-9]{4}'
                    defaultValue=""
                  />
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                  <Form.Control.Feedback type="invalid">
                    Please input a valid SSN with the format ###-##-####, where each # is a number.
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Col md={{ span: 3, offset: 2 }}><Button variant="danger" onClick={resetForm} >Reset</Button></Col>
                <Col md={{ span: 3, offset: 2 }}><Button type="submit" disabled={!formValid}>Save</Button></Col>

              </Row>
            </Form>
          </Col>
          <Col>
            {users.length > 0 &&

              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Username</th>
                    <th>SSN</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.ssn}>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.address}</td>
                      <td>{user.ssn}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            }
          </Col>
        </Row>
      </Container>

      <Navbar bg="light" variant="light" fixed="bottom">
        <Container>
          <Navbar.Brand href="#home">
            Copyright © Aldo Pedro Rangel Montiel
          </Navbar.Brand>

          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              All rights reserved.
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default App;
