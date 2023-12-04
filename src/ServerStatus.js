import React, { useEffect, useState } from 'react';

function ServerStatus() {
  const [isServerOnline, setServerOnline] = useState(null);

  useEffect(() => {
    fetch('https://pfxtopemapi.mamud.cloud')
      .then(response => {
        if (!response.ok) {
          setServerOnline(false);
        } else {
          setServerOnline(true);
        }
      })
      .catch(() => {
        setServerOnline(false);
      });
  }, []);

  return (
    isServerOnline === null ? null : (
      isServerOnline ? 
        <span role="img" aria-label="server-online">🟢 Server Online</span> :
        <span role="img" aria-label="server-offline">🔴 Server Offline</span>
    )
  );
}

export default ServerStatus;