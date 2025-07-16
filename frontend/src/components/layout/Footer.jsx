import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Sardaarji Auto Parts</h3>
            <p className="text-gray-300">
              Your one-stop shop for quality automobile parts.
              We specialize in premium auto parts for all vehicle makes and models.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <address className="not-italic text-gray-300">
              <p>123 Motorcycle Lane</p>
              <p>Bike City, BC 12345</p>
              <p className="mt-2">Phone: (555) 123-4567</p>
              <p>Email: info@sardaarjiautoparts.com</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} Sardaarji Auto Parts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
