import { registerModuleRoutes } from "../../zoom/routing/routesRegistry";
import { routes } from "./routes/index";
import { navigationConfig } from "./config/navigation";
import marketingModule from "../marketing/index";
import newsletterModule from "../newsletter/index";
import { registerModuleNavigation } from "../../zoom/navigation/navigationRegistry";

export default {
  name: "crm",
  dependencies: [],
  modules: ["marketing", "newsletter"],
  install(siteName, parentModule = null, layouts = {}) {
    console.log(
      `Registrando rutas de 'crm' en sitio=${siteName}, padre=${
        parentModule || "ninguno"
      }`
    );
    // Registrar CRM como módulo raíz (independiente) salvo que explícitamente se pase un parentModule
    registerModuleRoutes("crm", routes, siteName, parentModule, layouts);
    registerModuleNavigation("crm", navigationConfig);
    // Instalar submódulos como hijos para que sus rutas queden bajo /:site/crm
    marketingModule.install(siteName, "crm", layouts);
    newsletterModule.install(siteName, "crm", layouts);
  },
};
