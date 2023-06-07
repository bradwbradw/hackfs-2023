
import { Link } from 'wouter'

const Navigation = () => {
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0 }} >
        <Link to="/"> home </Link>
        <Link to="about"> about </Link>
        <Link to="status"> status </Link>
      </div>
    </>
  );
}

export default Navigation;