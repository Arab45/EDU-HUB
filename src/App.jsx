import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { profileSessionCleared } from "./context/profileSlice";
import { clearUserId } from "./services/auth";
import LoadingState from "./components/LoadingState";

const Login = lazy(() => import("./pages/login"));
const Signup = lazy(() => import("./pages/signup"));
const Onboarding = lazy(() => import("./pages/onboarding"));
const Home = lazy(() => import("./pages/home"));
const Profile = lazy(() => import("./pages/profile"));
const NewPost = lazy(() => import("./pages/newPost"));
const Search = lazy(() => import("./pages/search"));
const ForgotPassword = lazy(() => import("./pages/forgetPassword"));
const Messages = lazy(() => import("./pages/message"));
const BlogPost = lazy(() => import("./pages/blogPost"));

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleUnauthorized = () => {
      clearUserId();
      dispatch(profileSessionCleared());
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
            <LoadingState label="Loading page..." />
          </main>
        }
      >
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
