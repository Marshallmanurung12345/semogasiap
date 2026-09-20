import LoginPage from "../pages/login/login-page";
import RegisterPage from "../pages/register/register-page";
import HomePage from "../pages/home/home-page";
import AddStoryPage from "../pages/add/add-story-page";
import StoryDetailPage from "../pages/story/story-detail-page";

const routes = {
  "/login": LoginPage,
  "/register": RegisterPage,
  "/home": HomePage,
  "/add": AddStoryPage,
  "/story": StoryDetailPage,
};
export default routes;
