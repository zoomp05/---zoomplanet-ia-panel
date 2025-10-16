import { Breadcrumb, Layout, theme, Dropdown, Button } from "antd";
const { Header, Content, Footer } = Layout;
import { Outlet } from "react-router";
import ContextualHeader from "../components/ContextualHeader/ContextualHeader";
import RouteGuard from "../../auth/guards/RouteGuard";
import UserMenu from "../../auth/components/UserMenu";
import { adminAuthConfig } from "../config/authConfig";
import { SettingOutlined } from "@ant-design/icons";
import { useModuleNavigation } from "@hooks/useModuleNavigation";

const MainLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG, colorBgBase, colorBorder },
  } = theme.useToken();

  const { navigateContextual } = useModuleNavigation();

  const settingsMenu = {
    items: [
      {
        key: "admin-settings",
        icon: <SettingOutlined />,
        label: "Configuración",
        onClick: () => navigateContextual("settings", "module"),
      },
    ],
  };

  return (
    <RouteGuard moduleConfig={adminAuthConfig}>
      <Layout>
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            background: colorBgContainer,
            borderBottom: `1px solid ${colorBorder}`,
            justifyContent: "space-between",
          }}
        >
          <ContextualHeader />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <UserMenu />
            <Dropdown
              menu={settingsMenu}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button type="text" icon={<SettingOutlined />} />
            </Dropdown>
          </div>
        </Header>
        <Content style={{ padding: "0 48px" }}>
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[{ title: "Home" }, { title: "List" }, { title: "App" }]}
          />
          <div
            style={{
              padding: 24,
              minHeight: 380,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </RouteGuard>
  );
};
export default MainLayout;
