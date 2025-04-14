import React from "react";
import TabsMenu from "../tabs";
import { Plus } from "lucide-react";
import { SideSheet } from "../sheet";
import CreateProductForm from "./product-form";
import { TabsContent } from "../ui/tabs";

type Props = {
  id: string;
};

const ProductTable = ({ id }: Props) => {
  return (
    <div>
      <div>
        <h2 className="font-bold text-2xl">Products</h2>
        <p className="text-sm font-light">
          Add products to your store and set them live to accept payments from
          customers.
        </p>
      </div>
      <TabsMenu
        className="w-full flex justify-start"
        triggers={[
          { label: "All products" },
          { label: "Live" },
          { label: "Deactivated" },
        ]}
        button={
          <div className="flex-1 flex justify-end">
            <SideSheet
              description="Add products to your store and set them live to accept payments from customers"
              title="Add product"
              className="flex items-center gap-2 bg-orange-400 px-4 py-2 text-black font-semibold rounded-lg text-sm"
              trigger={
                <>
                  <Plus size={20} className="text-white" />
                  <p className="text-white">Add product</p>
                </>
              }
            >
              <CreateProductForm id={id} />
            </SideSheet>
          </div>
        }
      >
        <TabsContent value="All products">All products</TabsContent>
      </TabsMenu>
    </div>
  );
};

export default ProductTable;
