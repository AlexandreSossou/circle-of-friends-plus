
import { Link } from "react-router-dom";

const NavbarLogo = () => {
  return (
    <Link to="/" className="text-heading-lg text-primary hover:text-primary/90 transition-colors">
      CircleHub
    </Link>
  );
};

export default NavbarLogo;
