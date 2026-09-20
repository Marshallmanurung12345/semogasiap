import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { isLoggedIn, go } from "../utils";
import "../components/loading";
import "../components/story-card";
import "../components/map-view";
import "../components/app-header";

class App {
  constructor({ content }) {
    this.content = content;
  }
  async renderPage() {
    const route = getActiveRoute();
    if (!isLoggedIn() && !["/login", "/register"].includes(route))
      return go("/login");
    if (isLoggedIn() && ["/login", "/register"].includes(route))
      return go("/home");
    const page =
      routes[route] ||
      (route.startsWith("/story/") ? routes["/story"] : routes["/home"]);
    const render = async () => {
      this.content.innerHTML = await page.render();
      await page.afterRender?.();
    };
    if (document.startViewTransition) document.startViewTransition(render);
    else await render();
  }
}
export default App;
