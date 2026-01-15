import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Loading from './Loading';

const App = React.lazy(() => import('./App'));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
