import React from 'react';
import './Explanation.css';

const Explanation = () => {
  return (
    <div className="explanation-bar">
      <p>Do not hesitate to provide your certificate and password, as the data is not stored.</p>
      <p>This is an open source project. You can check the source code at the following links:</p>
      <p><span role="img" aria-label="pointing right">👉</span> <a href="https://github.com/murillomamud/cert-conv-frontend" target="_blank" rel="noopener noreferrer">Frontend</a></p>
      <p><span role="img" aria-label="pointing right">👉</span> <a href="https://github.com/murillomamud/cert-conv-backend" target="_blank" rel="noopener noreferrer">Backend</a></p>
      <p>Feel free to contribute in this project, opening a PR or an Issue</p>
    </div>
  );
}

export default Explanation;