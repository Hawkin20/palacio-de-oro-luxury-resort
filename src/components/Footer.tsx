export default function Footer() {
  return (
    <footer className="bg-palacio-black/80 border-t border-palacio-gold/20 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-playfair text-lg font-bold text-palacio-gold mb-4">
              Palacio de Oro
            </h3>
            <p className="text-gray-400 text-sm italic">
              Where Gold Meets Comfort. Experience luxury like never before.
            </p>
          </div>
          <div>
            <h4 className="font-cinzel font-semibold text-palacio-gold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-palacio-gold">About Us</a></li>
              <li><a href="#" className="hover:text-palacio-gold">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-palacio-gold">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-cinzel font-semibold text-palacio-gold mb-4">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-palacio-gold">Room Booking</a></li>
              <li><a href="#" className="hover:text-palacio-gold">Fine Dining</a></li>
              <li><a href="#" className="hover:text-palacio-gold">Events</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-cinzel font-semibold text-palacio-gold mb-4">
              Contact
            </h4>
            <p className="text-sm text-gray-400">
              <a href="mailto:vincentecaldre25@gmail.com" className="hover:text-palacio-gold">
                vincentecaldre25@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-palacio-gold/20 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2026 Palacio de Oro. All rights reserved.
          </p>
          <p className="mt-2 text-[10px] font-cinzel text-palacio-gold/60 uppercase tracking-widest">
            Developed by Vincent Ecaldre | Educational Project
          </p>
        </div>
      </div>
    </footer>
  );
}
