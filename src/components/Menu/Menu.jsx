import React, { useState } from "react";
import * as ReactRouter from 'react-router';
import { Menu } from "antd";
import "./Menu.css";

export default function ZoomMenu({ items, defaultItem, position = "row" }) {
  const [current, setCurrent] = useState(defaultItem || "");
  const [openKeys, setOpenKeys] = useState([]);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const menuNode = document.querySelector('.ant-menu');
      if (menuNode && !menuNode.contains(event.target)) {
        setOpenKeys([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const { useNavigate } = ReactRouter;
  const navigate = useNavigate();

  const findItemByKey = (items, key) => {
    for (const item of items) {
      if (item.key === key) return item;
      if (item.children) {
        const found = findItemByKey(item.children, key);
        if (found) return found;
      }
      if (item.type === 'group' && item.children) {
        const found = findItemByKey(item.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  const onClick = (e) => {
    setCurrent(e.key);
    const clickedItem = findItemByKey(items, e.key);
    if (clickedItem && clickedItem.url) {
      navigate(clickedItem.url);
    }
  };

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
      //openKeys={openKeys}
      //onOpenChange={setOpenKeys}
      triggerSubMenuAction="click"
    />
  );
}