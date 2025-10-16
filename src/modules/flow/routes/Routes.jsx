import { Routes } from "react-router";

import AuthGuard from "../../../components/Guards/AuthGuard";
import MainLayout from "../../../layouts/MainLayout";
import Flow from "../pages/flow";

const FlowRoutes = () => {
  return (
    <Routes>
      <Route
        path="/flows"
        element={
          <AuthGuard>
            <MainLayout>
              <Flow />
            </MainLayout>
          </AuthGuard>
        }
      />
    </Routes>
  );
};

export default FlowRoutes;
