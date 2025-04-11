
import { Link } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-social-gray flex flex-col">
      <div className="py-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-social-blue">CircleHub</h1>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <LoginForm />
      </div>

      <footer className="py-6 text-center text-sm text-social-textSecondary">
        <div className="container mx-auto">
          <div className="flex justify-center space-x-4">
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/help" className="hover:underline">Help</Link>
          </div>
          <p className="mt-4">© 2025 CircleHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
