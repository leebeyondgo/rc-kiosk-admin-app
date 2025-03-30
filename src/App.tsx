
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/pages/MainLayout";

function App() {
  return (
    <Router basename="/">
      <Routes>
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
