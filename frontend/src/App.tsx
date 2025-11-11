import { BrowserRouter, Route, Routes} from 'react-router-dom'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import BackendTest from './components/BackendTest'
import Register from './components/Register'
import Login from './components/Login';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home/>}/>
          <Route path="*" element={<NotFound/>}/>
          <Route path="/backend-test" element={<BackendTest/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
