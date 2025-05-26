import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { JSX } from "react/jsx-runtime";

type Props = {
  onOpen: JSX.Element;
  children: React.ReactNode;
  title: string;
  description: string;
};

const AppDrawer = ({ onOpen, children, title, description }: Props) => {
  return (
    <Drawer>
      <DrawerTrigger>{onOpen}</DrawerTrigger>
      <DrawerContent>
        <div className="container flex flex-col gap-2 pb-10">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AppDrawer;
