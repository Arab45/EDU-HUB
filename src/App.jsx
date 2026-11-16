import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { profileSessionCleared } from "./context/profileSlice";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Onboarding from "./pages/onboarding";
import Home from "./pages/home";
import Profile from "./pages/profile";
import NewPost from "./pages/newPost";
import Search from "./pages/search";
import ForgotPassword from "./pages/forgetPassword";
import Messages from "./pages/message";
import BlogPost from "./pages/blogPost";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleSessionExpired = () => dispatch(profileSessionCleared());
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/messages" element={<Messages />} />


      <Route path="/home" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/new-post" element={<NewPost />} />
      <Route path="/posts/:postId" element={<BlogPost />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:userId" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
