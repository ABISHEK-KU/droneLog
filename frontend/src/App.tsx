import { Routes, Route } from "react-router";
import "./App.css";
import { AppSidebar } from "./components/AppSidebar";
import Header from "./components/Header";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import AirCraft from "./pages/AirCraft";

function App() {
  return (
    <>
      <Header />
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 p-4 pt-16">
              <Routes>
                <Route path="/" element={<AirCraft />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}

export default App;
