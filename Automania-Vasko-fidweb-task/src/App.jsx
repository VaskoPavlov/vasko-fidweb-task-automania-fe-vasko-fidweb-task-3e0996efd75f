import { Routes, Route } from 'react-router-dom';
import List from './components/list/List';
import Header from './components/header/Header';
import Login from './components/login/Login';
import { UserProvider } from '../src/contexts/userContext';
import Create from './components/create/Create';
import Logout from './components/logout/Logout';
import ProtectedRoute from '../src/guards/ProtectedRoute';
import Edit from './components/edit/Edit';

function App() {
  return (
    <>
      <UserProvider>
        <Routes>
          <Route path="/user/login" element={<Login />} />
          <Route path="/user/logout" element={<Logout />} />
          <Route path="/listing/list" element={
            <>
              <Header />
              <List />
            </>
          } />
          <Route path="/listing/create" element={
            <>
              <Header />
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            </>
          } />
		  <Route path="/listing/:_id" element={
			<>
				<Header />
		  		<Edit/>
			</>
		  } />
        </Routes>
      </UserProvider>
    </>
  );
}

export default App;
