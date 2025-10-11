import ModeToggle from "./ModeToggle";

function Navbar() {
  return (
    <header className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <p className="text-xl font-bold text-primary font-mono tracking-wider">
              Drone Log
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
