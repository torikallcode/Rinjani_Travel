import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Home } from './pages/home'
import { Galery } from './pages/galery'
import { DetailTrekking } from './pages/DetailTrekking'
import NotFound from './components/elements/NotFound'
import { Contact } from './pages/contact'
import { Tour } from './pages/rinjaniTour'
import { TrekkingSummit } from './pages/trekkingSummit'
import { About } from './pages/about'
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
  },
  {
    path: '*',
    element: <NotFound />
  },
  {
    path: '/contact',
    element: <Contact />
  },
  {
    path: '/rinjaniTour',
    element: <Tour />
  },
  {
    path: '/trekkingSummit',
    element: <TrekkingSummit />
  },
  {
    path: '/about',
    element: <About />
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={Route} />
  </React.StrictMode>
)
