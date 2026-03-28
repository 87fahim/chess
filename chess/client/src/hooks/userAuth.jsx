import { useContext } from 'react';
import { AuthContext } from '../components/context/AuthProvider';
const useAuth = () => useContext(AuthContext);
export default useAuth;
