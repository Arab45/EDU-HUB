import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Onboarding from "./pages/onboarding";
import Home from "./pages/home";
import Profile from "./pages/profile";
import NewPost from "./pages/newPost";
import Search from "./pages/search";
import ForgotPassword from "./pages/forgetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/home" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/new-post" element={<NewPost />} />
      <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
