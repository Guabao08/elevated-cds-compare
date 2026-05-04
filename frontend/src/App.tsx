import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CompareProvider } from "./context/CompareContext";
import Navbar from "./components/Navbar";
import CompareBar from "./components/CompareBar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import SchoolDetail from "./pages/SchoolDetail";
import Compare from "./pages/Compare";
import Recommend from "./pages/Recommend";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CompareProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/schools/:id" element={<SchoolDetail />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/recommend" element={<Recommend />} />
              </Routes>
            </main>
            <CompareBar />
          </div>
        </BrowserRouter>
      </CompareProvider>
    </QueryClientProvider>
  );
}
