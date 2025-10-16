import React from "react";
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";

import "./Header.css";
import Logo from "@components/Logo/Logo";
import Menu from "@components/Menu/Menu";

export default function Header() {
  return (
    <div className="header">
      <div className="row">
        <div className="col header-logo">
          <Logo />
        </div>
        <div className="col header-menu">
          <Menu
            defaultItem="home"
            items={[
              { key: "home", icon: <HomeOutlined />, url: "/", label: "Home" },
              //{ key: "contacts", label: "Contacts", url: "/contacts/list" },
              { key: "projects", label: "Proyectos", url: "/admin/project" },
              { key: "products", label: "Productos", url: "/products/list" },
              {
                label: 'Contacts',
                key: 'contacts',
                icon: <SettingOutlined />,
                children: [
                  {
                    key: 'contactsList',
                    label: 'Contactos',
                    url: '/contacts/list',
                  },
                  {
                    key: 'contactGroups',
                    label: 'Grupos de Contactos',
                    url: '/contacts/groups',
                  },
                ],
              },
              {
                label: 'Flow',
                key: 'flow',
                icon: <SettingOutlined />,
                children: [
                  {
                    key: 'flowList',
                    label: 'Flow List',
                    url: '/flows',
                  }
                ],
              },
              {
                label: 'Newsletter',
                key: 'newsletter',
                icon: <SettingOutlined />,
                children: [
                  {
                    type: 'group',
                    label: 'Administrar',
                    children: [
                      { label: 'Campañas', key: 'newsletter:2', url: '/campaign/list' },
                      { label: 'Newsletters', key: 'newsletter:1', url: '/newsletter' },
                      { label: 'Logs de Email', key: 'newsletter:3', url: '/campaign/emailLogs' },
                    ],
                  },
                  {
                    type: 'group',
                    label: 'Configuración',
                    children: [
                      { label: 'Todas las configuraciones', key: 'newsletter:4', url: '/newsletter/configs' },
                    ],
                  },
                ],
              },
              {
                label: 'Editor',
                key: 'editor',
                icon: <SettingOutlined />,
                children: [
                  {
                    key: 'visualeditor',
                    label: 'Editor Visual',
                    url: '/visualeditor',
                  },
                ],
              },
              { key: "accounts", label: "Cuentas", url: "/accounts/list" },
              { key: "users", label: "Usuarios", url: "/admin/users" },
              { key: "roles", label: "Roles", url: "/admin/users/roles" },
              { key: "permissions", label: "Permisos", url: "/admin/users/permissions" },
             
            ]}
          />
        </div>
      </div>
    </div>
  );
}
