import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Home } from './pages/home'
import { Galery } from './pages/galery'
import { DetailTrekking } from './pages/DetailTrekking'

const Route = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/galery',
    element: <Galery />
  },
  {
    path: '/DetailTrekking/:id',
    element: <DetailTrekking />
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={Route} />
  </React.StrictMode>
)
