import React, { useState } from 'react';
import testAuth from '../utils/testAuth';

function AuthTest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    const testResult = await testAuth();
    setResult(testResult);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Authentication Test</h1>
      <button 
        onClick={runTest} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Run Authentication Test'}
      </button>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h2>Test Result</h2>
          <p>Success: {result.success ? 'Yes' : 'No'}</p>
          <p>Message: {result.message}</p>
          {result.error && (
            <div>
              <h3>Error Details:</h3>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                {JSON.stringify(result.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuthTest; 