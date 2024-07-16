import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Root from './routes/root';
import KonvaCanvas from './routes/react-konva';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root/>
  },
  {
    path: "react-konva",
    element: <KonvaCanvas/>
  },
  {
    path: "fabric-js",
    element: <></>
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
